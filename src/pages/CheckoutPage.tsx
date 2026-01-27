import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { AddressForm, AddressFormData } from "@/components/checkout/AddressForm";
import { PaymentMethodSelector, PaymentMethod } from "@/components/checkout/PaymentMethodSelector";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const FREE_SHIPPING_THRESHOLD = 499;
const DELIVERY_CHARGE = 49;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();

  const [selectedAddress, setSelectedAddress] = useState<AddressFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Get coupon info from cart page
  const couponData = location.state?.coupon;
  const discount = location.state?.discount || 0;

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      navigate("/cart");
    }
  }, [items, navigate, orderPlaced]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to continue checkout");
      navigate("/", { state: { showLogin: true } });
    }
  }, [user, authLoading, navigate]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !user) {
      toast.error("Please fill in your shipping address");
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Generate order number
      const { data: orderNum } = await supabase.rpc("generate_order_number");

      const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
      const deliveryCharge = isFreeShipping ? 0 : DELIVERY_CHARGE;
      const grandTotal = subtotal - discount + deliveryCharge;

      // Prepare order items
      const orderItems = items.map((item) => ({
        product_id: item.productId,
        title: item.title,
        price: item.price,
        mrp: item.mrp,
        quantity: item.quantity,
        image: item.image,
        variant: item.variant || null,
      }));

      // Create order
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNum,
          items: orderItems,
          shipping_address: {
            name: selectedAddress.name,
            phone: selectedAddress.phone,
            address_line1: selectedAddress.address_line1,
            address_line2: selectedAddress.address_line2 || null,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
          },
          subtotal,
          discount,
          shipping_charge: deliveryCharge,
          grand_total: grandTotal,
          coupon_code: couponData?.code || null,
          payment_method: paymentMethod,
          payment_status: "pending",
          order_status: "pending",
          email: user.email || "",
          phone: selectedAddress.phone,
        } as never)
        .select()
        .single();

      if (error) throw error;

      // Clear cart and show success
      clearCart();
      setOrderNumber(order.order_number);
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (authLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </StoreLayout>
    );
  }

  // Order Success State
  if (orderPlaced) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-4">
              Thank you for your order. Your order number is:
            </p>
            <p className="text-xl font-bold text-primary mb-6">{orderNumber}</p>
            <p className="text-sm text-muted-foreground mb-8">
              We'll send you an email confirmation with order details and tracking information.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/orders">View Orders</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </StoreLayout>
    );
  }

  const isValid = !!selectedAddress && items.length > 0;

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-foreground transition-colors">
            Cart
          </Link>
          <span>/</span>
          <span className="text-foreground">Checkout</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            <AddressForm
              selectedAddress={selectedAddress}
              onAddressSelect={setSelectedAddress}
            />

            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
            />

            {/* Back to Cart */}
            <Button variant="ghost" asChild>
              <Link to="/cart">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Link>
            </Button>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              discount={discount}
              couponCode={couponData?.code || null}
              onPlaceOrder={handlePlaceOrder}
              isLoading={isPlacingOrder}
              isValid={isValid}
            />
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
