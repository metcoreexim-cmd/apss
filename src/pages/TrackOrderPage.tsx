import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const orderStatusSteps = [
  { status: "pending", label: "Order Placed", icon: Clock },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle },
  { status: "packed", label: "Packed", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: MapPin },
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searchOrderNumber, setSearchOrderNumber] = useState("");

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["track-order", searchOrderNumber],
    queryFn: async () => {
      if (!searchOrderNumber) return null;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", searchOrderNumber)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!searchOrderNumber,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOrderNumber(orderNumber.toUpperCase());
  };

  const getCurrentStepIndex = (status: string) => {
    return orderStatusSteps.findIndex((step) => step.status === status);
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Track Your Order
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter your order number to check the current status of your order
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto mb-12"
        >
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter order number (e.g., ORD250126XXXX)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button type="submit" size="lg" disabled={!orderNumber.trim()}>
              Track Order
            </Button>
          </form>
        </motion.div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Searching for your order...</p>
          </div>
        )}

        {searchOrderNumber && !isLoading && !order && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">
              We couldn't find an order with number "{searchOrderNumber}". Please check and try again.
            </p>
          </motion.div>
        )}

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-2xl">{order.order_number}</CardTitle>
                    <p className="text-muted-foreground mt-1">
                      Placed on {format(new Date(order.created_at), "PPP")}
                    </p>
                  </div>
                  <Badge
                    variant={order.order_status === "delivered" ? "default" : "secondary"}
                    className="text-sm px-3 py-1"
                  >
                    {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Order Timeline */}
                <div className="mb-8">
                  <h4 className="font-semibold mb-6">Order Status</h4>
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
                    {orderStatusSteps.map((step, index) => {
                      const currentIndex = getCurrentStepIndex(order.order_status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      const Icon = step.icon;

                      return (
                        <div key={step.status} className="relative flex items-center gap-4 pb-8 last:pb-0">
                          <div
                            className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                              isCompleted
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-background border-muted text-muted-foreground"
                            } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className={`font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-sm text-primary">Current Status</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                  <div>
                    <h4 className="font-semibold mb-3">Shipping Address</h4>
                    <div className="text-muted-foreground text-sm space-y-1">
                      {typeof order.shipping_address === "object" && order.shipping_address && (
                        <>
                          <p>{(order.shipping_address as any).name}</p>
                          <p>{(order.shipping_address as any).address_line1}</p>
                          {(order.shipping_address as any).address_line2 && (
                            <p>{(order.shipping_address as any).address_line2}</p>
                          )}
                          <p>
                            {(order.shipping_address as any).city}, {(order.shipping_address as any).state} - {(order.shipping_address as any).pincode}
                          </p>
                          <p>{(order.shipping_address as any).phone}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Order Summary</h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>₹{order.shipping_charge || 0}</span>
                      </div>
                      {order.discount && order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-₹{order.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total</span>
                        <span>₹{order.grand_total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {order.tracking_number && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-2">Tracking Number</h4>
                    <p className="font-mono text-primary">{order.tracking_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </StoreLayout>
  );
}
