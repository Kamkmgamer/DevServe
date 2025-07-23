import { Outlet } from "react-router-dom";
import { AdminNavbar } from "./AdminNavbar";

export const AdminLayout = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <AdminNavbar />
    <div className="container mx-auto py-8">
      <Outlet />
    </div>
  </div>
);