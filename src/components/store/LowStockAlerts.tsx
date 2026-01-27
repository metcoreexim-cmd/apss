import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LOW_STOCK_THRESHOLD = 5;

interface LowStockItem {
  id: string;
  title: string;
  image: string;
  stock: number;
  slug: string;
}

export function LowStockAlerts() {
  const { items: wishlistItems } = useWishlist();
  const notifiedRef = useRef<Set<string>>(new Set());

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ["wishlist-stock", wishlistItems.map((i) => i.productId)],
    queryFn: async () => {
      if (wishlistItems.length === 0) return [];

      const productIds = wishlistItems.map((item) => item.productId);

      const { data, error } = await supabase
        .from("products")
        .select("id, title, images, stock, slug")
        .in("id", productIds)
        .eq("is_active", true)
        .lte("stock", LOW_STOCK_THRESHOLD)
        .gt("stock", 0);

      if (error) throw error;

      return (data || []).map((p) => ({
        id: p.id,
        title: p.title,
        image: p.images?.[0] || "",
        stock: p.stock,
        slug: p.slug,
      })) as LowStockItem[];
    },
    enabled: wishlistItems.length > 0,
    refetchInterval: 60000, // Refetch every minute
  });

  // Show toast notifications for newly low stock items
  useEffect(() => {
    lowStockItems.forEach((item) => {
      if (!notifiedRef.current.has(item.id)) {
        notifiedRef.current.add(item.id);
        toast.warning(`Low stock alert: "${item.title}" only has ${item.stock} left!`, {
          duration: 5000,
          action: {
            label: "View",
            onClick: () => window.location.href = `/product/${item.slug}`,
          },
        });
      }
    });
  }, [lowStockItems]);

  if (wishlistItems.length === 0 || lowStockItems.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {lowStockItems.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {lowStockItems.length}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h4 className="font-semibold">Low Stock Alerts</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Items in your wishlist running low
          </p>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {lowStockItems.map((item) => (
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
                <Badge
                  variant="outline"
                  className="mt-1 text-destructive border-destructive"
                >
                  Only {item.stock} left!
                </Badge>
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
