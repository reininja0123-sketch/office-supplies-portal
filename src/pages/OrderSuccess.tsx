import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileDown, ShoppingBag } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { downloadRISPDF } from "@/utils/generateRISPDF";
import { useToast } from "@/hooks/use-toast";

interface OrderData {
  id: string;
  user_name: string;
  user_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrderItemData {
  id: string;
  quantity: number;
  price: number;
  requested_quantity: number;
  approved_quantity: number | null;
  approval_status: string;
  products: {
    id: string;
    name: string;
    sku: string;
    stock_quantity: number;
  };
}

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [searchParams]);

  const fetchOrder = async (orderId: string) => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          id,
          quantity,
          price,
          requested_quantity,
          approved_quantity,
          approval_status,
          products:product_id (
            id,
            name,
            sku,
            stock_quantity
          )
        `)
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  const handleDownloadRIS = async () => {
    if (!order) {
      toast({
        title: "Error",
        description: "Order data not available. Please check your order history.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const items = orderItems.map((item) => ({
        product: {
          id: item.products?.id || "",
          name: item.products?.name || "Unknown",
          sku: item.products?.sku || "",
          price: item.price,
          stock_quantity: item.products?.stock_quantity || 0,
        },
        quantity: item.requested_quantity || item.quantity,
        approved_quantity: item.approved_quantity ?? undefined,
        approval_status: item.approval_status,
      }));

      await downloadRISPDF({
        orderId: order.id,
        userName: order.user_name,
        userEmail: order.user_email,
        items,
        total: order.total_amount,
        date: new Date(order.created_at),
        status: order.status,
      });

      toast({
        title: "RIS Downloaded",
        description: "Your Requisition and Issue Slip has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate RIS form.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Thank you for your order. Your RIS form has been generated. You will receive a confirmation email shortly with your order details.
          </p>
          
          {order && (
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <p className="text-sm">
                <span className="text-muted-foreground">Order ID:</span>{" "}
                <span className="font-medium">{order.id.slice(0, 8).toUpperCase()}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Status:</span>{" "}
                <span className="font-medium capitalize">{order.status}</span>
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              onClick={handleDownloadRIS}
              disabled={loading || !order}
              className="w-full"
            >
              <FileDown className="mr-2 h-4 w-4" />
              {loading ? "Generating..." : "Download RIS Form"}
            </Button>
            
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View Order History
            </Button>
            
            <Button onClick={() => navigate("/")} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccess;
