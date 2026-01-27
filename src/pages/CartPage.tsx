import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary, AppliedCoupon } from "@/components/cart/CartSummary";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, clearCart } = useCart();
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const handleCheckout = () => {
    const discount = appliedCoupon?.calculatedDiscount || 0;
    navigate("/checkout", {
      state: {
        coupon: appliedCoupon,
        discount,
      },
    });
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Shopping Cart</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">
              Your Cart
              {itemCount > 0 && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
              )}
            </h1>
          </div>
          {itemCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearCart}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear Cart
            </Button>
          )}
        </div>

        {itemCount === 0 ? (
          /* Empty Cart State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Looks like you haven't added any items to your cart yet. 
              Start shopping to fill it up!
            </p>
            <Button asChild size="lg">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </motion.div>
        ) : (
          /* Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </AnimatePresence>

              {/* Continue Shopping */}
              <Button variant="ghost" asChild className="mt-4">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                subtotal={subtotal}
                itemCount={itemCount}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={setAppliedCoupon}
                onRemoveCoupon={() => setAppliedCoupon(null)}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
