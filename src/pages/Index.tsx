import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { HeroSlider } from "@/components/store/HeroSlider";
import { FlashSaleBanner } from "@/components/store/FlashSaleBanner";
import { AnnouncementTicker } from "@/components/store/AnnouncementTicker";
import { CategoryCard } from "@/components/store/CategoryCard";
import { ProductSection } from "@/components/store/ProductSection";
import { MidBannerRow, FullWidthBanner } from "@/components/store/Banner";
import { BrandCarousel } from "@/components/store/BrandCarousel";
import { BuyAgainSection } from "@/components/store/BuyAgainSection";
import { RecentlyViewedSection } from "@/components/store/RecentlyViewedSection";
import { CategoryGrid } from "@/components/store/CategoryGrid";
import { BudgetPicks } from "@/components/store/BudgetPicks";
import { TestimonialsCarousel } from "@/components/store/TestimonialsCarousel";
import { FeaturesStrip } from "@/components/store/FeaturesStrip";
import { CollectionBanners } from "@/components/store/CollectionBanners";
import { NewsletterSection } from "@/components/store/NewsletterSection";
import { TrendingSection } from "@/components/store/TrendingSection";
import { InstagramFeed } from "@/components/store/InstagramFeed";
import { PromoPopup } from "@/components/store/PromoPopup";
import { SectionDivider } from "@/components/store/SectionDivider";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function Index() {
  /**
   * ✅ FLASH SALE ON/OFF
   * false போட்டா banner வராது
   */
  const SHOW_FLASH_SALE = false;

  // ✅ Category row scroll ref
  const catScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollCats = (dir: "left" | "right") => {
    if (!catScrollRef.current) return;
    const amt = 520;
    catScrollRef.current.scrollBy({
      left: dir === "left" ? -amt : amt,
      behavior: "smooth",
    });
  };

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

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

  // Fetch hero banners
  const { data: heroBanners = [] } = useQuery({
    queryKey: ["banners", "hero"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("type", "hero")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data.map((b) => ({
        id: b.id,
        image: b.image_url,
        title: b.title || "",
        subtitle: b.subtitle || "",
        linkUrl: b.link_target || "/",
        linkText: "Shop Now",
      }));
    },
  });

  // Fetch mid banners
  const { data: midBanners = [] } = useQuery({
    queryKey: ["banners", "mid"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("type", "mid")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data.map((b) => ({
        id: b.id,
        image: b.image_url,
        title: b.title,
        subtitle: b.subtitle,
        linkUrl: b.link_target,
      }));
    },
  });

  // Fetch offer banner
  const { data: offerBanner } = useQuery({
    queryKey: ["banners", "offer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("type", "offer")
        .eq("is_active", true)
        .order("sort_order")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch featured/deal products
  const { data: dealProducts = [], isLoading: dealsLoading } = useQuery({
    queryKey: ["products", "deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data.map(mapProduct);
    },
  });

  // Fetch best sellers
  const { data: bestSellers = [], isLoading: bestsellersLoading } = useQuery({
    queryKey: ["products", "bestsellers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_best_seller", true)
        .order("rating_count", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data.map(mapProduct);
    },
  });

  // Fetch new arrivals
  const { data: newArrivals = [], isLoading: newLoading } = useQuery({
    queryKey: ["products", "new"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_new", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data.map(mapProduct);
    },
  });

  // Fetch all products for additional sections
  const { data: allProducts = [] } = useQuery({
    queryKey: ["products", "all-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data.map(mapProduct);
    },
  });

  // Fetch reviews for testimonials
  const { data: testimonials = [] } = useQuery({
    queryKey: ["reviews", "approved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, products(title, images)")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data.map((r: any) => ({
        id: r.id,
        name: r.title || "Happy Customer",
        rating: r.rating,
        comment: r.comment || "Great product!",
        productTitle: r.products?.title,
        productImage: r.products?.images?.[0],
      }));
    },
  });

  // Prepare category grid data
  const categoryGridItems = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image_url || undefined,
    icon: cat.icon || "📦",
  }));

  // Prepare collection banners from brands
  const brandBanners = brands.slice(0, 4).map((b) => ({
    id: b.id,
    image:
      b.logo_url ||
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
    title: b.name,
    subtitle: "Explore Collection",
    link: `/brand/${b.slug}`,
  }));

  // Trending items
  const trendingItems = [
    {
      id: "best-sellers",
      title: "Best Sellers",
      image:
        bestSellers[0]?.image ||
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
      link: "/best-sellers",
      badge: "🔥 Hot",
    },
    {
      id: "new-arrivals",
      title: "New Arrivals",
      image:
        newArrivals[0]?.image ||
        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80",
      link: "/new-arrivals",
      badge: "✨ New",
    },
    {
      id: "deals",
      title: "Today's Deals",
      image:
        dealProducts[0]?.image ||
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
      link: "/deals",
      badge: "💥 Sale",
    },
  ];

  return (
    <StoreLayout>
      {/* Promotional Popup */}
      <PromoPopup
        discountCode="WELCOME10"
        discountPercent={10}
        title="Welcome to AppsStore!"
        subtitle="Get exclusive deals on your first order"
      />

      {/* Announcement Ticker */}
      <AnnouncementTicker />

      {/* Hero Slider */}
      {heroBanners.length > 0 ? (
        <HeroSlider slides={heroBanners} />
      ) : (
        <div className="w-full aspect-[3/1] bg-secondary animate-pulse" />
      )}

      {/* ✅ Flash Sale Countdown Banner (OFF option) */}
      {SHOW_FLASH_SALE && (
        <FlashSaleBanner
          endTime={new Date(Date.now() + 8 * 60 * 60 * 1000)}
          title="⚡ Flash Sale"
          subtitle="Today Only"
          discount="Up to 70% OFF"
          link="/deals"
        />
      )}

      {/* Features Strip */}
      <FeaturesStrip />

      {/* ✅ Category Strip (Scrollable with arrows) */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Shop by Category</h2>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollCats("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollCats("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            ref={catScrollRef}
            className="flex gap-4 overflow-x-auto pb-3 no-scrollbar scroll-smooth"
          >
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                slug={cat.slug}
                name={cat.name}
                icon={cat.icon || "📦"}
                image={cat.image_url || undefined}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Buy Again Section - Only shows for logged in users with order history */}
      <BuyAgainSection />

      {/* Trending Section */}
      <TrendingSection items={trendingItems} />

      {/* Today's Deals */}
      {dealsLoading ? (
        <ProductSkeleton />
      ) : dealProducts.length > 0 ? (
        <ProductSection
          title="Today's Deals"
          subtitle="Limited time offers"
          products={dealProducts}
          viewAllLink="/deals"
          scrollable
        />
      ) : null}

      {/* Mid Banners */}
      {midBanners.length > 0 && <MidBannerRow banners={midBanners} />}

      {/* Category Grid */}
      {categoryGridItems.length > 0 && (
        <CategoryGrid
          title="Shop by Category"
          subtitle="Find what you're looking for"
          categories={categoryGridItems}
        />
      )}

      {/* Section Divider */}
      <SectionDivider variant="dots" />

      {/* Best Sellers */}
      {bestsellersLoading ? (
        <ProductSkeleton />
      ) : bestSellers.length > 0 ? (
        <ProductSection
          title="Best Sellers"
          subtitle="Most loved products"
          products={bestSellers}
          viewAllLink="/best-sellers"
        />
      ) : null}

      {/* Budget Picks */}
      <BudgetPicks />

      {/* Full Width Offer Banner */}
      {offerBanner && (
        <FullWidthBanner
          image={offerBanner.image_url}
          title={offerBanner.title || undefined}
          subtitle={offerBanner.subtitle || undefined}
          linkUrl={offerBanner.link_target || "/deals"}
        />
      )}

      {/* New Arrivals */}
      {newLoading ? (
        <ProductSkeleton />
      ) : newArrivals.length > 0 ? (
        <ProductSection
          title="New Arrivals"
          subtitle="Fresh from the press"
          products={newArrivals}
          viewAllLink="/new-arrivals"
          scrollable
        />
      ) : null}

      {/* Section Divider */}
      <SectionDivider variant="gradient" />

      {/* Brand Collection Banners */}
      {brandBanners.length > 0 && (
        <CollectionBanners banners={brandBanners} columns={4} />
      )}

      {/* More Products */}
      {allProducts.length > 0 && (
        <ProductSection
          title="Explore More"
          subtitle="Discover our collection"
          products={allProducts.slice(0, 10)}
          viewAllLink="/search"
        />
      )}

      {/* Recently Viewed */}
      <RecentlyViewedSection />

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <TestimonialsCarousel
          title="What Our Customers Say"
          testimonials={testimonials}
        />
      )}

      {/* Instagram Feed - Shop The Look */}
      <InstagramFeed />

      {/* Brands */}
      {brands.length > 0 && (
        <BrandCarousel
          brands={brands.map((b) => ({
            id: b.id,
            slug: b.slug,
            name: b.name,
            logo: b.logo_url || "",
          }))}
        />
      )}

      {/* Newsletter */}
      <NewsletterSection />
    </StoreLayout>
  );
}

// Helper to map DB product to component props
function mapProduct(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: Number(p.price),
    mrp: Number(p.mrp),
    image:
      p.images?.[0] ||
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
    rating: Number(p.rating_avg) || 0,
    ratingCount: p.rating_count || 0,
    isBestSeller: p.is_best_seller,
    isNew: p.is_new,
    stock: p.stock,
  };
}

function ProductSkeleton() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
