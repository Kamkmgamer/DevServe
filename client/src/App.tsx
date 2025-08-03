// client/src/App.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// layouts
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// public pages
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

// admin
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
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

// toaster
import { Toaster } from "react-hot-toast";

function App() {
  const location = useLocation();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/Register" element={<RegisterPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/blog/:id" element={<BlogDetailsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />


            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/services" element={<AdminServicesPage />} />
                <Route
                  path="/admin/services/new"
                  element={<ServiceFormPage />}
                />
                <Route
                  path="/admin/services/:id/edit"
                  element={<ServiceFormPage />}
                />
                <Route path="/admin/blog" element={<AdminBlogPage />} />
                <Route path="/admin/blog/new" element={<BlogFormPage />} />
                <Route
                  path="/admin/blog/:id/edit"
                  element={<BlogFormPage />}
                />
                <Route path="/admin/coupons" element={<AdminCouponsPage />} />
                <Route
                  path="/admin/coupons/new"
                  element={<CouponFormPage />}
                />
                <Route
                  path="/admin/coupons/:id/edit"
                  element={<CouponFormPage />}
                />
                <Route
                  path="/admin/portfolio"
                  element={<AdminPortfolioPage />}
                />
                <Route
                  path="/admin/portfolio/new"
                  element={<PortfolioFormPage />}
                />
                <Route
                  path="/admin/portfolio/:id/edit"
                  element={<PortfolioFormPage />}
                />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;