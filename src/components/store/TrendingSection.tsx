import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp, Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TrendingItem {
  id: string;
  title: string;
  image: string;
  link: string;
  badge?: string;
  isAnimated?: boolean;
}

interface TrendingSectionProps {
  items: TrendingItem[];
}

const defaultItems: TrendingItem[] = [
  {
    id: "best-sellers",
    title: "Best Sellers",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
    link: "/best-sellers",
    badge: "🔥 Hot",
  },
  {
    id: "popular-reels",
    title: "Popular on Reels",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
    link: "/deals",
    badge: "📱 Trending",
  },
  {
    id: "new-arrivals",
    title: "New Arrivals",
    image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80",
    link: "/new-arrivals",
    badge: "✨ New",
  },
];

export function TrendingSection({ items = defaultItems }: TrendingSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 bg-gradient-to-b from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Trending Now
              </h2>
              <p className="text-sm text-muted-foreground">Most popular right now</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2"
          >
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory"
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              className="flex-shrink-0 w-[300px] md:w-[340px] snap-start"
            >
              <Link to={item.link} className="block group">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500">
                  {/* Image with zoom effect */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Animated border glow */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-white/0 group-hover:border-white/30 transition-all duration-500" />
                  
                  {/* Badge */}
                  {item.badge && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-foreground text-sm font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5"
                    >
                      <Flame className="w-4 h-4 text-orange-500" />
                      {item.badge}
                    </motion.div>
                  )}
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-3xl font-bold text-white mb-3 group-hover:translate-x-2 transition-transform duration-300">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium">Explore Collection</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                    
                    {/* Progress bar decoration */}
                    <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-primary to-accent origin-left"
                        style={{ width: `${60 + index * 15}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
