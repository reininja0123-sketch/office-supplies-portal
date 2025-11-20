import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Package, ShoppingCart } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { QuantitySelector } from "@/components/QuantitySelector";

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

interface FeaturedCarouselProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  productQuantities: { [key: string]: number };
  setProductQuantities: (quantities: { [key: string]: number }) => void;
}

export const FeaturedCarousel = ({
  products,
  onProductClick,
  onAddToCart,
  productQuantities,
  setProductQuantities,
}: FeaturedCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (products.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-primary">Featured Products</h3>
          <p className="text-muted-foreground">Popular items and special offers</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="h-10 w-10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {products.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%]"
            >
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all border-primary/20">
                <Badge className="absolute top-2 right-2 z-10 bg-primary">Featured</Badge>
                <CardContent className="p-0">
                  <div
                    className="aspect-square bg-muted flex items-center justify-center overflow-hidden cursor-pointer group"
                    onClick={() => onProductClick(product)}
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
                </CardContent>
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-4 flex-1">
                    <CardTitle className="line-clamp-2 mb-2 text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {product.description}
                    </CardDescription>
                  </div>
                  <div className="space-y-3">
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
                    <QuantitySelector
                      maxQuantity={product.stock_quantity}
                      onQuantityChange={(qty) =>
                        setProductQuantities({ ...productQuantities, [product.id]: qty })
                      }
                    />
                    <Button
                      className="w-full"
                      onClick={() => onAddToCart(product, productQuantities[product.id] || 1)}
                      disabled={product.stock_quantity === 0}
                      size="lg"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
