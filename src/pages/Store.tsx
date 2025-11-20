import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Package, Grid3x3, LogOut, LogIn, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuantitySelector } from "@/components/QuantitySelector";
import ProductDetailModal from "@/components/ProductDetailModal";

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
    if (userId) {
      loadCartFromStorage();
    }
  }, [userId]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    if (userId) {
      const cartKey = `cart_${userId}`;
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, userId]);

  useEffect(() => {
    // Subscribe to realtime product updates
    const channel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [payload.new as Product, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => 
              prev.map(p => p.id === payload.new.id ? payload.new as Product : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
          
          toast({
            title: "Inventory Updated",
            description: "Product information has been updated",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCartFromStorage = () => {
    if (!userId) return;
    const cartKey = `cart_${userId}`;
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      setCart([]);
    }
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    setUserId(user?.id || null);
    
    // Check if user is admin
    if (user) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!roles);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserId(null);
    setCart([]);
    toast({
      title: "Logged out successfully",
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
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from("products")
        .select("*");
      
      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Package className="animate-spin h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
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
                <Button variant="link" size="sm" className="text-primary-foreground" onClick={() => navigate("/auth")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b bg-background sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Package className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Procurement Service</h1>
                <p className="text-sm text-muted-foreground">Philippine Government Electronic Procurement System</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/cart")}
              className="relative"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Cart
              {cartItemCount > 0 && (
                <Badge className="ml-2 absolute -top-2 -right-2 bg-destructive">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Home</span>
            <span>/</span>
            <span>What We Sell</span>
            <span>/</span>
            <span className="text-foreground font-medium">Common Use Items</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title Section */}
        <div className="mb-8 pb-6 border-b">
          <h2 className="text-4xl font-bold mb-3 text-primary">Common Use Items</h2>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Browse our comprehensive catalog of government procurement supplies. All items are pre-approved for common use and comply with PhilGEPS standards.
          </p>
          
          {/* Search Bar with Autocomplete */}
          <div className="mt-6 relative max-w-md">
            <Input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pr-10"
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <Card className="absolute top-full mt-1 w-full z-50 max-h-80 overflow-auto">
                <CardContent className="p-2">
                  {searchSuggestions.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 hover:bg-muted cursor-pointer rounded-md flex items-center gap-3"
                      onClick={() => selectSuggestion(product)}
                    >
                      <div className="w-12 h-12 bg-muted rounded flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Package className="w-full h-full p-2 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <p className="font-semibold text-primary">₱{product.price.toFixed(2)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-primary">Featured Products</h3>
              <p className="text-muted-foreground">Popular items and special offers</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <Card key={product.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all border-primary/20">
                <Badge className="absolute top-2 right-2 z-10 bg-primary">Featured</Badge>
                <CardHeader className="p-0">
                  <div 
                    className="aspect-square bg-muted flex items-center justify-center overflow-hidden cursor-pointer group"
                    onClick={() => handleImageClick(product)}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <Package className="h-16 w-16 text-muted-foreground" />
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-4">
                    <CardTitle className="line-clamp-2 mb-2 text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {product.description}
                    </CardDescription>
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Sidebar */}
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
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground px-2">
                    No categories available
                  </p>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {selectedCategory && (
              <div className="mb-6">
                <h3 className="text-2xl font-bold">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h3>
                <p className="text-muted-foreground">
                  {categories.find(c => c.id === selectedCategory)?.description}
                </p>
              </div>
            )}

            {filteredProducts.length === 0 && !loading ? (
              <div className="text-center py-16 bg-muted/20 rounded-lg">
                <Package className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? `No products found matching "${searchQuery}".`
                    : selectedCategory 
                      ? "No products found in this category."
                      : "Products will be displayed here once they are added to the inventory."}
                </p>
                {!selectedCategory && !searchQuery && (
                  <Button onClick={() => navigate("/admin")} variant="outline">
                    Go to Admin Panel
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
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
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-3">About Procurement Service</h3>
              <p className="text-sm text-muted-foreground">
                Providing quality common use supplies and services to government agencies through the Philippine Government Electronic Procurement System.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate("/")}>Home</Button></li>
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate("/cart")}>Shopping Cart</Button></li>
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate("/admin")}>Admin Panel</Button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Contact Information</h3>
              <p className="text-sm text-muted-foreground">
                For inquiries about procurement services and product availability.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 Procurement Service - PhilGEPS. All rights reserved.</p>
          </div>
        </div>
      </footer>

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