import { Route, Routes } from "react-router-dom";
import React from "react";

// Admin pages
const AdminDashboard = React.lazy(() => import("../pages/admin/AdminDashboard"));
const AdminPage = React.lazy(() => import("../pages/admin/AdminPage"));
const UserManagementPage = React.lazy(() => import("../pages/admin/UserManagementPage"));
const AdminServicesPage = React.lazy(() => import("../pages/admin/AdminServicesPage"));
const ServiceFormPage = React.lazy(() => import("../pages/admin/ServiceFormPage"));
const AdminBlogPage = React.lazy(() => import("../pages/admin/AdminBlogPage"));
const BlogFormPage = React.lazy(() => import("../pages/admin/BlogFormPage"));
const AdminCouponsPage = React.lazy(() => import("../pages/admin/AdminCouponsPage"));
const CouponFormPage = React.lazy(() => import("../pages/admin/CouponFormPage"));
const AdminPortfolioPage = React.lazy(() => import("../pages/admin/AdminPortfolioPage"));
const PortfolioFormPage = React.lazy(() => import("../pages/admin/PortfolioFormPage"));
const AdminOrdersPage = React.lazy(() => import("../pages/admin/AdminOrdersPage"));
const ReferralsPage = React.lazy(() => import("../pages/admin/ReferralsPage"));

const AdminRoutes = () => (
  <Routes>
    <Route path="/" element={<AdminDashboard />} />
    <Route path="/users" element={<UserManagementPage />} />
    <Route path="/services" element={<AdminServicesPage />} />
    <Route path="/services/new" element={<ServiceFormPage />} />
    <Route path="/services/:id/edit" element={<ServiceFormPage />} />
    <Route path="/blog" element={<AdminBlogPage />} />
    <Route path="/blog/new" element={<BlogFormPage />} />
    <Route path="/blog/:id/edit" element={<BlogFormPage />} />
    <Route path="/coupons" element={<AdminCouponsPage />} />
    <Route path="/coupons/new" element={<CouponFormPage />} />
    <Route path="/coupons/:id/edit" element={<CouponFormPage />} />
    <Route path="/portfolio" element={<AdminPortfolioPage />} />
    <Route path="/portfolio/new" element={<PortfolioFormPage />} />
    <Route path="/portfolio/:id/edit" element={<PortfolioFormPage />} />
    <Route path="/orders" element={<AdminOrdersPage />} />
    <Route path="/referrals" element={<ReferralsPage />} />
  </Routes>
);

export default AdminRoutes;
