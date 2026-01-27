import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";

interface Product {
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

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  scrollable?: boolean;
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllLink,
  scrollable = false,
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl md:text-3xl font-bold text-foreground"
            >
              {title}
            </motion.h2>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {scrollable && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => scroll("left")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => scroll("right")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            {viewAllLink && (
              <Button variant="link" className="text-primary" asChild>
                <a href={viewAllLink}>View All →</a>
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid/Scroll */}
        {scrollable ? (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[240px] snap-start"
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
