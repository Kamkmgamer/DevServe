import { Route } from "react-router-dom";
import React from "react";

// Admin pages
const AdminPage = React.lazy(() => import("../pages/admin/AdminPage"));
const AdminServicesPage = React.lazy(() => import("../pages/admin/AdminServicesPage"));
const ServiceFormPage = React.lazy(() => import("../pages/admin/ServiceFormPage"));
const AdminBlogPage = React.lazy(() => import("../pages/admin/AdminBlogPage"));
const BlogFormPage = React.lazy(() => import("../pages/admin/BlogFormPage"));
const AdminCouponsPage = React.lazy(() => import("../pages/admin/AdminCouponsPage"));
const CouponFormPage = React.lazy(() => import("../pages/admin/CouponFormPage"));
const AdminPortfolioPage = React.lazy(() => import("../pages/admin/AdminPortfolioPage"));
const PortfolioFormPage = React.lazy(() => import("../pages/admin/PortfolioFormPage"));
const AdminOrdersPage = React.lazy(() => import("../pages/admin/AdminOrdersPage"));

const AdminRoutes = () => (
  <>
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
  </>
);

export default AdminRoutes;
