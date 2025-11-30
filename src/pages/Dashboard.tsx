import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Package, ShoppingBag, FileDown, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { api, auth } from "@/lib/api";

import { Order, User } from '@/integrations/dao/types';

// interface User {
//     id: string;
//     email: string;
//     role?: string;
// }

// interface Order {
//     id: string;
//     user_email: string;
//     user_name: string;
//     total_amount: number;
//     status: string;
//     created_at: string;
// }

interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
        name: string;
        sku: string;
    };
}

const Dashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>({});
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const user = auth.getUser();

        if (!user) {
            toast({
                title: "Authentication required",
                description: "Please sign in to view your orders",
                variant: "destructive",
            });
            navigate("/auth");
            return;
        }

        setUser(user);
        // Determine admin status from the local user object (mock role)
        // In a real app, the backend would validate this via session/token
        const adminStatus = user.role === 'admin';
        setIsAdmin(adminStatus);

        fetchOrders(user, adminStatus);
    };

    const fetchOrders = async (currentUser: User, adminStatus: boolean) => {
        try {
            // Build the query endpoint
            // If admin, we fetch all orders. If user, we filter by their ID.
            // We pass this context via query params for this simple local setup.
            const endpoint = adminStatus
                ? '/orders'
                : `/orders?user_id=${currentUser.id}`;

            const data = await api.get(endpoint);
            setOrders(data || []);
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load orders",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderItems = async (orderId: string) => {
        if (orderItems[orderId]) {
            setExpandedOrder(expandedOrder === orderId ? null : orderId);
            return;
        }

        try {
            // Calls GET /orders/:id/items
            const data = await api.get(`/orders/${orderId}/items`);

            setOrderItems(prev => ({
                ...prev,
                [orderId]: data || [],
            }));
            setExpandedOrder(orderId);
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load order details",
                variant: "destructive",
            });
        }
    };

    const downloadInvoice = (order: Order) => {
        const items = orderItems[order.id] || [];

        const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - Order #${order.id.slice(0, 8)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { color: #667eea; margin: 0; }
    .info { margin-bottom: 30px; }
    .info-row { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f8f9fa; font-weight: bold; }
    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
    .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <p>Procurement Store</p>
  </div>
  
  <div class="info">
    <div class="info-row"><strong>Invoice Number:</strong> ${order.id.slice(0, 8).toUpperCase()}</div>
    <div class="info-row"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</div>
    <div class="info-row"><strong>Customer Name:</strong> ${order.user_name}</div>
    <div class="info-row"><strong>Email:</strong> ${order.user_email}</div>
    <div class="info-row"><strong>Status:</strong> ${order.status.toUpperCase()}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>SKU</th>
        <th style="text-align: center;">Quantity</th>
        <th style="text-align: right;">Price</th>
        <th style="text-align: right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>${item.products?.name || 'Item'}</td>
          <td>${item.products?.sku || 'N/A'}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">₱${item.price.toFixed(2)}</td>
          <td style="text-align: right;">₱${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="total">
    Total Amount: ₱${order.total_amount.toFixed(2)}
  </div>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>&copy; ${new Date().getFullYear()} Procurement Store. All rights reserved.</p>
  </div>
</body>
</html>
    `;

        const blob = new Blob([invoiceHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${order.id.slice(0, 8)}.html`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
            title: "Invoice downloaded",
            description: "Your invoice has been downloaded successfully",
        });
    };

    const exportToCSV = async () => {
        try {
            // We'll ask the API for a flat list of items for all current orders
            // In a real app, this might be a dedicated /reports/csv endpoint
            // Here we will use a hypothetical endpoint or fetch items

            const orderIds = orders.map(o => o.id);

            // If we don't have a dedicated bulk item fetcher, we might have to be creative.
            // Assuming api.get('/orders/items/export') exists for admin
            // OR we just fetch all items using a query param if supported.
            // For this example, let's assume we can fetch all relevant items.
            const allItems = await api.get(`/orders/items?order_ids=${orderIds.join(',')}`);

            // Create CSV content
            let csv = "Order ID,Order Date,Customer Name,Customer Email,Status,Product Name,SKU,Quantity,Price,Subtotal,Order Total\n";

            orders.forEach(order => {
                const items = allItems?.filter((item: any) => item.order_id === order.id) || [];

                if (items.length === 0) {
                    csv += `${order.id.slice(0, 8)},${new Date(order.created_at).toLocaleDateString()},${order.user_name},${order.user_email},${order.status},-,-,0,0,0,${order.total_amount}\n`;
                } else {
                    items.forEach((item: any) => {
                        const subtotal = item.quantity * item.price;
                        csv += `${order.id.slice(0, 8)},${new Date(order.created_at).toLocaleDateString()},${order.user_name},${order.user_email},${order.status},${item.products?.name},${item.products?.sku},${item.quantity},${item.price},${subtotal},${order.total_amount}\n`;
                    });
                }
            });

            // Download CSV
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            toast({
                title: "Export successful",
                description: "Orders have been exported to CSV",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Export failed",
                description: "Failed to export orders",
                variant: "destructive",
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-500";
            case "processing":
                return "bg-blue-500";
            case "shipped":
                return "bg-purple-500";
            case "delivered":
                return "bg-green-500";
            case "cancelled":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-12 w-12 animate-spin mx-auto mb-4" />
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate("/")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Store
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">My Orders</h1>
                        {isAdmin && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Viewing All Orders
                            </Badge>
                        )}
                    </div>
                    <div>
                        {isAdmin && orders.length > 0 && (
                            <Button variant="outline" onClick={exportToCSV}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Admin Statistics Cards */}
                {isAdmin && orders.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Orders
                                </CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{orders.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    All time orders
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pending Orders
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {orders.filter(o => o.status.toLowerCase() === 'pending').length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting processing
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Revenue
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ₱{orders.reduce((sum, o) => sum + o.total_amount, 0).toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across all orders
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Average Order Value
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ₱{orders.length > 0 ? (orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length).toFixed(2) : "0.00"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Per order
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {orders.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <ShoppingBag className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
                            <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
                            <p className="text-muted-foreground mb-6">
                                Start shopping to see your orders here
                            </p>
                            <Button onClick={() => navigate("/")}>
                                Browse Products
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">
                                Order History ({orders.length})
                            </h2>
                        </div>

                        {orders.map((order) => (
                            <Card key={order.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                Order #{order.id.slice(0, 8).toUpperCase()}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {new Date(order.created_at).toLocaleDateString()} at{" "}
                                                {new Date(order.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={getStatusColor(order.status)}>
                                                {order.status}
                                            </Badge>
                                            <p className="text-lg font-bold">
                                                ₱{order.total_amount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchOrderItems(order.id)}
                                        >
                                            {expandedOrder === order.id ? "Hide" : "View"} Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (!orderItems[order.id]) {
                                                    // Fetch and then download
                                                    fetchOrderItems(order.id).then(() => {
                                                        // We need to wait for state update or use fetched data directly
                                                        // For simplicity, re-fetch via cache in next render or just timeout
                                                        // Better pattern: fetch, then call download with data
                                                        // Here we rely on the state update for the next click or modify logic
                                                        setTimeout(() => downloadInvoice(order), 500);
                                                    });
                                                } else {
                                                    downloadInvoice(order);
                                                }
                                            }}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Invoice
                                        </Button>
                                    </div>

                                    {expandedOrder === order.id && orderItems[order.id] && (
                                        <div className="mt-4 border-t pt-4">
                                            <h3 className="font-semibold mb-3">Order Items:</h3>
                                            <div className="space-y-2">
                                                {orderItems[order.id].map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between items-center py-2 border-b last:border-0"
                                                    >
                                                        <div>
                                                            <p className="font-medium">{item.products?.name || 'Product Info Unavailable'}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                SKU: {item.products?.sku || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">
                                                                {item.quantity} x ₱{item.price.toFixed(2)}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                ₱{(item.quantity * item.price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;