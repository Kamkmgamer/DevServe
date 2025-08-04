import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import { AdminLayout } from "./components/admin/AdminLayout";

// Public pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import PortfolioPage from "./pages/PortfolioPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPolicyPage";
import AboutPage from "./pages/AboutPage";
import CareersPage from "./pages/CareersPage";
import DocsPage from "./pages/DocsPage";
import GuidesPage from "./pages/GuidesPage";
import ApiPage from "./pages/ApiPage";
import CommunityPage from "./pages/CommunityPage";
import RoadmapPage from "./pages/RoadmapPage";
import ChangelogPage from "./pages/ChangelogPage";
import NotFoundPage from "./pages/NotFoundPage";

// Admin
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminPage from "./pages/admin/AdminPage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import ServiceFormPage from "./pages/admin/ServiceFormPage";
import AdminBlogPage from "./pages/admin/AdminBlogPage";
import BlogFormPage from "./pages/admin/BlogFormPage";
import AdminCouponsPage from "./pages/admin/AdminCouponsPage";
import CouponFormPage from "./pages/admin/CouponFormPage";
import AdminPortfolioPage from "./pages/admin/AdminPortfolioPage";
import PortfolioFormPage from "./pages/admin/PortfolioFormPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";

// Toaster
import { Toaster } from "react-hot-toast";

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/api" element={<ApiPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route path="/admin/services/new" element={<ServiceFormPage />} />
              <Route path="/admin/services/:id/edit" element={<ServiceFormPage />} />
              <Route path="/admin/blog" element={<AdminBlogPage />} />
              <Route path="/admin/blog/new" element={<BlogFormPage />} />
              <Route path="/admin/blog/:id/edit" element={<BlogFormPage />} />
              <Route path="/admin/coupons" element={<AdminCouponsPage />} />
              <Route path="/admin/coupons/new" element={<CouponFormPage />} />
              <Route path="/admin/coupons/:id/edit" element={<CouponFormPage />} />
              <Route path="/admin/portfolio" element={<AdminPortfolioPage />} />
              <Route path="/admin/portfolio/new" element={<PortfolioFormPage />} />
              <Route path="/admin/portfolio/:id/edit" element={<PortfolioFormPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}

export default App;