import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Share2, Star, Truck, Shield, RotateCcw, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Variant {
  type: string;
  options: string[];
}

interface ProductInfoProps {
  id: string;
  title: string;
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  stock: number;
  sku?: string;
  description?: string;
  variants?: Variant[];
  image: string;
  isBestSeller?: boolean;
  isNew?: boolean;
}

export function ProductInfo({
  id,
  title,
  price,
  mrp,
  rating,
  ratingCount,
  stock,
  sku,
  variants = [],
  image,
  isBestSeller,
  isNew,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const discount = Math.round(((mrp - price) / mrp) * 100);
  const inWishlist = isInWishlist(id);
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, stock)));
  };

  const handleAddToCart = () => {
    const variantString = Object.entries(selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    addItem({
      productId: id,
      title,
      price,
      mrp,
      quantity,
      image,
      variant: variantString || undefined,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {isBestSeller && <Badge className="badge-bestseller">Best Seller</Badge>}
        {isNew && <Badge className="badge-new">New Arrival</Badge>}
        {discount > 0 && <Badge className="badge-sale">{discount}% OFF</Badge>}
      </div>

      {/* Title */}
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
        {title}
      </h1>

      {/* Rating */}
      {rating > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-success/10 text-success px-2 py-1 rounded-md">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground">
            ({ratingCount.toLocaleString()} reviews)
          </span>
        </div>
      )}

      {/* Price */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-foreground">
            ₹{price.toLocaleString()}
          </span>
          {discount > 0 && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                ₹{mrp.toLocaleString()}
              </span>
              <span className="text-success font-semibold">
                Save ₹{(mrp - price).toLocaleString()}
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
      </div>

      <Separator />

      {/* Variants */}
      {variants.length > 0 && (
        <div className="space-y-4">
          {variants.map((variant) => (
            <div key={variant.type}>
              <p className="font-medium mb-2">
                {variant.type}:{" "}
                <span className="text-muted-foreground">
                  {selectedVariants[variant.type] || "Select"}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variant.options.map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [variant.type]: option,
                      }))
                    }
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-all",
                      selectedVariants[variant.type] === option
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-2">
        <p className="font-medium">Quantity</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-r-none"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-l-none"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Stock status */}
          {isOutOfStock ? (
            <Badge variant="destructive">Out of Stock</Badge>
          ) : isLowStock ? (
            <Badge variant="outline" className="text-destructive border-destructive">
              Only {stock} left!
            </Badge>
          ) : (
            <span className="text-sm text-success flex items-center gap-1">
              <Check className="h-4 w-4" /> In Stock
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          className="flex-1 btn-primary-glow"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
        <Button
          size="lg"
          variant="outline"
          className={cn(inWishlist && "text-destructive border-destructive")}
          onClick={() => toggleWishlist({ productId: id, title, price, mrp, image })}
        >
          <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
        </Button>
        <Button size="lg" variant="outline" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <Separator />

      {/* Delivery Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg"
        >
          <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Free Delivery</p>
            <p className="text-xs text-muted-foreground">On orders above ₹499</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg"
        >
          <RotateCcw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Easy Returns</p>
            <p className="text-xs text-muted-foreground">7 days return policy</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg"
        >
          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Secure Payment</p>
            <p className="text-xs text-muted-foreground">100% secure checkout</p>
          </div>
        </motion.div>
      </div>

      {/* SKU */}
      {sku && (
        <p className="text-sm text-muted-foreground">
          SKU: <span className="font-mono">{sku}</span>
        </p>
      )}
    </div>
  );
}