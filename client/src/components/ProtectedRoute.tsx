import { useAuth } from "../contexts/AuthContext";
import { Outlet, Navigate } from "react-router-dom";
import LoadingSpinner from "./ui/LoadingSpinner";

export const ProtectedRoute = () => {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};