import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";

export interface CompareProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  mrp: number;
  image: string;
  rating?: number;
  ratingCount?: number;
  stock?: number;
  brand?: string;
  category?: string;
  sku?: string;
  description?: string;
}

interface CompareContextType {
  products: CompareProduct[];
  addProduct: (product: CompareProduct) => void;
  removeProduct: (id: string) => void;
  clearAll: () => void;
  isInCompare: (id: string) => boolean;
  canAdd: boolean;
}

const MAX_COMPARE = 3;

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CompareProduct[]>([]);

  const canAdd = products.length < MAX_COMPARE;

  const addProduct = useCallback((product: CompareProduct) => {
    setProducts((prev) => {
      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can only compare up to ${MAX_COMPARE} products`);
        return prev;
      }
      if (prev.some((p) => p.id === product.id)) {
        toast.info("Product already in comparison");
        return prev;
      }
      toast.success("Added to compare");
      return [...prev, product];
    });
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setProducts([]);
  }, []);

  const isInCompare = useCallback(
    (id: string) => products.some((p) => p.id === id),
    [products]
  );

  return (
    <CompareContext.Provider
      value={{ products, addProduct, removeProduct, clearAll, isInCompare, canAdd }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
