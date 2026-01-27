import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "./ReviewForm";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ProductTabsProps {
  productId: string;
  productTitle: string;
  description?: string;
  specifications?: Record<string, string>;
  averageRating?: number;
  totalReviews?: number;
}

export function ProductTabs({
  productId,
  productTitle,
  description = "No description available.",
  specifications = {},
  averageRating = 0,
  totalReviews = 0,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  // Fetch approved reviews for this product
  const { data: reviews } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  // Calculate rating breakdown
  const ratingBreakdown = reviews?.reduce(
    (acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  ) || {};

  const maxRatingCount = Math.max(...Object.values(ratingBreakdown), 1);
  const reviewCount = reviews?.length || totalReviews;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-0">
        {["description", "specifications", "reviews"].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className={cn(
              "relative px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent capitalize font-medium",
              "data-[state=active]:text-primary data-[state=active]:shadow-none"
            )}
          >
            {tab}
            {tab === "reviews" && reviewCount > 0 && (
              <span className="ml-2 text-xs bg-secondary px-2 py-0.5 rounded-full">
                {reviewCount}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Description Tab */}
          <TabsContent value="description" className="mt-6">
            <div className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap leading-relaxed">{description}</p>
            </div>
          </TabsContent>

          {/* Specifications Tab */}
          <TabsContent value="specifications" className="mt-6">
            {Object.keys(specifications).length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {Object.entries(specifications).map(([key, value], index) => (
                      <tr
                        key={key}
                        className={cn(
                          "border-b last:border-0",
                          index % 2 === 0 ? "bg-secondary/30" : "bg-background"
                        )}
                      >
                        <td className="px-4 py-3 font-medium text-muted-foreground w-1/3">
                          {key}
                        </td>
                        <td className="px-4 py-3">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No specifications available.</p>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Rating Summary */}
              <div className="md:col-span-1 space-y-4">
                <div className="text-center p-6 bg-secondary/30 rounded-xl">
                  <div className="text-5xl font-bold text-foreground mb-2">
                    {(averageRating || 0).toFixed(1)}
                  </div>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-5 w-5",
                          star <= Math.round(averageRating || 0)
                            ? "fill-warning text-warning"
                            : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingBreakdown[rating] || 0;
                    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-3">{rating}</span>
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <Progress
                          value={percentage}
                          className="flex-1 h-2"
                        />
                        <span className="text-sm text-muted-foreground w-8">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <ReviewForm
                  productId={productId}
                  productTitle={productTitle}
                  trigger={<Button className="w-full">Write a Review</Button>}
                />
              </div>

              {/* Reviews List */}
              <div className="md:col-span-2 space-y-6">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Customer</span>
                              {review.is_verified && (
                                <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      "h-3.5 w-3.5",
                                      star <= review.rating
                                        ? "fill-warning text-warning"
                                        : "text-muted"
                                    )}
                                  />
                                ))}
                              </div>
                              <span>•</span>
                              <span>{format(new Date(review.created_at), "MMM d, yyyy")}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {review.title && (
                        <h4 className="font-medium mb-1">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-muted-foreground text-sm mb-3">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-muted mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Be the first to review this product
                    </p>
                    <ReviewForm
                      productId={productId}
                      productTitle={productTitle}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </motion.div>
      </AnimatePresence>
    </Tabs>
  );
}
