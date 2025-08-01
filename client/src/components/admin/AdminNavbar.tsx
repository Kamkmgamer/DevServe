import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/blog", label: "Blog" },
  { to: "/admin/orders", label: "Orders" },
];

export const AdminNavbar = () => (
  <nav className="bg-white dark:bg-gray-900 shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-start h-16 space-x-6">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `relative px-2 py-1 text-sm font-medium transition-colors duration-300 ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {link.label}
                <span
                  className={`absolute left-0 -bottom-1 h-0.5 w-full rounded bg-blue-500 transition-all duration-300 ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  </nav>
);