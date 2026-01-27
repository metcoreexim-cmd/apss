import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function AllCategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
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
            All Categories
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse our complete collection of premium stationery categories
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className="group block relative overflow-hidden rounded-xl aspect-[4/3]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/50">
                    {category.image_url && (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {category.icon && (
                        <span className="text-2xl">{category.icon}</span>
                      )}
                      <h3 className="font-display text-xl font-bold text-white group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                    {category.description && (
                      <p className="text-white/80 text-sm line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {categories?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No categories available yet.</p>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
