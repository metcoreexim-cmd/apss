import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Copy,
  ChevronDown,
  ChevronUp,
  Box,
  PackageCheck,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  subtotal: number;
  discount: number;
  shipping_charge: number;
  grand_total: number;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

interface OrderTrackingCardProps {
  order: Order;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "packed", label: "Packed", icon: Box },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

const statusOrder = ["pending", "confirmed", "packed", "shipped", "delivered"];

export function OrderTrackingCard({ order }: OrderTrackingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { addItem } = useCart();

  const currentStatusIndex = statusOrder.indexOf(order.order_status);
  const isCancelled = order.order_status === "cancelled";

  const handleReorder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!order.items || order.items.length === 0) {
      toast.error("No items to reorder");
      return;
    }

    order.items.forEach((item) => {
      addItem({
        productId: item.id,
        title: item.title,
        price: item.price,
        mrp: item.price, // Use price as MRP since we don't have original MRP
        quantity: item.quantity,
        image: item.image || "",
      });
    });

    toast.success(`Added ${order.items.length} item${order.items.length > 1 ? "s" : ""} to cart`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "shipped":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "packed":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "confirmed":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const copyTrackingNumber = () => {
    if (order.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number);
      toast.success("Tracking number copied!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-xl overflow-hidden bg-card"
    >
      {/* Order Header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{order.order_number}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(order.created_at), "PPP 'at' p")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(order.order_status)}>
              {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReorder}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reorder
            </Button>
            <span className="font-semibold">₹{Number(order.grand_total).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Separator />

            <div className="p-4 space-y-6">
              {/* Order Tracking Timeline */}
              {!isCancelled ? (
                <div>
                  <h4 className="font-medium mb-4">Order Status</h4>
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-muted" />
                    <div
                      className="absolute left-[18px] top-0 w-0.5 bg-primary transition-all duration-500"
                      style={{
                        height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                      }}
                    />

                    {/* Steps */}
                    <div className="space-y-4">
                      {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;
                        const Icon = step.icon;

                        return (
                          <div key={step.key} className="flex items-center gap-4 relative">
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center z-10 transition-colors",
                                isCompleted
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p
                                className={cn(
                                  "font-medium",
                                  isCompleted ? "text-foreground" : "text-muted-foreground"
                                )}
                              >
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="text-xs text-primary">Current Status</p>
                              )}
                            </div>
                            {isCompleted && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-600">Order Cancelled</p>
                    <p className="text-sm text-muted-foreground">
                      This order has been cancelled
                    </p>
                  </div>
                </div>
              )}

              {/* Tracking Number */}
              {order.tracking_number && (
                <div>
                  <h4 className="font-medium mb-2">Tracking Information</h4>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm flex-1">{order.tracking_number}</span>
                    <Button variant="ghost" size="icon" onClick={copyTrackingNumber}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Items Ordered</h4>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">{order.shipping_address?.name}</p>
                      <p className="text-muted-foreground">{order.shipping_address?.phone}</p>
                      <p className="mt-1">
                        {order.shipping_address?.address_line1}
                        {order.shipping_address?.address_line2 && (
                          <>, {order.shipping_address.address_line2}</>
                        )}
                        <br />
                        {order.shipping_address?.city}, {order.shipping_address?.state} -{" "}
                        {order.shipping_address?.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{Number(order.discount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {Number(order.shipping_charge) > 0
                        ? `₹${Number(order.shipping_charge).toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{Number(order.grand_total).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                <div>
                  <span className="text-muted-foreground">Payment: </span>
                  <span className="font-medium">
                    {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    order.payment_status === "paid"
                      ? "border-green-500/30 text-green-600"
                      : "border-yellow-500/30 text-yellow-600"
                  }
                >
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
