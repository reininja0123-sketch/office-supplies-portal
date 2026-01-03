import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { auth, api } from "@/lib/api";
import {User} from "@/integrations/dao/types.ts"; // Import local API

interface Product {
    id: string;
    name: string;
    price: number;
}

interface CartItem {
    product: Product;
    quantity: number;
}

const Checkout = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        checkUserAndLoadCart();
    }, [navigate]);

    const checkUserAndLoadCart = async () => {
        const user = auth.getUser();
        if (!user) {
            navigate("/auth");
            return;
        }

        const userData = await api.get(`/user/${user.id}/info`);
        setUserId(userData.id);

        setFormData({
            name: userData.full_name,
            email: userData.email,
            phone: ""
        })

        const cartKey = `cart_${user.id}`;
        const savedCart = localStorage.getItem(cartKey);
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            if (parsedCart.length === 0) {
                navigate("/cart");
            }
            setCart(parsedCart);
        } else {
            navigate("/cart");
        }
    };

    const total = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send order data to local backend
            // Backend expects: { user_email, user_name, total_amount, items: [{product_id, quantity}] }
            await api.post('/orders', {
                user_email: formData.email,
                user_name: formData.name,
                user_phone: formData.phone,
                total_amount: total,
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity
                })),
                req_total_amount: total
            });

            // Clear cart
            if (userId) {
                const cartKey = `cart_${userId}`;
                localStorage.removeItem(cartKey);
            }

            toast({
                title: "Order placed successfully!",
                description: "You will receive a confirmation shortly.",
            });

            navigate("/order-success");
        } catch (error: any) {
            console.error("Error placing order:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to place order",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // ... (JSX REMAINS EXACTLY THE SAME)
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate("/cart")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cart
                    </Button>
                    <h1 className="text-2xl font-bold">Checkout</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            disabled
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            disabled
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({ ...formData, phone: e.target.value })
                                            }
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                        {loading ? "Placing Order..." : "Place Order"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                    {/* ... Summary Card same as before ... */}
                </div>
            </main>
        </div>
    );
};

export default Checkout;