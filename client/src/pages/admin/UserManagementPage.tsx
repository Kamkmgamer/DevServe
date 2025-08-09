// client/src/pages/admin/UserManagementPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../../components/layout/Container";
import Button from "../../components/ui/Button";
import TagButton from "../../components/ui/TagButton";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  Grid,
  List,
  Search,
  SortAsc,
  SortDesc,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { User } from "../../types";
import UserForm from "../../components/admin/UserForm";
import { useAuth } from "../../contexts/AuthContext";

type SortKey = "name" | "email" | "role";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 12;

const UserManagementPage: React.FC = () => {
  const { user: loggedInUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const nav = useNavigate();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const applyMobileState = (matches: boolean) => {
      setIsMobile(matches);
      if (matches) {
        setViewMode("grid");
      }
    };
    applyMobileState(mq.matches);
    const handleChange = (e: MediaQueryListEvent) => {
      applyMobileState(e.matches);
    };
    if (mq.addEventListener) {
      mq.addEventListener("change", handleChange);
    } else {
      mq.addListener(handleChange);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handleChange);
      } else {
        mq.removeListener(handleChange);
      }
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<User[]>("/admin/users");
      setUsers(res.data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to load users";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);
      return matchesQuery;
    });
  }, [users, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = (a.name || "").localeCompare(b.name || "");
      else if (sortKey === "email") cmp = a.email.localeCompare(b.email);
      else if (sortKey === "role") cmp = a.role.localeCompare(b.role);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, pageSafe]);

  useEffect(() => {
    setPage(1);
  }, [query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleDelete = async (userId: string, userRole: string) => {
    if (!loggedInUser) {
      toast.error("You are not authenticated.");
      return;
    }

    if (loggedInUser.id === userId) {
      toast.error("You cannot delete your own account.");
      return;
    }

    if (userRole === "ADMIN" && loggedInUser.role !== "SUPERADMIN") {
      toast.error("Only superadmins can delete admin accounts.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
        toast.success("User deleted");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete user.");
      }
    }
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentUser(null);
  };

  const handleSaveForm = () => {
    fetchUsers();
    handleCloseForm();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="overflow-x-hidden"
    >
      <Container className="py-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              User Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Search, filter, sort and manage users.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isMobile && (
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                title="Table view"
              >
                <List className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              title="Grid view"
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button onClick={handleAddUser} variant="primary">
              Add User
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name, email, or ID…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-72 rounded-md border border-gray-300 bg-white py-2 pl-8 pr-3 text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                           dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Sort by
              </span>
              <Button
                variant="ghost"
                className={`h-9 px-3 text-sm ${
                  sortKey === "name" ? "text-blue-600 dark:text-blue-400" : ""
                }`}
                onClick={() => toggleSort("name")}
                aria-pressed={sortKey === "name"}
              >
                Name
              </Button>
              <Button
                variant="ghost"
                className={`h-9 px-3 text-sm ${
                  sortKey === "email" ? "text-blue-600 dark:text-blue-400" : ""
                }`}
                onClick={() => toggleSort("email")}
                aria-pressed={sortKey === "email"}
              >
                Email
              </Button>
              <Button
                variant="ghost"
                className={`h-9 px-3 text-sm ${
                  sortKey === "role" ? "text-blue-600 dark:text-blue-400" : ""
                }`}
                onClick={() => toggleSort("role")}
                aria-pressed={sortKey === "role"}
              >
                Role
              </Button>
              {sortDir === "asc" ? (
                <SortAsc className="h-4 w-4 text-gray-500" />
              ) : (
                <SortDesc className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
          {loading && (
            <div className="flex items-center justify-center p-10 text-gray-600 dark:text-gray-300">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading users…
            </div>
          )}

          {!loading && error && (
            <div className="p-10 text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-600 dark:text-gray-400">
              No users found. Try adjusting filters or add a new one.
            </div>
          )}

          {!loading && !error && sorted.length > 0 && (
            <>
              {viewMode === "table" && !isMobile ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Role
                        </th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                      <AnimatePresence initial={false}>
                        {paged.map((user, idx) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2, delay: idx * 0.02 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {user.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {user.email}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {user.role}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  className="flex items-center gap-1 px-2 py-1 text-sm"
                                  onClick={() => handleEditUser(user)}
                                  aria-label={`Edit ${user.name}`}
                                >
                                  <Pencil size={16} /> Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:text-red-700"
                                  onClick={() => handleDelete(user.id, user.role)}
                                  disabled={loggedInUser?.role !== "SUPERADMIN" && user.role === "ADMIN"}
                                  aria-label={`Delete ${user.name}`}
                                >
                                  <Trash2 size={16} /> Delete
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence initial={false}>
                    {paged.map((user) => (
                      <motion.div
                        key={user.id}
                        className="rounded-xl bg-white p-5 shadow hover:shadow-lg dark:bg-gray-900 transition"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {user.name || "N/A"}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                            {user.role}
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="secondary"
                            className="flex-1 px-2 py-1 text-sm"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            className="flex-1 px-2 py-1 text-sm text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(user.id, user.role)}
                            disabled={loggedInUser?.role !== "SUPERADMIN" && user.role === "ADMIN"}
                          >
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm dark:border-gray-700">
                  <div className="text-gray-600 dark:text-gray-400">
                    {filtered.length} result{filtered.length === 1 ? "" : "s"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pageSafe === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-gray-600 dark:text-gray-400">
                      Page {pageSafe} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={pageSafe === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {showForm && (
          <UserForm
            user={currentUser}
            onClose={handleCloseForm}
            onSave={handleSaveForm}
          />
        )}
      </Container>
    </motion.div>
  );
};

export default UserManagementPage;
