import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, MapPin, User, LogOut, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { OrderTrackingCard } from "@/components/account/OrderTrackingCard";
import { format } from "date-fns";

export default function AccountPage() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "orders";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["user-addresses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_default", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  const handleSetDefault = async (addressId: string) => {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user!.id);
    
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", addressId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to set default address.",
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      toast({
        title: "Default address updated",
        description: "Your default address has been updated.",
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", addressId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete address.",
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      toast({
        title: "Address deleted",
        description: "Your address has been removed.",
      });
    }
  };

  if (authLoading) {
    return (
      <StoreLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StoreLayout>
    );
  }

  if (!user) return null;

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">{user.email}</h1>
                    <p className="text-sm text-muted-foreground">
                      Member since {format(new Date(user.created_at), "MMMM yyyy")}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                My Orders
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Addresses
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Order History & Tracking</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchOrders()}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <OrderTrackingCard key={order.id} order={order as any} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">No orders yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start shopping to see your orders here
                      </p>
                      <Button onClick={() => navigate("/")}>Start Shopping</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Saved Addresses</CardTitle>
                  <Button variant="outline" onClick={() => navigate("/checkout")}>
                    Add New Address
                  </Button>
                </CardHeader>
                <CardContent>
                  {addressesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : addresses && addresses.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {addresses.map((address) => (
                        <motion.div
                          key={address.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border rounded-lg p-4 relative"
                        >
                          {address.is_default && (
                            <Badge className="absolute top-2 right-2 bg-primary/10 text-primary border-primary/20">
                              Default
                            </Badge>
                          )}
                          <h4 className="font-medium mb-1">{address.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {address.phone}
                          </p>
                          <p className="text-sm">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                            <br />
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <div className="flex gap-2 mt-4">
                            {!address.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(address.id)}
                              >
                                Set as Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">No saved addresses</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add an address during checkout
                      </p>
                      <Button onClick={() => navigate("/checkout")}>
                        Add Address
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </StoreLayout>
  );
}
