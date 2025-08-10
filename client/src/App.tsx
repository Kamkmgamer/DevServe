import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import React, { Suspense, useState, useEffect } from "react";

// Layouts
import PublicLayout from "./components/layout/PublicLayout";
import { AdminLayout } from "./components/admin/AdminLayout";

// Routes
import PublicRoutes from "./routes/PublicRoutes";
import AdminRoutes from "./routes/AdminRoutes";

// Admin
import { ProtectedRoute } from "./components/ProtectedRoute";

// Toaster
import { Toaster } from "react-hot-toast";

import LoadingSpinner from "./components/ui/LoadingSpinner";
import OfflinePage from "./pages/OfflinePage";

function App() {
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (isOffline) {
    return <OfflinePage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route
              path="/*"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <PublicRoutes />
                </Suspense>
              }
            />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route
                path="/admin/*"
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminRoutes />
                  </Suspense>
                }
              />
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