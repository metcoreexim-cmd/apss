import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, SlidersHorizontal, Grid3X3, LayoutGrid, X, Sparkles, TrendingUp, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PRODUCTS_PER_PAGE = 12;

const ratingOptions = [
  { value: "4", label: "4★ & above" },
  { value: "3", label: "3★ & above" },
  { value: "2", label: "2★ & above" },
];

const discountOptions = [
  { value: "50", label: "50% or more" },
  { value: "30", label: "30% or more" },
  { value: "20", label: "20% or more" },
  { value: "10", label: "10% or more" },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "discount", label: "Biggest Discount" },
];

type CollectionType = "new-arrivals" | "best-sellers" | "deals";

interface CollectionConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  filter: { column: string; value: boolean };
  gradient: string;
}

const collectionConfigs: Record<CollectionType, CollectionConfig> = {
  "new-arrivals": {
    title: "New Arrivals",
    subtitle: "Fresh products just landed in our store",
    icon: <Sparkles className="h-6 w-6" />,
    filter: { column: "is_new", value: true },
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  "best-sellers": {
    title: "Best Sellers",
    subtitle: "Our most loved and popular products",
    icon: <TrendingUp className="h-6 w-6" />,
    filter: { column: "is_best_seller", value: true },
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  "deals": {
    title: "Today's Deals",
    subtitle: "Limited time offers you don't want to miss",
    icon: <Percent className="h-6 w-6" />,
    filter: { column: "is_featured", value: true },
    gradient: "from-rose-500/20 to-pink-500/20",
  },
};

interface CollectionPageProps {
  type: CollectionType;
}

export default function CollectionPage({ type }: CollectionPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  
  const config = collectionConfigs[type];

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<string>("");
  const [minDiscount, setMinDiscount] = useState<string>("");
  const [sortBy, setSortBy] = useState("featured");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch brands
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Fetch products for this collection
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", "collection", type],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, brands(name, slug), categories(name, slug)")
        .eq("is_active", true);
      
      // Apply collection-specific filter
      if (type === "new-arrivals") {
        query = query.eq("is_new", true);
      } else if (type === "best-sellers") {
        query = query.eq("is_best_seller", true);
      } else if (type === "deals") {
        query = query.eq("is_featured", true);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Price filter
    filtered = filtered.filter(
      (p) => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]
    );

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => p.brand_id && selectedBrands.includes(p.brand_id));
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => p.category_id && selectedCategories.includes(p.category_id));
    }

    // Rating filter
    if (minRating) {
      filtered = filtered.filter((p) => (p.rating_avg || 0) >= parseInt(minRating));
    }

    // Discount filter
    if (minDiscount) {
      filtered = filtered.filter((p) => {
        const discount = ((Number(p.mrp) - Number(p.price)) / Number(p.mrp)) * 100;
        return discount >= parseInt(minDiscount);
      });
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
        break;
      case "discount":
        filtered.sort((a, b) => {
          const discA = ((Number(a.mrp) - Number(a.price)) / Number(a.mrp)) * 100;
          const discB = ((Number(b.mrp) - Number(b.price)) / Number(b.mrp)) * 100;
          return discB - discA;
        });
        break;
      default:
        // Featured - keep original order
        break;
    }

    return filtered;
  }, [products, priceRange, selectedBrands, selectedCategories, minRating, minDiscount, sortBy]);

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
    setSelectedCategories([]);
    setMinRating("");
    setMinDiscount("");
  };

  const activeFilterCount = 
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0) +
    selectedBrands.length +
    selectedCategories.length +
    (minRating ? 1 : 0) +
    (minDiscount ? 1 : 0);

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold">
          Price Range
          <SlidersHorizontal className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <Slider
            value={priceRange}
            onValueChange={(v) => setPriceRange(v as [number, number])}
            max={10000}
            step={100}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold">
          Category
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-2 max-h-48 overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, cat.id]);
                  } else {
                    setSelectedCategories(selectedCategories.filter((id) => id !== cat.id));
                  }
                }}
              />
              <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                {cat.name}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Brands */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold">
          Brand
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-2 max-h-48 overflow-y-auto">
          {brands.map((brand) => (
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
              <label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer">
                {brand.name}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Rating */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold">
          Rating
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-2">
          {ratingOptions.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${opt.value}`}
                checked={minRating === opt.value}
                onCheckedChange={(checked) => setMinRating(checked ? opt.value : "")}
              />
              <label htmlFor={`rating-${opt.value}`} className="text-sm cursor-pointer">
                {opt.label}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Discount */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold">
          Discount
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-2">
          {discountOptions.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <Checkbox
                id={`discount-${opt.value}`}
                checked={minDiscount === opt.value}
                onCheckedChange={(checked) => setMinDiscount(checked ? opt.value : "")}
              />
              <label htmlFor={`discount-${opt.value}`} className="text-sm cursor-pointer">
                {opt.label}
              </label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <StoreLayout>
      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${config.gradient} py-12 md:py-16`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="p-3 rounded-full bg-background/80 backdrop-blur-sm">
              {config.icon}
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {config.title}
              </h1>
              <p className="text-muted-foreground mt-1">{config.subtitle}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
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
              {filteredProducts.length} products
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden md:flex items-center gap-1">
              <Button
                variant={gridCols === 3 ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setGridCols(3)}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={gridCols === 4 ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setGridCols(4)}
              >
                <LayoutGrid className="h-4 w-4" />
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
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setPriceRange([0, 10000])}
                />
              </Badge>
            )}
            {selectedCategories.map((catId) => {
              const cat = categories.find((c) => c.id === catId);
              return (
                <Badge key={catId} variant="secondary" className="gap-1">
                  {cat?.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedCategories(selectedCategories.filter((id) => id !== catId))}
                  />
                </Badge>
              );
            })}
            {selectedBrands.map((brandId) => {
              const brand = brands.find((b) => b.id === brandId);
              return (
                <Badge key={brandId} variant="secondary" className="gap-1">
                  {brand?.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedBrands(selectedBrands.filter((id) => id !== brandId))}
                  />
                </Badge>
              );
            })}
            {minRating && (
              <Badge variant="secondary" className="gap-1">
                {minRating}★ & above
                <X className="h-3 w-3 cursor-pointer" onClick={() => setMinRating("")} />
              </Badge>
            )}
            {minDiscount && (
              <Badge variant="secondary" className="gap-1">
                {minDiscount}% off or more
                <X className="h-3 w-3 cursor-pointer" onClick={() => setMinDiscount("")} />
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <Button variant="link" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-2 md:grid-cols-3 ${
                    gridCols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
                  } gap-4 md:gap-6`}
                >
                  {paginatedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard
                        id={product.id}
                        slug={product.slug}
                        title={product.title}
                        price={Number(product.price)}
                        mrp={Number(product.mrp)}
                        image={product.images?.[0] || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80"}
                        rating={Number(product.rating_avg) || 0}
                        ratingCount={product.rating_count || 0}
                        isBestSeller={product.is_best_seller || false}
                        isNew={product.is_new || false}
                        stock={product.stock}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          if (totalPages <= 5) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, index, arr) => (
                          <PaginationItem key={page}>
                            {index > 0 && arr[index - 1] !== page - 1 && (
                              <span className="px-2">...</span>
                            )}
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

