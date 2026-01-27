import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  slug: string;
  name: string;
  icon: string;
  image?: string;
}

export function CategoryCard({ slug, name, icon, image }: CategoryCardProps) {
  return (
    <Link to={`/category/${slug}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative min-w-[110px] md:min-w-[130px] p-4 rounded-2xl bg-gradient-to-br from-card via-card to-secondary/50 border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group cursor-pointer"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-accent/5 transition-all duration-500" />
        
        <div className="relative flex flex-col items-center text-center">
          {image ? (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden mb-3 bg-gradient-to-br from-secondary to-muted ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-300 shadow-lg">
              <img 
                src={image} 
                alt={name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
          ) : (
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 flex items-center justify-center mb-3 text-4xl md:text-5xl shadow-inner"
            >
              {icon}
            </motion.div>
          )}
          
          <span className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {name}
          </span>
          
          {/* Arrow indicator */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="absolute -right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ArrowRight className="w-4 h-4 text-primary" />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}
