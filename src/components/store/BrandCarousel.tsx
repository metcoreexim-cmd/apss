import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
type Brand = Database["public"]["Tables"]["brands"]["Row"];

interface BrandCarouselProps {
  brands: Brand[];
}

export function BrandCarousel({ brands }: BrandCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Shop by Brand
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 no-scrollbar"
        >
          {brands.map((brand) => (
            <Link key={brand.id} to={`/brand/${brand.slug}`}>
              <motion.div
                whileHover={{ y: -4 }}
                className="flex-shrink-0 w-32 h-32 bg-card rounded-xl flex items-center justify-center p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={brand.logo_url || "/images/brand-placeholder.png"}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all"
                />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
