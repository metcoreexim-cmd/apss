import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import { CompareProvider } from "@/hooks/useCompare";
import { CompareBar } from "@/components/store/CompareBar";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import CategoryPage from "./pages/CategoryPage";
import WishlistPage from "./pages/WishlistPage";
import SearchPage from "./pages/SearchPage";
import NewArrivalsPage from "./pages/NewArrivalsPage";
import BestSellersPage from "./pages/BestSellersPage";
import DealsPage from "./pages/DealsPage";
import ComparePage from "./pages/ComparePage";
import NotFound from "./pages/NotFound";
import AllBrandsPage from "@/pages/AllBrandsPage";
import AllCategoriesPage from "@/pages/AllCategoriesPage";
import TrackOrderPage from "./pages/TrackOrderPage"
import ShippingPolicyPage from "@/pages/ShippingPolicyPage";
import ReturnsRefundsPage from "@/pages/ReturnsRefundsPage";
import AboutUsPage from "@/pages/AboutUsPage";
import FAQsPage from "./pages/FAQsPage"
import ContactUsPage from "./pages/ContactUsPage"
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage"
import TermsPage from "./pages/TermsPage"
import BrandPage from "./pages/BrandPage"
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminReviews from "./pages/admin/AdminReviews";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                <Route path="/best-sellers" element={<BestSellersPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/brands" element={<AllBrandsPage />} />
                <Route path="/categories" element={<AllCategoriesPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="/returns-refunds" element={<ReturnsRefundsPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/brand/:slug" element={<BrandPage />} />
                <Route path="/admin-auth" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="brands" element={<AdminBrands />} />
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="reviews" element={<AdminReviews />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CompareBar />
            </BrowserRouter>
          </TooltipProvider>
        </CompareProvider>
      </WishlistProvider>
    </CartProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;