import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    title: string;
    price: number;
    mrp: number;
    quantity: number;
    image: string;
    variant?: string;
  };
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex gap-4 p-4 bg-card rounded-xl border border-border"
    >
      {/* Product Image */}
      <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-2">
              {item.title}
            </h3>
            {item.variant && (
              <p className="text-sm text-muted-foreground mt-1">
                Variant: {item.variant}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(item.id)}
            className="text-muted-foreground hover:text-destructive -mt-1 -mr-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-foreground">₹{item.price}</span>
          {item.mrp > item.price && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                ₹{item.mrp}
              </span>
              <span className="text-xs font-semibold text-success">
                {discount}% off
              </span>
            </>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center border border-border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-10 text-center font-medium text-sm">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="font-bold text-foreground">
            ₹{(item.price * item.quantity).toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
