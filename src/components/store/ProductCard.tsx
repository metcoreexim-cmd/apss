import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Eye, GitCompare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useCompare } from "@/hooks/useCompare";
import { ProductQuickView } from "./ProductQuickView";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  mrp: number;
  image: string;
  rating?: number;
  ratingCount?: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  stock?: number;
}

export function ProductCard({
  id,
  slug,
  title,
  price,
  mrp,
  image,
  rating = 0,
  ratingCount = 0,
  isBestSeller = false,
  isNew = false,
  stock = 10,
}: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addProduct, isInCompare } = useCompare();
  const discount = Math.round(((mrp - price) / mrp) * 100);
  const inWishlist = isInWishlist(id);
  const inCompare = isInCompare(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: id,
      title,
      price,
      mrp,
      quantity: 1,
      image,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ productId: id, title, price, mrp, image });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addProduct({
      id,
      slug,
      title,
      price,
      mrp,
      image,
      rating,
      ratingCount,
      stock,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
        
        <Link to={`/product/${slug}`} className="block">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary/50 to-muted/50">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Badges with enhanced styling */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
              {discount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 font-bold px-2.5 py-1 shadow-lg">
                    {discount}% OFF
                  </Badge>
                </motion.div>
              )}
              {isBestSeller && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-semibold shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Best Seller
                </Badge>
              )}
              {isNew && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 font-semibold shadow-lg">
                  New
                </Badge>
              )}
            </div>

            {/* Action Buttons - Top Right */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "bg-white/90 backdrop-blur-md hover:bg-white shadow-lg h-9 w-9 rounded-full border border-border/50",
                    inWishlist && "text-red-500 bg-red-50"
                  )}
                  onClick={handleToggleWishlist}
                >
                  <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/90 backdrop-blur-md hover:bg-white shadow-lg h-9 w-9 rounded-full border border-border/50"
                    onClick={handleQuickView}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "bg-white/90 backdrop-blur-md hover:bg-white shadow-lg h-9 w-9 rounded-full border border-border/50",
                      inCompare && "text-primary bg-primary/10"
                    )}
                    onClick={handleToggleCompare}
                    disabled={inCompare}
                  >
                    <GitCompare className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            {/* Quick Add Button */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-20"
            >
              <Button
                className="w-full bg-white text-foreground hover:bg-primary hover:text-primary-foreground font-semibold rounded-xl shadow-xl transition-all duration-300"
                onClick={handleAddToCart}
                disabled={stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4 relative">
            {/* Rating with stars */}
            {rating > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-3.5 w-3.5",
                        star <= Math.round(rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({ratingCount})
                </span>
              </div>
            )}

            {/* Title */}
            <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-300 leading-snug">
              {title}
            </h3>

            {/* Price with enhanced styling */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl font-bold text-primary">
                ₹{price.toLocaleString()}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{mrp.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                    Save ₹{(mrp - price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            {stock > 0 && stock <= 5 && (
              <motion.p
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xs font-medium text-orange-600 mt-2 flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Only {stock} left in stock!
              </motion.p>
            )}
          </div>
        </Link>
      </motion.div>

      {/* Quick View Modal */}
      <ProductQuickView
        productId={id}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
