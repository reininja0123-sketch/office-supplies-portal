import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Package, Grid3x3, LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuantitySelector } from "@/components/QuantitySelector";
import ProductDetailModal from "@/components/ProductDetailModal";
import { api, auth } from "@/lib/api"; // Import our new local API

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    sku: string;
    image_url: string;
    category_id: string;
}

interface Category {
    id: string;
    name: string;
    description: string;
}

interface CartItem {
    product: Product;
    quantity: number;
}

const Store = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        checkAuth();
    }, []);

    useEffect(() => {
        loadCartFromStorage();
    }, [userId]);

    useEffect(() => {
        // Re-fetch or filter locally.
        // Since we fetch all products, we can just filter the display logic below
        // or call API with query param: api.get(`/products?category=${selectedCategory}`)
        fetchProducts();
    }, [selectedCategory]);

    useEffect(() => {
        const cartKey = userId ? `cart_${userId}` : 'cart_guest';
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }, [cart, userId]);

    // Removed Supabase Realtime Subscription (Not supported natively in standard MariaDB setup)
    // You would implement polling or WebSockets (Socket.io) here for a real equivalent.

    const loadCartFromStorage = () => {
        const cartKey = userId ? `cart_${userId}` : 'cart_guest';
        const savedCart = localStorage.getItem(cartKey);
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        } else {
            setCart([]);
        }
    };

    const checkAuth = () => {
        const user = auth.getUser();
        setIsAuthenticated(!!user);
        setUserId(user?.id || null);
        if (user && user.role === 'admin') {
            setIsAdmin(true);
        }
    };

    const handleLogout = async () => {
        if (userId) {
            const cartKey = `cart_${userId}`;
            localStorage.removeItem(cartKey);
        }
        await auth.signOut();
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserId(null);
        setCart([]);
        toast({
            title: "Logged out successfully",
            description: "Your cart has been cleared",
        });
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim().length > 0) {
            const filtered = products.filter(
                (p) =>
                    p.name.toLowerCase().includes(query.toLowerCase()) ||
                    p.sku.toLowerCase().includes(query.toLowerCase())
            );
            setSearchSuggestions(filtered.slice(0, 5));
            setShowSuggestions(true);
        } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (product: Product) => {
        setSearchQuery(product.name);
        setShowSuggestions(false);
        handleImageClick(product);
    };

    const handleImageClick = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const fetchCategories = async () => {
        try {
            // Calls GET /api/categories
            const data = await api.get('/categories');
            setCategories(data || []);
        } catch (error: any) {
            console.error(error);
            // Optional: don't toast on load unless critical
        }
    };

    const fetchProducts = async () => {
        try {
            // Calls GET /api/products
            const data = await api.get('/products');
            let filteredData = data || [];

            if (selectedCategory) {
                filteredData = filteredData.filter((p: Product) => p.category_id === selectedCategory);
            }

            setProducts(filteredData);
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to load products. Is the server running?",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addToCart = (product: Product, quantity: number = 1) => {
        const existingItem = cart.find((item) => item.product.id === product.id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity <= product.stock_quantity) {
                setCart(
                    cart.map((item) =>
                        item.product.id === product.id
                            ? { ...item, quantity: newQuantity }
                            : item
                    )
                );
                toast({
                    title: "Updated cart",
                    description: `${product.name} quantity updated to ${newQuantity}`,
                });
            } else {
                toast({
                    title: "Out of stock",
                    description: `Only ${product.stock_quantity} items available`,
                    variant: "destructive",
                });
            }
        } else {
            if (product.stock_quantity >= quantity) {
                setCart([...cart, { product, quantity }]);
                toast({
                    title: "Added to cart",
                    description: `${quantity} x ${product.name} added to cart`,
                });
            } else {
                toast({
                    title: "Out of stock",
                    description: `Only ${product.stock_quantity} items available`,
                    variant: "destructive",
                });
            }
        }
    };

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Package className="animate-spin h-12 w-12" />
            </div>
        );
    }

    // ... (REST OF THE JSX IS EXACTLY THE SAME)
    // Just ensure <ProductDetailModal> props match
    return (
        <div className="min-h-screen bg-background">
            {/* ... (Previous Header/Nav JSX) ... */}
            <div className="bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
                    <div className="flex gap-4">
                        <span>Procurement Service - PhilGEPS</span>
                    </div>
                    <div className="flex gap-4">
                        {isAuthenticated ? (
                            <>
                                <Button variant="link" size="sm" className="text-primary-foreground" onClick={() => navigate("/dashboard")}>
                                    My Orders
                                </Button>
                                {isAdmin && (
                                    <Button variant="link" size="sm" className="text-primary-foreground" onClick={() => navigate("/admin")}>
                                        Admin
                                    </Button>
                                )}
                                <Button variant="link" size="sm" className="text-primary-foreground" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="link" size="sm" className="text-primary-foreground" onClick={() => navigate("/auth")}>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ... Copy the Header, Breadcrumb, Search, and Grid JSX from original file ... */}

            <main className="container mx-auto px-4 py-8">
                {/* ... JSX Content ... */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Grid3x3 className="h-5 w-5" />
                                    Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant={selectedCategory === null ? "default" : "ghost"}
                                    className="w-full justify-start"
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    All Products
                                </Button>
                                {categories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant={selectedCategory === category.id ? "default" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                // ... Card JSX ...
                                <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                    {/* ... Card Content ... */}
                                    <CardHeader className="p-0">
                                        <div
                                            className="aspect-square bg-muted rounded-t-lg flex items-center justify-center overflow-hidden cursor-pointer"
                                            onClick={() => handleImageClick(product)}
                                        >
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                                />
                                            ) : (
                                                <Package className="h-20 w-20 text-muted-foreground" />
                                            )}
                                        </div>
                                    </CardHeader>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="mb-4">
                                            <CardTitle className="line-clamp-2 mb-2 text-lg">{product.name}</CardTitle>
                                            <CardDescription className="line-clamp-2 text-sm">
                                                {product.description}
                                            </CardDescription>
                                            <p className="text-xs text-muted-foreground mt-2">SKU: {product.sku}</p>
                                        </div>
                                        <CardContent className="flex-1 p-0 mb-4">
                                            <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-primary">
                            ₱{product.price.toFixed(2)}
                          </span>
                                                <Badge variant={product.stock_quantity > 0 ? "default" : "secondary"}>
                                                    {product.stock_quantity > 0
                                                        ? `${product.stock_quantity} units`
                                                        : "Out of stock"}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-0">
                                            <div className="w-full space-y-3">
                                                <QuantitySelector
                                                    maxQuantity={product.stock_quantity}
                                                    onQuantityChange={(qty) => setProductQuantities({ ...productQuantities, [product.id]: qty })}
                                                />
                                                <Button
                                                    className="w-full"
                                                    onClick={() => addToCart(product, productQuantities[product.id] || 1)}
                                                    disabled={product.stock_quantity === 0}
                                                    size="lg"
                                                >
                                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                                    Add to Cart
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <ProductDetailModal
                product={selectedProduct}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onAddToCart={addToCart}
            />
        </div>
    );
};

export default Store;