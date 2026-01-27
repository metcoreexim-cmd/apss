import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { LowStockAlerts } from "@/components/store/LowStockAlerts";
import { PriceDropAlerts } from "@/components/store/PriceDropAlerts";

const categories = [
  { name: "Notebooks", slug: "notebooks", icon: "📓" },
  { name: "Pens & Pencils", slug: "pens-pencils", icon: "✏️" },
  { name: "Art Supplies", slug: "art-supplies", icon: "🎨" },
  { name: "Desk Accessories", slug: "desk-accessories", icon: "🗄️" },
  { name: "Planners", slug: "planners", icon: "📅" },
  { name: "Gift Sets", slug: "gift-sets", icon: "🎁" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-foreground text-background text-center py-2 text-sm font-medium">
        <span className="animate-pulse-soft">🎉 Free Shipping on orders above ₹499!</span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Apss<span className="text-primary"></span>
              </h1>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for notebooks, pens, art supplies..."
                  className="w-full pl-10 pr-4 bg-secondary/50 border-0 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsCategoryOpen(true)}
                onMouseLeave={() => setIsCategoryOpen(false)}
              >
                <Button variant="ghost" className="flex items-center gap-1">
                  Categories
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-64 bg-card rounded-lg shadow-lg border p-2 mt-1"
                    >
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/category/${cat.slug}`}
                          className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-secondary transition-colors"
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <span className="font-medium">{cat.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/new-arrivals">
                <Button variant="ghost">New Arrivals</Button>
              </Link>
              <Link to="/best-sellers">
                <Button variant="ghost">Best Sellers</Button>
              </Link>
              <Link to="/deals">
                <Button variant="ghost" className="text-destructive">
                  Deals
                </Button>
              </Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-2">
              {/* Low Stock Alerts */}
              <div className="hidden sm:flex">
                <PriceDropAlerts />
              </div>

              <div className="hidden sm:flex">
                <LowStockAlerts />
              </div>

              <Link to="/wishlist" className="hidden sm:flex">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link to={user ? "/account" : "/auth"} className="hidden sm:flex">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pl-10 bg-secondary/50 border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t bg-background"
            >
              <div className="container py-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                  Categories
                </p>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
                <div className="border-t pt-2 mt-2">
                  <Link
                    to="/new-arrivals"
                    className="block px-3 py-2 rounded-md hover:bg-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    New Arrivals
                  </Link>
                  <Link
                    to="/best-sellers"
                    className="block px-3 py-2 rounded-md hover:bg-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Best Sellers
                  </Link>
                  <Link
                    to="/deals"
                    className="block px-3 py-2 rounded-md hover:bg-secondary text-destructive"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Deals & Offers
                  </Link>
                </div>
                <div className="border-t pt-2 mt-2">
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </Link>
                  <Link
                    to={user ? "/account" : "/auth"}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    {user ? "My Account" : "Login / Register"}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
