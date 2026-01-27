import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowRight, AlertTriangle, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LOW_STOCK_THRESHOLD = 5;

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();

  // Fetch current stock and price levels for wishlist items
  const { data: productInfo = {} } = useQuery({
    queryKey: ["wishlist-product-info", items.map((i) => i.productId)],
    queryFn: async () => {
      if (items.length === 0) return {};

      const productIds = items.map((item) => item.productId);
      const { data, error } = await supabase
        .from("products")
        .select("id, stock, price")
        .in("id", productIds);

      if (error) throw error;

      const info: Record<string, { stock: number; price: number }> = {};
      data?.forEach((p) => {
        info[p.id] = { stock: p.stock, price: Number(p.price) };
      });
      return info;
    },
    enabled: items.length > 0,
  });

  // Helper to check for price drop
  const getPriceDrop = (item: typeof items[0]) => {
    const currentInfo = productInfo[item.productId];
    if (!currentInfo || !item.addedPrice) return null;
    
    const currentPrice = currentInfo.price;
    const addedPrice = item.addedPrice;
    
    if (currentPrice < addedPrice) {
      return {
        oldPrice: addedPrice,
        newPrice: currentPrice,
        dropPercent: Math.round(((addedPrice - currentPrice) / addedPrice) * 100),
      };
    }
    return null;
  };

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      productId: item.productId,
      title: item.title,
      price: item.price,
      mrp: item.mrp,
      quantity: 1,
      image: item.image,
    });
    toast({
      title: "Added to cart",
      description: `${item.title} has been added to your cart.`,
    });
  };

  const handleAddAllToCart = () => {
    items.forEach((item) => {
      addItem({
        productId: item.productId,
        title: item.title,
        price: item.price,
        mrp: item.mrp,
        quantity: 1,
        image: item.image,
      });
    });
    toast({
      title: "All items added to cart",
      description: `${items.length} item(s) have been added to your cart.`,
    });
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Wishlist</h1>
                <p className="text-muted-foreground">
                  {items.length} item{items.length !== 1 ? "s" : ""} saved
                </p>
              </div>
            </div>
            {items.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleAddAllToCart}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add All to Cart
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={clearWishlist}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Wishlist Items */}
          {items.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);
                  
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          {/* Product Image */}
                          <Link
                            to={`/product/${item.productId}`}
                            className="relative w-full sm:w-40 h-40 flex-shrink-0 bg-secondary/30"
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                            {discount > 0 && (
                              <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                                {discount}% OFF
                              </Badge>
                            )}
                            {/* Low Stock Badge */}
                            {productInfo[item.productId] !== undefined &&
                              productInfo[item.productId].stock <= LOW_STOCK_THRESHOLD &&
                              productInfo[item.productId].stock > 0 && (
                                <Badge
                                  variant="outline"
                                  className="absolute top-2 right-2 bg-warning/90 text-warning-foreground border-warning"
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Low Stock
                                </Badge>
                              )}
                            {/* Price Drop Badge */}
                            {getPriceDrop(item) && (
                              <Badge
                                className="absolute bottom-2 left-2 bg-green-500 text-white"
                              >
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Price Drop!
                              </Badge>
                            )}
                            {productInfo[item.productId]?.stock === 0 && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <Badge variant="destructive">Out of Stock</Badge>
                              </div>
                            )}
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <Link
                                to={`/product/${item.productId}`}
                                className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                              >
                                {item.title}
                              </Link>
                              <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                                {(() => {
                                  const priceDrop = getPriceDrop(item);
                                  const currentPrice = productInfo[item.productId]?.price ?? item.price;
                                  
                                  return priceDrop ? (
                                    <>
                                      <span className="text-lg font-bold text-green-600">
                                        ₹{priceDrop.newPrice.toLocaleString()}
                                      </span>
                                      <span className="text-sm text-muted-foreground line-through">
                                        ₹{priceDrop.oldPrice.toLocaleString()}
                                      </span>
                                      <Badge className="bg-green-100 text-green-700 text-xs">
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                        {priceDrop.dropPercent}% drop!
                                      </Badge>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-lg font-bold">
                                        ₹{currentPrice.toLocaleString()}
                                      </span>
                                      {discount > 0 && (
                                        <>
                                          <span className="text-sm text-muted-foreground line-through">
                                            ₹{item.mrp.toLocaleString()}
                                          </span>
                                          <span className="text-sm text-green-600 font-medium">
                                            {discount}% off
                                          </span>
                                        </>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                              {/* Stock Warning Text */}
                              {productInfo[item.productId] !== undefined &&
                                productInfo[item.productId].stock <= LOW_STOCK_THRESHOLD &&
                                productInfo[item.productId].stock > 0 && (
                                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Only {productInfo[item.productId].stock} left in stock!
                                  </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4">
                              <Button
                                className="flex-1 sm:flex-none"
                                onClick={() => handleAddToCart(item)}
                                disabled={productInfo[item.productId]?.stock === 0}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {productInfo[item.productId]?.stock === 0 ? "Out of Stock" : "Add to Cart"}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeItem(item.productId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Save your favorite items here. Click the heart icon on any product to add it to your wishlist.
              </p>
              <Button asChild>
                <Link to="/">
                  Start Shopping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          )}

          {/* Continue Shopping */}
          {items.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link to="/">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </StoreLayout>
  );
}
