import { useState } from "react";
import { Tag, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CouponInputProps {
  subtotal: number;
  appliedCoupon: AppliedCoupon | null;
  onApplyCoupon: (coupon: AppliedCoupon) => void;
  onRemoveCoupon: () => void;
}

export interface AppliedCoupon {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxDiscount: number | null;
  calculatedDiscount: number;
}

export function CouponInput({
  subtotal,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (error || !coupon) {
        toast.error("Invalid coupon code");
        return;
      }

      // Check validity dates
      const now = new Date();
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        toast.error("This coupon is not yet active");
        return;
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        toast.error("This coupon has expired");
        return;
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        toast.error("This coupon has reached its usage limit");
        return;
      }

      // Check minimum cart value
      if (coupon.min_cart_value && subtotal < coupon.min_cart_value) {
        toast.error(`Minimum cart value of ₹${coupon.min_cart_value} required`);
        return;
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === "percent") {
        discount = (subtotal * Number(coupon.discount_value)) / 100;
        if (coupon.max_discount && discount > Number(coupon.max_discount)) {
          discount = Number(coupon.max_discount);
        }
      } else {
        discount = Number(coupon.discount_value);
      }

      onApplyCoupon({
        code: coupon.code,
        discountType: coupon.discount_type as "percent" | "fixed",
        discountValue: Number(coupon.discount_value),
        maxDiscount: coupon.max_discount ? Number(coupon.max_discount) : null,
        calculatedDiscount: discount,
      });

      toast.success("Coupon applied successfully!");
      setCode("");
    } catch (err) {
      toast.error("Failed to apply coupon");
    } finally {
      setIsLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-success/10 border border-success/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-success" />
          <span className="font-medium text-success">{appliedCoupon.code}</span>
          <span className="text-sm text-muted-foreground">
            - ₹{appliedCoupon.calculatedDiscount.toLocaleString()} off
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemoveCoupon}
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
          className="pl-10 uppercase"
        />
      </div>
      <Button
        variant="outline"
        onClick={handleApplyCoupon}
        disabled={isLoading || !code.trim()}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
      </Button>
    </div>
  );
}
