import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export function RecentlyViewedSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products, clearHistory } = useRecentlyViewed();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Don't render if no products viewed
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-foreground"
              >
                Recently Viewed
              </motion.h2>
              <p className="text-sm text-muted-foreground">
                Products you've browsed
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

            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Products */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[250px] snap-start">
              <ProductCard
                id={product.id}
                slug={product.slug}
                title={product.title}
                price={product.price}
                mrp={product.mrp}
                image={product.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
