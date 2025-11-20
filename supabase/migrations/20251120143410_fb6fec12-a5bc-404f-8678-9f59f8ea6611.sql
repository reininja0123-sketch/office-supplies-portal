-- Create product_variants table for size, color, and other options
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_type TEXT NOT NULL, -- 'size', 'color', etc.
  variant_value TEXT NOT NULL, -- 'Small', 'Red', etc.
  price_adjustment NUMERIC DEFAULT 0, -- Additional cost for this variant
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view product variants"
  ON public.product_variants
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert product variants"
  ON public.product_variants
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product variants"
  ON public.product_variants
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product variants"
  ON public.product_variants
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);

-- Enable realtime for product variants
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_variants;