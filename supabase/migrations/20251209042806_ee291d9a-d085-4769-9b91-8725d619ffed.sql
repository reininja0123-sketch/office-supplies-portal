-- Add approved_quantity column to order_items for tracking approved vs requested quantities
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS requested_quantity integer,
ADD COLUMN IF NOT EXISTS approved_quantity integer,
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';

-- Update existing order_items to set requested_quantity = quantity for backward compatibility
UPDATE public.order_items 
SET requested_quantity = quantity, approval_status = 'pending'
WHERE requested_quantity IS NULL;

-- Add 'rejected' status option for orders
-- No schema change needed, just document that status can be: pending, processing, completed, rejected, partial

-- Create secure function to deduct stock only on admin approval (prevents client-side manipulation)
CREATE OR REPLACE FUNCTION public.approve_order_items(
  p_order_id uuid,
  p_item_approvals jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_order_item_id uuid;
  v_approved_qty integer;
  v_product_id uuid;
  v_current_stock integer;
  v_original_price numeric;
  v_new_total numeric := 0;
  v_result jsonb := '[]'::jsonb;
BEGIN
  -- Check if caller is an admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can approve orders';
  END IF;

  -- Process each item approval
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_item_approvals)
  LOOP
    v_order_item_id := (v_item->>'order_item_id')::uuid;
    v_approved_qty := (v_item->>'approved_quantity')::integer;
    
    -- Get the order item details
    SELECT oi.product_id, oi.price, p.stock_quantity
    INTO v_product_id, v_original_price, v_current_stock
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.id = v_order_item_id AND oi.order_id = p_order_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Order item % not found', v_order_item_id;
    END IF;
    
    -- Validate stock availability
    IF v_approved_qty > v_current_stock THEN
      RAISE EXCEPTION 'Insufficient stock for product. Available: %, Requested: %', v_current_stock, v_approved_qty;
    END IF;
    
    -- Update order item with approved quantity
    UPDATE order_items
    SET approved_quantity = v_approved_qty,
        quantity = v_approved_qty,
        approval_status = CASE 
          WHEN v_approved_qty = 0 THEN 'rejected'
          WHEN v_approved_qty < requested_quantity THEN 'reduced'
          ELSE 'approved'
        END
    WHERE id = v_order_item_id;
    
    -- Deduct stock if approved quantity > 0
    IF v_approved_qty > 0 THEN
      UPDATE products
      SET stock_quantity = stock_quantity - v_approved_qty
      WHERE id = v_product_id;
      
      v_new_total := v_new_total + (v_original_price * v_approved_qty);
    END IF;
    
    v_result := v_result || jsonb_build_object(
      'order_item_id', v_order_item_id,
      'approved_quantity', v_approved_qty,
      'status', CASE 
        WHEN v_approved_qty = 0 THEN 'rejected'
        WHEN v_approved_qty < (SELECT requested_quantity FROM order_items WHERE id = v_order_item_id) THEN 'reduced'
        ELSE 'approved'
      END
    );
  END LOOP;
  
  -- Update order total and status
  UPDATE orders
  SET total_amount = v_new_total,
      status = CASE 
        WHEN v_new_total = 0 THEN 'rejected'
        WHEN v_new_total < total_amount THEN 'partial'
        ELSE 'processing'
      END,
      approved_at = now(),
      approved_by = auth.uid()
  WHERE id = p_order_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'new_total', v_new_total,
    'items', v_result
  );
END;
$$;

-- Add SELECT policy for users to view their own order items
CREATE POLICY "Users can view own order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);