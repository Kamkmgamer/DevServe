// client/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

// Public layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Public pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import PortfolioPage from "./pages/PortfolioPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import BlogPage from "./pages/BlogPage";

// Admin layout & guard
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";

// Admin dashboard (summary)
import AdminPage from "./pages/AdminPage";

// Admin Services CRUD
import AdminServicesPage from "./pages/AdminServicesPage";
import ServiceFormPage from "./pages/ServiceFormPage";

// Admin Portfolio CRUD
import AdminPortfolioPage from "./pages/AdminPortfolioPage";
import PortfolioFormPage from "./pages/PortfolioFormPage";
import PortfolioDetailPage from "./pages/PortfolioDetailPage";

// Admin Blog CRUD
import AdminBlogPage from "./pages/AdminBlogPage";
import BlogFormPage from "./pages/BlogFormPage";
// Toaster
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <Routes>

          {/*** Public Routes ***/}
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/Blog" element={<BlogPage />} />

          {/*** Admin Routes ***/}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              {/* Dashboard */}
              <Route path="/admin" element={<AdminPage />} />

              {/* Services CRUD */}
              <Route path="/admin/services" element={<AdminServicesPage />} />
              <Route
                path="/admin/services/new"
                element={<ServiceFormPage />}
              />
              <Route
                path="/admin/services/:id/edit"
                element={<ServiceFormPage />}
              />

              {/* Portfolio CRUD */}
              {/* <Route
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
              <Route path="/portfolio/:id" element={<PortfolioDetailPage />} /> */}
              <Route
                path="/portfolio"
                element={<Navigate to="https://portfolio-delta-ruby-48.vercel.app/" replace />}
              />


              {/* Blog CRUD */}
              <Route path="/admin/blog" element={<AdminBlogPage />} />
              <Route path="/admin/blog/new" element={<BlogFormPage />} />
              <Route
                path="/admin/blog/:id/edit"
                element={<BlogFormPage />}
              />
            </Route>
          </Route>

          {/*** Catch-all redirect to home ***/}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;