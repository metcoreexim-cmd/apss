import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

interface CollectionBanner {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  link: string;
  badge?: string;
}

interface CollectionBannersProps {
  banners: CollectionBanner[];
  columns?: 2 | 3 | 4;
}

export function CollectionBanners({ banners, columns = 3 }: CollectionBannersProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 text-primary mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Shop by Brand</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Featured Collections
          </h2>
        </motion.div>

        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 30, rotateY: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring" }}
            >
              <Link to={banner.link} className="block group relative">
                <motion.div
                  whileHover={{ y: -8 }}
                  className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500"
                >
                  {/* Image with parallax effect */}
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    src={banner.image}
                    alt={banner.title || "Collection"}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient overlay with animation */}
                  <motion.div
                    initial={{ opacity: 0.6 }}
                    whileHover={{ opacity: 0.8 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                  />

                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/30 to-transparent" />
                  
                  {/* Badge */}
                  {banner.badge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg"
                    >
                      {banner.badge}
                    </motion.div>
                  )}
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {banner.title && (
                      <motion.h3
                        className="font-display text-xl md:text-2xl font-bold text-white mb-2"
                      >
                        {banner.title}
                      </motion.h3>
                    )}
                    {banner.subtitle && (
                      <p className="text-sm text-white/80 mb-3">
                        {banner.subtitle}
                      </p>
                    )}
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                      className="flex items-center gap-2 text-primary-foreground bg-primary/90 backdrop-blur-sm w-fit px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      Explore
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  </div>

                  {/* Shine effect on hover */}
                  <motion.div
                    initial={{ x: "-100%", opacity: 0 }}
                    whileHover={{ x: "100%", opacity: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12"
                  />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
