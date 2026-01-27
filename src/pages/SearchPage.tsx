import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Grid3X3,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

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

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1");

  // keep input synced with URL q
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

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

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ["categories-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // ✅ Suggestions Query (products + brands + categories)
  const { data: suggestionsData } = useQuery({
    queryKey: ["search-suggestions", searchInput],
    queryFn: async () => {
      const q = searchInput.trim();
      if (!q) return { products: [], brands: [], categories: [] };

      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        supabase
          .from("products")
          .select("id, title, slug, price, mrp, images")
          .eq("is_active", true)
          .ilike("title", `%${q}%`)
          .limit(6),

        supabase
          .from("brands")
          .select("id, name, slug, logo_url")
          .eq("is_active", true)
          .ilike("name", `%${q}%`)
          .limit(6),

        supabase
          .from("categories")
          .select("id, name, slug, image_url")
          .eq("is_active", true)
          .ilike("name", `%${q}%`)
          .limit(6),
      ]);

      return {
        products: productsRes.data || [],
        brands: brandsRes.data || [],
        categories: categoriesRes.data || [],
      };
    },
    enabled: !!searchInput.trim(),
    staleTime: 1000,
  });

  const hasSuggestions =
    (suggestionsData?.products?.length || 0) > 0 ||
    (suggestionsData?.brands?.length || 0) > 0 ||
    (suggestionsData?.categories?.length || 0) > 0;

  // Fetch products matching search query
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ["search-products", query],
    queryFn: async () => {
      if (!query.trim()) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*, brands(name, slug), categories(name, slug)")
        .eq("is_active", true)
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query.toLowerCase()}}`
        );

      if (error) throw error;
      return data;
    },
    enabled: !!query.trim(),
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = allProducts.filter((product: any) => {
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

      // Category filter
      if (selectedCategories.length > 0 && product.category_id) {
        if (!selectedCategories.includes(product.category_id)) {
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
        filtered.sort((a: any, b: any) => Number(a.price) - Number(b.price));
        break;
      case "price-high":
        filtered.sort((a: any, b: any) => Number(b.price) - Number(a.price));
        break;
      case "newest":
        filtered.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "rating":
        filtered.sort(
          (a: any, b: any) =>
            (Number(b.rating_avg) || 0) - (Number(a.rating_avg) || 0)
        );
        break;
      case "discount":
        filtered.sort(
          (a: any, b: any) =>
            (b.discount_percent || 0) - (a.discount_percent || 0)
        );
        break;
      default:
        // Relevance - featured first, then by rating
        filtered.sort((a: any, b: any) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (Number(b.rating_avg) || 0) - (Number(a.rating_avg) || 0);
        });
    }

    return filtered;
  }, [
    allProducts,
    priceRange,
    selectedBrands,
    selectedCategories,
    minRating,
    minDiscount,
    sortBy,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQuery = formData.get("search") as string;

    if (newQuery.trim()) {
      setShowSuggestions(false);
      setSearchParams({ q: newQuery.trim() });
    }
  };

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setMinRating(null);
    setMinDiscount(null);
  };

  const activeFilterCount = [
    priceRange[0] > 0 || priceRange[1] < 10000,
    selectedBrands.length > 0,
    selectedCategories.length > 0,
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

      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <h3 className="font-semibold">Categories</h3>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-3 max-h-48 overflow-y-auto">
          {categories?.map((category: any) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([
                      ...selectedCategories,
                      category.id,
                    ]);
                  } else {
                    setSelectedCategories(
                      selectedCategories.filter((id) => id !== category.id)
                    );
                  }
                }}
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="text-sm cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
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
          {brands?.map((brand: any) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBrands([...selectedBrands, brand.id]);
                  } else {
                    setSelectedBrands(
                      selectedBrands.filter((id) => id !== brand.id)
                    );
                  }
                }}
              />
              <Label
                htmlFor={`brand-${brand.id}`}
                className="text-sm cursor-pointer"
              >
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
              <Label
                htmlFor={`rating-${option.value}`}
                className="text-sm cursor-pointer"
              >
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
              <Label
                htmlFor={`discount-${option.value}`}
                className="text-sm cursor-pointer"
              >
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
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-6">
            <div ref={wrapperRef} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

              <Input
                name="search"
                type="search"
                placeholder="Search for products..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (searchInput.trim()) setShowSuggestions(true);
                }}
                className="w-full pl-12 pr-4 h-12 text-lg bg-secondary/50 border-0 focus-visible:ring-primary"
              />

              {/* ✅ Suggestions Dropdown */}
              {showSuggestions && searchInput.trim() && (
                <div
                  className={cn(
                    "absolute top-full mt-2 w-full rounded-2xl border bg-popover shadow-xl z-50 overflow-hidden"
                  )}
                >
                  {!hasSuggestions ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      No suggestions found
                    </div>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto">
                      {/* Products */}
                      {suggestionsData?.products?.length > 0 && (
                        <div className="p-3">
                          <div className="text-xs font-semibold text-muted-foreground px-2 pb-2">
                            Products
                          </div>

                          <div className="space-y-1">
                            {suggestionsData.products.map((p: any) => (
                              <Link
                                key={p.id}
                                to={`/product/${p.slug}`}
                                onClick={() => setShowSuggestions(false)}
                                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted transition"
                              >
                                <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                                  <img
                                    src={p.images?.[0] || "/placeholder.svg"}
                                    alt={p.title}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {p.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    ₹{Number(p.price)}
                                    {p.mrp ? (
                                      <span className="ml-2 line-through opacity-60">
                                        ₹{Number(p.mrp)}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Brands */}
                      {suggestionsData?.brands?.length > 0 && (
                        <div className="p-3">
                          <div className="text-xs font-semibold text-muted-foreground px-2 pb-2">
                            Brands
                          </div>

                          <div className="space-y-1">
                            {suggestionsData.brands.map((b: any) => (
                              <Link
                                key={b.id}
                                to={`/brand/${b.slug}`}
                                onClick={() => setShowSuggestions(false)}
                                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted transition"
                              >
                                <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                                  {b.logo_url ? (
                                    <img
                                      src={b.logo_url}
                                      alt={b.name}
                                      className="h-full w-full object-contain p-1"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      {b.name?.[0] || "B"}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm font-medium">
                                  {b.name}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Categories */}
                      {suggestionsData?.categories?.length > 0 && (
                        <div className="p-3">
                          <div className="text-xs font-semibold text-muted-foreground px-2 pb-2">
                            Categories
                          </div>

                          <div className="space-y-1">
                            {suggestionsData.categories.map((c: any) => (
                              <Link
                                key={c.id}
                                to={`/category/${c.slug}`}
                                onClick={() => setShowSuggestions(false)}
                                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted transition"
                              >
                                <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                                  <img
                                    src={c.image_url || "/placeholder.svg"}
                                    alt={c.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="text-sm font-medium">
                                  {c.name}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* View all */}
                      <div className="p-3 border-t">
                        <Button
                          type="submit"
                          className="w-full"
                          onClick={() => setShowSuggestions(false)}
                        >
                          Search “{searchInput.trim()}”
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>

          {query && (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">
                Search results for "{query}"
              </h1>
              <p className="text-muted-foreground">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""} found
              </p>
            </div>
          )}
        </div>

        {!query ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Start your search</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a keyword above to find products. Try searching for notebooks,
              pens, art supplies, and more.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet
                  open={isMobileFilterOpen}
                  onOpenChange={setIsMobileFilterOpen}
                >
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

                {selectedCategories.map((categoryId) => {
                  const category = categories?.find((c: any) => c.id === categoryId);
                  return (
                    <Badge key={categoryId} variant="secondary" className="gap-1">
                      {category?.name}
                      <button
                        onClick={() =>
                          setSelectedCategories(
                            selectedCategories.filter((id) => id !== categoryId)
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}

                {selectedBrands.map((brandId) => {
                  const brand = brands?.find((b: any) => b.id === brandId);
                  return (
                    <Badge key={brandId} variant="secondary" className="gap-1">
                      {brand?.name}
                      <button
                        onClick={() =>
                          setSelectedBrands(
                            selectedBrands.filter((id) => id !== brandId)
                          )
                        }
                      >
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
                  <div
                    className={`grid gap-4 ${
                      gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-4"
                    } grid-cols-2`}
                  >
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
                      className={`grid gap-4 ${
                        gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-4"
                      } grid-cols-2`}
                    >
                      <AnimatePresence mode="popLayout">
                        {paginatedProducts.map((product: any) => (
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
                                onClick={() =>
                                  handlePageChange(Math.max(1, currentPage - 1))
                                }
                                className={
                                  currentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>

                            {Array.from({ length: Math.min(5, totalPages) }).map(
                              (_, i) => {
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
                              }
                            )}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() =>
                                  handlePageChange(
                                    Math.min(totalPages, currentPage + 1)
                                  )
                                }
                                className={
                                  currentPage === totalPages
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No products found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or filters to find what you're
                      looking for
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </main>
            </div>
          </>
        )}
      </div>
    </StoreLayout>
  );
}
