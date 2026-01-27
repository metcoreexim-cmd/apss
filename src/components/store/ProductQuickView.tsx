import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, Minus, Plus, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface ProductQuickViewProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ productId, isOpen, onClose }: ProductQuickViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-quickview", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, brands(name, slug), categories(name, slug)")
        .eq("id", productId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isOpen && !!productId,
  });

  if (!isOpen) return null;

  const images = product?.images?.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80"];
  
  const discount = product ? Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100) : 0;
  const inWishlist = product ? isInWishlist(product.id) : false;
  const inStock = product ? product.stock > 0 : false;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      mrp: Number(product.mrp),
      quantity,
      image: images[0],
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist({
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      mrp: Number(product.mrp),
      image: images[0],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Quick View</DialogTitle>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2">
            {/* Image Gallery */}
            <div className="relative bg-muted/30 aspect-square md:aspect-auto md:h-full">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                {discount > 0 && (
                  <Badge className="badge-sale">{discount}% OFF</Badge>
                )}
                {product.is_best_seller && (
                  <Badge className="badge-bestseller">Best Seller</Badge>
                )}
                {product.is_new && <Badge className="badge-new">New</Badge>}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === currentImageIndex
                          ? "bg-primary w-6"
                          : "bg-background/80"
                      )}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 flex flex-col max-h-[80vh] overflow-y-auto">
              {/* Brand & Category */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                {product.brands?.name && (
                  <span className="font-medium">{product.brands.name}</span>
                )}
                {product.brands?.name && product.categories?.name && (
                  <span>•</span>
                )}
                {product.categories?.name && (
                  <span>{product.categories.name}</span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold mb-3">{product.title}</h2>

              {/* Rating */}
              {Number(product.rating_avg) > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-1 rounded">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="text-sm font-medium">
                      {Number(product.rating_avg).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating_count} reviews
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold">
                  ₹{Number(product.price).toLocaleString()}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{Number(product.mrp).toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="text-green-600">
                      {discount}% off
                    </Badge>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Stock Status */}
              {product.stock > 0 ? (
                product.stock <= 5 ? (
                  <p className="text-destructive text-sm mb-4">
                    Only {product.stock} left in stock!
                  </p>
                ) : (
                  <p className="text-green-600 text-sm mb-4 flex items-center gap-1">
                    <Check className="h-4 w-4" /> In Stock
                  </p>
                )
              ) : (
                <p className="text-destructive text-sm mb-4">Out of Stock</p>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-auto">
                <Button
                  className="flex-1 gap-2"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!inStock || addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-4 w-4" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(inWishlist && "text-destructive border-destructive")}
                  onClick={handleToggleWishlist}
                >
                  <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                </Button>
              </div>

              {/* View Full Details Link */}
              <Link
                to={`/product/${product.slug}`}
                className="text-center text-sm text-primary hover:underline mt-4"
                onClick={onClose}
              >
                View Full Details →
              </Link>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
