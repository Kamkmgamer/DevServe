import { Route, Routes } from "react-router-dom";
import React from "react";

// Public pages
const HomePage = React.lazy(() => import("../pages/HomePage"));
const ServicesPage = React.lazy(() => import("../pages/ServicesPage"));
const ServiceDetailPage = React.lazy(() => import("../pages/ServiceDetailPage"));
const PortfolioPage = React.lazy(() => import("../pages/PortfolioPage"));
const PricingPage = React.lazy(() => import("../pages/PricingPage"));
const ContactPage = React.lazy(() => import("../pages/ContactPage"));
const CartPage = React.lazy(() => import("../pages/CartPage"));
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"));
const BlogPage = React.lazy(() => import("../pages/BlogPage"));
const BlogDetailsPage = React.lazy(() => import("../pages/BlogDetailsPage"));
const CheckoutPage = React.lazy(() => import("../pages/CheckoutPage"));
const TermsPage = React.lazy(() => import("../pages/TermsPage"));
const PrivacyPage = React.lazy(() => import("../pages/PrivacyPolicyPage"));
const AboutPage = React.lazy(() => import("../pages/AboutPage"));
const CareersPage = React.lazy(() => import("../pages/CareersPage"));
const DocsPage = React.lazy(() => import("../pages/DocsPage"));
const GuidesPage = React.lazy(() => import("../pages/GuidesPage"));
const ApiPage = React.lazy(() => import("../pages/ApiPage"));
const CommunityPage = React.lazy(() => import("../pages/CommunityPage"));
const RoadmapPage = React.lazy(() => import("../pages/RoadmapPage"));
const ChangelogPage = React.lazy(() => import("../pages/ChangelogPage"));
const GettingStartedGuide = React.lazy(() => import("../pages/GettingStartedGuide"));
const DeployingGuide = React.lazy(() => import("../pages/DeployingGuide"));
const AuthenticationGuide = React.lazy(() => import("../pages/AuthenticationGuide"));
const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));
const PromoterPage = React.lazy(() => import("../pages/PromoterPage"));
import { ProtectedRoute } from "../components/ProtectedRoute";

const PublicRoutes = () => (
  <Routes>
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
    <Route path="/ApplicationProgrammingInterface" element={<ApiPage />} />
    <Route path="/community" element={<CommunityPage />} />
    <Route path="/roadmap" element={<RoadmapPage />} />
    <Route path="/changelog" element={<ChangelogPage />} />
    <Route path="/GettingStartedGuide" element={<GettingStartedGuide />} />
    <Route path="/DeployingGuide" element={<DeployingGuide />} />
    <Route path="/changeAuthenticationGuidelog" element={<ChangelogPage />} />
    <Route path="/promoter" element={<ProtectedRoute />}>
      <Route index element={<PromoterPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default PublicRoutes;
