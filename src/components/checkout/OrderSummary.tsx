import { Package, Shield, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

interface OrderSummaryProps {
  discount: number;
  couponCode: string | null;
  onPlaceOrder: () => void;
  isLoading: boolean;
  isValid: boolean;
}

const FREE_SHIPPING_THRESHOLD = 499;
const DELIVERY_CHARGE = 49;

export function OrderSummary({
  discount,
  couponCode,
  onPlaceOrder,
  isLoading,
  isValid,
}: OrderSummaryProps) {
  const { items, subtotal, itemCount } = useCart();

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const deliveryCharge = isFreeShipping ? 0 : DELIVERY_CHARGE;
  const grandTotal = subtotal - discount + deliveryCharge;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items Preview */}
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                <p className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount {couponCode && `(${couponCode})`}</span>
              <span>- ₹{discount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            {isFreeShipping ? (
              <span className="text-success">FREE</span>
            ) : (
              <span>₹{deliveryCharge}</span>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>₹{grandTotal.toLocaleString()}</span>
        </div>

        <Button
          onClick={onPlaceOrder}
          disabled={!isValid || isLoading}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isLoading ? "Placing Order..." : "Place Order"}
        </Button>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-success" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="h-4 w-4 text-primary" />
            <span>Fast Delivery</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
