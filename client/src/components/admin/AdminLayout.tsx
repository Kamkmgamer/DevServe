import { Outlet, useLocation, Link } from "react-router-dom";
import { AdminNavbar } from "./AdminNavbar";
import { Fragment, useMemo } from "react";
import Container from "../layout/Container";

const useBreadcrumbs = () => {
  const { pathname } = useLocation();
  // /admin/services/123/edit => ["admin","services","123","edit"]
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((seg, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    const label = decodeURIComponent(seg)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });
  return crumbs;
};

export const AdminLayout = () => {
  const crumbs = useBreadcrumbs();

  const pageTitle = useMemo(() => {
    const last = crumbs[crumbs.length - 1]?.label || "Admin";
    // Prefer a friendlier title for numeric IDs
    return /\d+/.test(last) ? "Details" : last;
  }, [crumbs]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <AdminNavbar />

      {/* Subheader: breadcrumbs and title */}
      <div className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <Container className="py-4">
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
          <nav className="mt-1 text-sm text-slate-600 dark:text-slate-400" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <Fragment key={c.href}>
                {i > 0 && <span className="mx-1 opacity-60">/</span>}
                {i < crumbs.length - 1 ? (
                  <Link to={c.href} className="hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-medium">
                    {c.label}
                  </span>
                )}
              </Fragment>
            ))}
          </nav>
        </Container>
      </div>

      {/* Main content area */}
      <Container className="py-8">
        <Outlet />
      </Container>
    </div>
  );
};