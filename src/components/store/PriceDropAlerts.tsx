import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useWishlist, WishlistItem } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PriceDropItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  slug: string;
  oldPrice: number;
  newPrice: number;
  dropPercent: number;
}

export function PriceDropAlerts() {
  const { items: wishlistItems } = useWishlist();
  const notifiedRef = useRef<Set<string>>(new Set());

  const { data: priceDropItems = [] } = useQuery({
    queryKey: ["wishlist-price-drops", wishlistItems.map((i) => i.productId)],
    queryFn: async () => {
      if (wishlistItems.length === 0) return [];

      const productIds = wishlistItems.map((item) => item.productId);

      const { data, error } = await supabase
        .from("products")
        .select("id, title, images, price, slug")
        .in("id", productIds)
        .eq("is_active", true);

      if (error) throw error;

      const drops: PriceDropItem[] = [];

      data?.forEach((product) => {
        const wishlistItem = wishlistItems.find((w) => w.productId === product.id);
        if (wishlistItem && wishlistItem.addedPrice) {
          const currentPrice = Number(product.price);
          const oldPrice = wishlistItem.addedPrice;

          if (currentPrice < oldPrice) {
            const dropPercent = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
            drops.push({
              id: product.id,
              productId: product.id,
              title: product.title,
              image: product.images?.[0] || "",
              slug: product.slug,
              oldPrice,
              newPrice: currentPrice,
              dropPercent,
            });
          }
        }
      });

      return drops.sort((a, b) => b.dropPercent - a.dropPercent);
    },
    enabled: wishlistItems.length > 0,
    refetchInterval: 60000, // Refetch every minute
  });

  // Show toast notifications for price drops
  useEffect(() => {
    priceDropItems.forEach((item) => {
      if (!notifiedRef.current.has(item.id)) {
        notifiedRef.current.add(item.id);
        toast.success(
          `Price drop! "${item.title}" is now ₹${item.newPrice.toLocaleString()} (${item.dropPercent}% off)`,
          {
            duration: 6000,
            action: {
              label: "View",
              onClick: () => (window.location.href = `/product/${item.slug}`),
            },
          }
        );
      }
    });
  }, [priceDropItems]);

  if (wishlistItems.length === 0 || priceDropItems.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Tag className="h-5 w-5" />
          <AnimatePresence>
            {priceDropItems.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {priceDropItems.length}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 border-b bg-green-50 dark:bg-green-950/30">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-green-600" />
            <h4 className="font-semibold text-green-700 dark:text-green-400">
              Price Drops!
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Prices dropped on items in your wishlist
          </p>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {priceDropItems.map((item) => (
            <Link
              key={item.id}
              to={`/product/${item.slug}`}
              className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b last:border-0"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary/30 flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-green-600">
                    ₹{item.newPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{item.oldPrice.toLocaleString()}
                  </span>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    {item.dropPercent}% OFF
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="p-3 border-t bg-muted/30">
          <Link to="/wishlist">
            <Button variant="outline" size="sm" className="w-full">
              View Wishlist
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
