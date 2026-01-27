import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ProductImageGallery } from "@/components/store/ProductImageGallery";
import { ProductInfo } from "@/components/store/ProductInfo";
import { ProductTabs } from "@/components/store/ProductTabs";
import { ProductSection } from "@/components/store/ProductSection";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Home } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addProduct } = useRecentlyViewed();

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name, slug),
          brand:brands(id, name, slug)
        `)
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch related products (same category)
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related-products", product?.category_id, product?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", product!.category_id)
        .neq("id", product!.id)
        .eq("is_active", true)
        .limit(5);

      if (error) throw error;
      return data.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        price: Number(p.price),
        mrp: Number(p.mrp),
        image: p.images?.[0] || "",
        rating: Number(p.rating_avg) || 0,
        ratingCount: p.rating_count || 0,
        isBestSeller: p.is_best_seller,
        isNew: p.is_new,
        stock: p.stock,
      }));
    },
    enabled: !!product?.category_id,
  });

  // Track recently viewed products
  useEffect(() => {
    if (product) {
      addProduct({
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: Number(product.price),
        mrp: Number(product.mrp),
        image: product.images?.[0] || "",
      });
    }
  }, [product, addProduct]);

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (error || !product) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </StoreLayout>
    );
  }

  // Parse variants from JSONB
  const variants = Array.isArray(product.variants)
    ? product.variants.map((v: any) => ({
        type: v.type || "Option",
        options: v.options || [],
      }))
    : [];

  // Generate specifications from product data
  const specifications: Record<string, string> = {
    ...(product.sku && { SKU: product.sku }),
    ...(product.brand && { Brand: (product.brand as any).name }),
    ...(product.category && { Category: (product.category as any).name }),
    Stock: product.stock > 0 ? `${product.stock} units` : "Out of Stock",
  };

  // Add tags as specifications
  if (product.tags && product.tags.length > 0) {
    specifications["Tags"] = product.tags.join(", ");
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 overflow-x-auto no-scrollbar">
          <Link to="/" className="hover:text-primary transition-colors flex-shrink-0">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
          {product.category && (
            <>
              <Link
                to={`/category/${(product.category as any).slug}`}
                className="hover:text-primary transition-colors flex-shrink-0"
              >
                {(product.category as any).name}
              </Link>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            </>
          )}
          <span className="text-foreground font-medium truncate">
            {product.title}
          </span>
        </nav>

        {/* Product Main Section */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Image Gallery */}
          <ProductImageGallery
            images={product.images || []}
            title={product.title}
          />

          {/* Product Info */}
          <ProductInfo
            id={product.id}
            title={product.title}
            price={Number(product.price)}
            mrp={Number(product.mrp)}
            rating={Number(product.rating_avg) || 0}
            ratingCount={product.rating_count || 0}
            stock={product.stock}
            sku={product.sku || undefined}
            variants={variants}
            image={product.images?.[0] || ""}
            isBestSeller={product.is_best_seller}
            isNew={product.is_new}
          />
        </div>

        {/* Product Tabs */}
        <div className="mb-12">
          <ProductTabs
            productId={product.id}
            productTitle={product.title}
            description={product.description || undefined}
            specifications={specifications}
            averageRating={Number(product.rating_avg) || 0}
            totalReviews={product.rating_count || 0}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ProductSection
            title="Related Products"
            subtitle="You might also like"
            products={relatedProducts}
            scrollable
          />
        )}
      </div>
    </StoreLayout>
  );
}