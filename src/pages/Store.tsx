import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface CartItem {
  product: Product;
  quantity: number;
}

const Store = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

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

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock_quantity) {
        setCart(
          cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
        toast({
          title: "Updated cart",
          description: `${product.name} quantity increased`,
        });
      } else {
        toast({
          title: "Out of stock",
          description: "Cannot add more items than available",
          variant: "destructive",
        });
      }
    } else {
      if (product.stock_quantity > 0) {
        setCart([...cart, { product, quantity: 1 }]);
        toast({
          title: "Added to cart",
          description: `${product.name} added to cart`,
        });
      } else {
        toast({
          title: "Out of stock",
          description: "This item is currently unavailable",
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
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Procurement Store</h1>
          <Button
            variant="outline"
            onClick={() => navigate("/cart")}
            className="relative"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Cart
            {cartItemCount > 0 && (
              <Badge className="ml-2 absolute -top-2 -right-2">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Common Use Items</h2>
          <p className="text-muted-foreground">
            Browse our catalog of procurement supplies
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader>
                  <div className="aspect-square bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">
                      ₱{product.price.toFixed(2)}
                    </span>
                    <Badge variant={product.stock_quantity > 0 ? "default" : "secondary"}>
                      {product.stock_quantity > 0
                        ? `${product.stock_quantity} in stock`
                        : "Out of stock"}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity === 0}
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Store;