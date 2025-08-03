
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Container from "../../components/layout/Container";
import { HiArrowsUpDown, HiMagnifyingGlass } from "react-icons/hi2";

type Order = {
  id: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  lineItems: { service: { name: string } }[];
};

const statusOptions = [
  "PENDING",
  "PAID",
  "IN_TECHNICAL_REVIEW",
  "APPROVED",
  "FAILED",
  "REFUNDED",
  "CANCELED",
];

type SortKey = "createdAt" | "total" | "email" | "status";
type SortDir = "asc" | "desc";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get<Order[]>("/admin/orders")
      .then((res) => setOrders(res.data))
      .catch(() => {
        setError("Failed to load orders");
        toast.error("Failed to load orders");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.lineItems
          .map((li) => li.service.name.toLowerCase())
          .join(", ")
          .includes(q);
      const matchesStatus =
        statusFilter === "ALL" ? true : o.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortKey === "total") {
        cmp = a.total - b.total;
      } else if (sortKey === "email") {
        cmp = a.email.localeCompare(b.email);
      } else if (sortKey === "status") {
        cmp = a.status.localeCompare(b.status);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const prev = orders;
    setUpdatingId(id);
    // optimistic
    setOrders((prevState) =>
      prevState.map((o) => (o.id === id ? { ...o, status } : o))
    );
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      toast.success("Status updated");
    } catch {
      setOrders(prev); // revert
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const prev = orders;
    // optimistic
    setOrders((prevState) =>
      prevState.map((o) => (selectedIds.has(o.id) ? { ...o, status } : o))
    );
    try {
      await Promise.all(
        ids.map((id) => api.patch(`/admin/orders/${id}/status`, { status }))
      );
      toast.success(`Updated ${ids.length} orders`);
      setSelectedIds(new Set());
    } catch {
      setOrders(prev);
      toast.error("Bulk update failed");
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    const idsOnPage = paged.map((o) => o.id);
    setSelectedIds(new Set(idsOnPage));
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prevSet) => {
      const next = new Set(prevSet);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const StatusPill = ({ value }: { value: string }) => {
    const map: Record<
      string,
      { bg: string; text: string; dot: string; label: string }
    > = {
      PENDING: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-800 dark:text-amber-200",
        dot: "bg-amber-500",
        label: "Pending",
      },
      PAID: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-200",
        dot: "bg-blue-500",
        label: "Paid",
      },
      IN_TECHNICAL_REVIEW: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-200",
        dot: "bg-purple-500",
        label: "Technical review",
      },
      APPROVED: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-800 dark:text-emerald-200",
        dot: "bg-emerald-500",
        label: "Approved",
      },
      FAILED: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-200",
        dot: "bg-red-500",
        label: "Failed",
      },
      REFUNDED: {
        bg: "bg-cyan-100 dark:bg-cyan-900/30",
        text: "text-cyan-800 dark:text-cyan-200",
        dot: "bg-cyan-500",
        label: "Refunded",
      },
      CANCELED: {
        bg: "bg-gray-200 dark:bg-gray-700",
        text: "text-gray-800 dark:text-gray-200",
        dot: "bg-gray-500",
        label: "Canceled",
      },
    };
    const s = map[value] ?? map.PENDING;
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    );
  };

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Orders
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Monitor, filter, and update customer orders.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <HiMagnifyingGlass className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, email, or item…"
              className="w-72 rounded-md border border-gray-300 bg-white pl-8 pr-3 py-2 text-sm
                         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                         dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                       dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="ALL">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            id="select-all"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
            checked={
              paged.length > 0 &&
              paged.every((o) => selectedIds.has(o.id))
            }
            onChange={(e) => toggleSelectAll(e.target.checked)}
            aria-label="Select all on page"
          />
          <label
            htmlFor="select-all"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Select page
          </label>

          {selectedIds.size > 0 && (
            <div className="ml-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {selectedIds.size} selected
              </span>
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  void bulkUpdateStatus(e.target.value);
                  e.currentTarget.selectedIndex = 0;
                }}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs
                           dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Bulk: change status…</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="w-10 px-3 py-3">
                  <span className="sr-only">Select</span>
                </th>
                <SortableTh
                  label="Created"
                  active={sortKey === "createdAt"}
                  dir={sortDir}
                  onClick={() => toggleSort("createdAt")}
                />
                <SortableTh
                  label="Email"
                  active={sortKey === "email"}
                  dir={sortDir}
                  onClick={() => toggleSort("email")}
                />
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Items
                </th>
                <SortableTh
                  label="Total"
                  active={sortKey === "total"}
                  dir={sortDir}
                  onClick={() => toggleSort("total")}
                />
                <SortableTh
                  label="Status"
                  active={sortKey === "status"}
                  dir={sortDir}
                  onClick={() => toggleSort("status")}
                />
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && (
                <tr>
                  <td colSpan={7} className="p-6">
                    <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Spinner />
                      Loading orders…
                    </div>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="p-6">
                    <div className="text-center text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10">
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                      No orders found. Try adjusting filters or search.
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                paged.map((order) => {
                  const isChecked = selectedIds.has(order.id);
                  return (
                    <tr
                      key={order.id}
                      className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750"
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-700"
                          checked={isChecked}
                          onChange={(e) =>
                            toggleSelectOne(order.id, e.target.checked)
                          }
                          aria-label={`Select order ${order.id}`}
                        />
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {new Date(
                              order.createdAt
                            ).toLocaleDateString()}{" "}
                            {new Date(
                              order.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: {order.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <span className="text-gray-900 dark:text-gray-100">
                          {order.email}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="line-clamp-2">
                          {order.lineItems
                            .map((li) => li.service.name)
                            .join(", ")}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ${(order.total / 100).toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill value={order.status} />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatus(order.id, e.target.value)
                            }
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs
                                       dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            disabled={updatingId === order.id}
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          {updatingId === order.id && <Spinner size="sm" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <button
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
            >
              Previous
            </button>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Page {pageSafe} of {totalPages}
            </div>
            <button
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Container>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th
      scope="col"
      className="select-none px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300"
    >
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 ${
          active ? "text-blue-600 dark:text-blue-400" : ""
        }`}
      >
        {label}
        <HiArrowsUpDown className="h-4 w-4 opacity-70" />
        <span className="sr-only">
          Sort {active ? (dir === "asc" ? "descending" : "ascending") : ""}
        </span>
      </button>
    </th>
  );
}

function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
  const cls =
    size === "sm"
      ? "h-4 w-4 border-2"
      : "h-5 w-5 border-[3px]";
  return (
    <span
      className={`${cls} inline-block animate-spin rounded-full border-gray-300 border-t-transparent dark:border-gray-600`}
      aria-label="Loading"
      role="status"
    />
  );
}
