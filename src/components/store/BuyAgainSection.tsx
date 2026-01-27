import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface BuyAgainProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  mrp: number;
  image: string;
  rating: number;
  ratingCount: number;
  isBestSeller: boolean;
  isNew: boolean;
  stock: number;
  purchaseCount: number;
}

export function BuyAgainSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const { data: buyAgainProducts = [], isLoading } = useQuery({
    queryKey: ["buy-again-products", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch user's orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("items")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (ordersError) throw ordersError;
      if (!orders || orders.length === 0) return [];

      // Extract unique product IDs and count purchases
      const productPurchases = new Map<string, number>();
      orders.forEach((order) => {
        const items = order.items as unknown as OrderItem[] | null;
        if (items && Array.isArray(items)) {
          items.forEach((item) => {
            const current = productPurchases.get(item.id) || 0;
            productPurchases.set(item.id, current + item.quantity);
          });
        }
      });

      if (productPurchases.size === 0) return [];

      const productIds = Array.from(productPurchases.keys());

      // Fetch current product details
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)
        .eq("is_active", true);

      if (productsError) throw productsError;
      if (!products) return [];

      // Map products with purchase count for sorting
      const mappedProducts: BuyAgainProduct[] = products.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        price: Number(p.price),
        mrp: Number(p.mrp),
        image: p.images?.[0] || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
        rating: Number(p.rating_avg) || 0,
        ratingCount: p.rating_count || 0,
        isBestSeller: p.is_best_seller || false,
        isNew: p.is_new || false,
        stock: p.stock || 0,
        purchaseCount: productPurchases.get(p.id) || 0,
      }));

      // Sort by purchase frequency
      return mappedProducts.sort((a, b) => b.purchaseCount - a.purchaseCount).slice(0, 10);
    },
    enabled: !!user,
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Don't render if user is not logged in or no products
  if (!user || (isLoading === false && buyAgainProducts.length === 0)) {
    return null;
  }

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-foreground"
              >
                Buy Again
              </motion.h2>
              <p className="text-sm text-muted-foreground">
                Products you've purchased before
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Scroll Buttons */}
            <div className="hidden md:flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Link to="/account?tab=orders">
              <Button variant="link" className="text-primary">
                View Order History →
              </Button>
            </Link>
          </div>
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[250px] space-y-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
          >
            {buyAgainProducts.map((product) => (
              <div key={product.id} className="min-w-[250px] snap-start">
                <ProductCard
                  id={product.id}
                  slug={product.slug}
                  title={product.title}
                  price={product.price}
                  mrp={product.mrp}
                  image={product.image}
                  rating={product.rating}
                  ratingCount={product.ratingCount}
                  isBestSeller={product.isBestSeller}
                  isNew={product.isNew}
                  stock={product.stock}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
