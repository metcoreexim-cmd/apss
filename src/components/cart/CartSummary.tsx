import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CouponInput } from "./CouponInput";
import type { AppliedCoupon } from "./CouponInput";

export type { AppliedCoupon };

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  appliedCoupon: AppliedCoupon | null;
  onApplyCoupon: (coupon: AppliedCoupon) => void;
  onRemoveCoupon: () => void;
  onCheckout: () => void;
}

const FREE_SHIPPING_THRESHOLD = 499;
const DELIVERY_CHARGE = 49;

export function CartSummary({
  subtotal,
  itemCount,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
}: CartSummaryProps) {
  const discount = appliedCoupon?.calculatedDiscount || 0;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const deliveryCharge = isFreeShipping ? 0 : DELIVERY_CHARGE;
  const grandTotal = subtotal - discount + deliveryCharge;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
      <h2 className="text-lg font-bold mb-4">Order Summary</h2>

      {/* Free Shipping Progress */}
      {!isFreeShipping && subtotal > 0 && (
        <div className="mb-4 p-3 bg-secondary rounded-lg">
          <div className="flex items-center gap-2 text-sm mb-2">
            <Truck className="h-4 w-4 text-primary" />
            <span>Add ₹{amountToFreeShipping.toLocaleString()} more for free shipping!</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Coupon Input */}
      <div className="mb-4">
        <CouponInput
          subtotal={subtotal}
          appliedCoupon={appliedCoupon}
          onApplyCoupon={onApplyCoupon}
          onRemoveCoupon={onRemoveCoupon}
        />
      </div>

      <Separator className="my-4" />

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
          <span className="font-medium">₹{subtotal.toLocaleString()}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Coupon Discount</span>
            <span>- ₹{discount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery</span>
          {isFreeShipping ? (
            <span className="text-success font-medium">FREE</span>
          ) : (
            <span className="font-medium">₹{deliveryCharge}</span>
          )}
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>₹{grandTotal.toLocaleString()}</span>
        </div>

        {discount > 0 && (
          <p className="text-sm text-success text-center">
            You're saving ₹{(discount + (isFreeShipping ? DELIVERY_CHARGE : 0)).toLocaleString()}!
          </p>
        )}
      </div>

      <Button
        onClick={onCheckout}
        disabled={itemCount === 0}
        className="w-full mt-6 h-12 text-base font-semibold"
        size="lg"
      >
        Proceed to Checkout
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  );
}
