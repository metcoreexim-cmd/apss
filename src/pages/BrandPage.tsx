import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrandsPage() {
  const { data: brands, isLoading } = useQuery({
    queryKey: ["all-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            All Brands
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover premium stationery from the world's finest brands
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {brands?.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/search?brand=${brand.slug}`}
                  className="group block bg-card rounded-xl border p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                >
                  <div className="aspect-square flex items-center justify-center mb-4 bg-secondary/50 rounded-lg overflow-hidden">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-primary">
                        {brand.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-center group-hover:text-primary transition-colors">
                    {brand.name}
                  </h3>
                  {brand.description && (
                    <p className="text-sm text-muted-foreground text-center mt-2 line-clamp-2">
                      {brand.description}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {brands?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No brands available yet.</p>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
