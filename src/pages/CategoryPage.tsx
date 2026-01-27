import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown, Grid3X3, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const PRODUCTS_PER_PAGE = 12;

const ratingOptions = [
  { value: 4, label: "4★ & above" },
  { value: 3, label: "3★ & above" },
  { value: 2, label: "2★ & above" },
];

const discountOptions = [
  { value: 50, label: "50% or more" },
  { value: 30, label: "30% or more" },
  { value: 20, label: "20% or more" },
  { value: 10, label: "10% or more" },
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
  { value: "discount", label: "Highest Discount" },
];

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Fetch category
  const { data: category } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch brands for filter
  const { data: brands } = useQuery({
    queryKey: ["brands-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch products
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ["category-products", slug],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, brands(name, slug), categories(name, slug)")
        .eq("is_active", true);

      if (category?.id) {
        query = query.eq("category_id", category.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!category?.id || !slug,
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = allProducts.filter((product) => {
      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Brand filter
      if (selectedBrands.length > 0 && product.brand_id) {
        if (!selectedBrands.includes(product.brand_id)) {
          return false;
        }
      }

      // Rating filter
      if (minRating && (product.rating_avg || 0) < minRating) {
        return false;
      }

      // Discount filter
      if (minDiscount && (product.discount_percent || 0) < minDiscount) {
        return false;
      }

      return true;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "rating":
        filtered.sort((a, b) => (Number(b.rating_avg) || 0) - (Number(a.rating_avg) || 0));
        break;
      case "discount":
        filtered.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
        break;
      default:
        // Relevance - featured first, then by rating
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (Number(b.rating_avg) || 0) - (Number(a.rating_avg) || 0);
        });
    }

    return filtered;
  }, [allProducts, priceRange, selectedBrands, minRating, minDiscount, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedBrands([]);
    setMinRating(null);
    setMinDiscount(null);
  };

  const activeFilterCount = [
    priceRange[0] > 0 || priceRange[1] < 10000,
    selectedBrands.length > 0,
    minRating !== null,
    minDiscount !== null,
  ].filter(Boolean).length;

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {activeFilterCount} filter(s) applied
          </span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h3 className="font-semibold">Price Range</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={0}
            max={10000}
            step={100}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Brands */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h3 className="font-semibold">Brands</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-3 max-h-48 overflow-y-auto">
          {brands?.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBrands([...selectedBrands, brand.id]);
                  } else {
                    setSelectedBrands(selectedBrands.filter((id) => id !== brand.id));
                  }
                }}
              />
              <Label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer">
                {brand.name}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Rating */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h3 className="font-semibold">Customer Rating</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-3">
          {ratingOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${option.value}`}
                checked={minRating === option.value}
                onCheckedChange={(checked) => {
                  setMinRating(checked ? option.value : null);
                }}
              />
              <Label htmlFor={`rating-${option.value}`} className="text-sm cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Discount */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h3 className="font-semibold">Discount</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-3">
          {discountOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`discount-${option.value}`}
                checked={minDiscount === option.value}
                onCheckedChange={(checked) => {
                  setMinDiscount(checked ? option.value : null);
                }}
              />
              <Label htmlFor={`discount-${option.value}`} className="text-sm cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Category Header */}
        <div className="mb-6">
          {category?.banner_url && (
            <div className="relative h-40 md:h-56 rounded-xl overflow-hidden mb-6">
              <img
                src={category.banner_url}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent flex items-center">
                <div className="px-8">
                  <h1 className="text-3xl md:text-4xl font-bold">{category?.name}</h1>
                  {category?.description && (
                    <p className="text-muted-foreground mt-2 max-w-md">{category.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {!category?.banner_url && category && (
            <div className="mb-4">
              <h1 className="text-3xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground mt-1">{category.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>

            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Grid Toggle - Desktop */}
            <div className="hidden md:flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={gridCols === 3 ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setGridCols(3)}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={gridCols === 4 ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setGridCols(4)}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {(priceRange[0] > 0 || priceRange[1] < 10000) && (
              <Badge variant="secondary" className="gap-1">
                ₹{priceRange[0]} - ₹{priceRange[1]}
                <button onClick={() => setPriceRange([0, 10000])}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedBrands.map((brandId) => {
              const brand = brands?.find((b) => b.id === brandId);
              return (
                <Badge key={brandId} variant="secondary" className="gap-1">
                  {brand?.name}
                  <button onClick={() => setSelectedBrands(selectedBrands.filter((id) => id !== brandId))}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            {minRating && (
              <Badge variant="secondary" className="gap-1">
                {minRating}★ & above
                <button onClick={() => setMinRating(null)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {minDiscount && (
              <Badge variant="secondary" className="gap-1">
                {minDiscount}% off or more
                <button onClick={() => setMinDiscount(null)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h2>
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className={`grid gap-4 ${gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-4"} grid-cols-2`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <motion.div
                  layout
                  className={`grid gap-4 ${gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-4"} grid-cols-2`}
                >
                  <AnimatePresence mode="popLayout">
                    {paginatedProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProductCard
                          id={product.id}
                          slug={product.slug}
                          title={product.title}
                          price={Number(product.price)}
                          mrp={Number(product.mrp)}
                          image={product.images?.[0] || "/placeholder.svg"}
                          rating={Number(product.rating_avg) || 0}
                          ratingCount={product.rating_count || 0}
                          isBestSeller={product.is_best_seller || false}
                          isNew={product.is_new || false}
                          stock={product.stock || 0}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                          let page: number;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters to find what you're looking for
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </StoreLayout>
  );
}
