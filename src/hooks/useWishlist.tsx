import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  mrp: number;
  image: string;
  addedPrice: number; // Price when added to wishlist for price drop detection
  addedAt: number; // Timestamp when added
}

interface WishlistContextType {
  items: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (item: Omit<WishlistItem, "id" | "addedPrice" | "addedAt">) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(items));
  }, [items]);

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.productId === productId);
  };

  const toggleWishlist = (newItem: Omit<WishlistItem, "id" | "addedPrice" | "addedAt">) => {
    if (isInWishlist(newItem.productId)) {
      removeItem(newItem.productId);
    } else {
      setItems((prev) => [
        ...prev,
        {
          ...newItem,
          id: crypto.randomUUID(),
          addedPrice: newItem.price,
          addedAt: Date.now(),
        },
      ]);
      toast.success("Added to wishlist!");
    }
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
    toast.success("Removed from wishlist");
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{ items, isInWishlist, toggleWishlist, removeItem, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
