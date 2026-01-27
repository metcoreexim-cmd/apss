import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/hooks/useCompare";

export function CompareBar() {
  const { products, removeProduct, clearAll } = useCompare();

  if (products.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Product Thumbnails */}
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Compare ({products.length}/3):
              </span>
              
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="relative group flex-shrink-0"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden border bg-secondary/30">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: 3 - products.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-14 h-14 rounded-lg border-2 border-dashed border-muted flex-shrink-0"
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-muted-foreground"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
              
              <Link to="/compare">
                <Button size="sm" disabled={products.length < 2}>
                  Compare Now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
