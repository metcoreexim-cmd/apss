import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Eye,
  Trash2,
  Loader2,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_approved: boolean;
  is_verified: boolean;
  created_at: string;
  products: { title: string; slug: string } | null;
}

export default function AdminReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, products(title, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: approved })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({
        title: approved ? "Review approved" : "Review rejected",
        description: approved 
          ? "The review is now visible on the product page."
          : "The review has been hidden from the product page.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update review status.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast({
        title: "Review deleted",
        description: "The review has been permanently removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete review.",
        variant: "destructive",
      });
    },
  });

  const pendingCount = reviews?.filter((r) => !r.is_approved).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer reviews and ratings
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="text-base px-4 py-2">
            {pendingCount} pending approval
          </Badge>
        )}
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {review.products?.title || "Unknown Product"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-warning text-warning"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="truncate">
                      {review.title && (
                        <span className="font-medium">{review.title}: </span>
                      )}
                      <span className="text-muted-foreground">
                        {review.comment || "No comment"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={review.is_approved ? "default" : "secondary"}
                        className={
                          review.is_approved
                            ? "bg-green-500/10 text-green-600 border-green-500/20"
                            : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                        }
                      >
                        {review.is_approved ? "Approved" : "Pending"}
                      </Badge>
                      {review.is_verified && (
                        <Badge variant="outline" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedReview(review)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!review.is_approved && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-600"
                          onClick={() =>
                            approveMutation.mutate({ id: review.id, approved: true })
                          }
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {review.is_approved && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-yellow-600 hover:text-yellow-600"
                          onClick={() =>
                            approveMutation.mutate({ id: review.id, approved: false })
                          }
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this review? This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(review.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No reviews yet</h3>
          <p className="text-muted-foreground">
            Customer reviews will appear here once submitted.
          </p>
        </div>
      )}

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              For: {selectedReview?.products?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= selectedReview.rating
                          ? "fill-warning text-warning"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{selectedReview.rating}/5</span>
              </div>

              {selectedReview.title && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Title
                  </h4>
                  <p className="font-medium">{selectedReview.title}</p>
                </div>
              )}

              {selectedReview.comment && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Comment
                  </h4>
                  <p className="text-sm">{selectedReview.comment}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge
                  variant={selectedReview.is_approved ? "default" : "secondary"}
                >
                  {selectedReview.is_approved ? "Approved" : "Pending"}
                </Badge>
                {selectedReview.is_verified && (
                  <Badge variant="outline">Verified Purchase</Badge>
                )}
              </div>

              <div className="flex gap-2">
                {!selectedReview.is_approved ? (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      approveMutation.mutate({
                        id: selectedReview.id,
                        approved: true,
                      });
                      setSelectedReview(null);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      approveMutation.mutate({
                        id: selectedReview.id,
                        approved: false,
                      });
                      setSelectedReview(null);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
