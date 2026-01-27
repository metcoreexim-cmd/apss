import { useState, useEffect, useCallback } from "react";

interface RecentProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  mrp: number;
  image: string;
  viewedAt: number;
}

const STORAGE_KEY = "recently-viewed";
const MAX_ITEMS = 12;

export function useRecentlyViewed() {
  const [products, setProducts] = useState<RecentProduct[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // Storage full or unavailable
    }
  }, [products]);

  const addProduct = useCallback((product: Omit<RecentProduct, "viewedAt">) => {
    setProducts((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);
      // Add to front with timestamp
      const updated = [{ ...product, viewedAt: Date.now() }, ...filtered];
      // Limit to max items
      return updated.slice(0, MAX_ITEMS);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    products,
    addProduct,
    clearHistory,
  };
}
