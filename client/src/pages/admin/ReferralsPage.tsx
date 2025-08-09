// client/src/pages/admin/ReferralsPage.tsx
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

type Referral = {
  id: string;
  userId: string;
  code: string;
  commissionRate: number;
  _count: {
    referredUsers: number;
    orders: number;
  };
  commissions: {
    id: string;
    orderId: string;
    amount: number;
    status: string;
  }[];
};

type SortKey = "userId" | "code" | "commissionRate" | "referredUsers" | "orders" | "totalEarnings";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 12;

const ReferralsPage: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("userId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

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

  const fetchReferrals = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<Referral[]>("/referrals");
      setReferrals(data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to load referrals";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReferrals();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return referrals.filter((r) => {
      const matchesQuery =
        !q ||
        r.userId.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q);
      return matchesQuery;
    });
  }, [referrals, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "userId") cmp = a.userId.localeCompare(b.userId);
      else if (sortKey === "code") cmp = a.code.localeCompare(b.code);
      else if (sortKey === "commissionRate") cmp = a.commissionRate - b.commissionRate;
      else if (sortKey === "referredUsers") cmp = a._count.referredUsers - b._count.referredUsers;
      else if (sortKey === "orders") cmp = a._count.orders - b._count.orders;
      else if (sortKey === "totalEarnings") {
        const aEarnings = a.commissions.reduce((acc, c) => acc + c.amount, 0);
        const bEarnings = b.commissions.reduce((acc, c) => acc + c.amount, 0);
        cmp = aEarnings - bEarnings;
      }
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

  const createPayout = async (referralId: string, amount: number) => {
    try {
      await api.post("/payouts", { referralId, amount });
      fetchReferrals();
      toast.success("Payout created");
    } catch (error) {
      toast.error("Failed to create payout");
    }
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
              Manage Referrals
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Search, filter, sort and manage referrals.
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
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search by user ID or code…"
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
                  sortKey === "userId" ? "text-blue-600 dark:text-blue-400" : ""
                }`}
                onClick={() => toggleSort("userId")}
                aria-pressed={sortKey === "userId"}
              >
                User
              </Button>
              <Button
                variant="ghost"
                className={`h-9 px-3 text-sm ${
                  sortKey === "code" ? "text-blue-600 dark:text-blue-400" : ""
                }`}
                onClick={() => toggleSort("code")}
                aria-pressed={sortKey === "code"}
              >
                Code
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
              Loading referrals…
            </div>
          )}

          {!loading && error && (
            <div className="p-10 text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-600 dark:text-gray-400">
              No referrals found.
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
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Commission Rate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Referred Users
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Orders
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                          Total Earnings
                        </th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                      <AnimatePresence initial={false}>
                        {paged.map((referral, idx) => (
                          <motion.tr
                            key={referral.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2, delay: idx * 0.02 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                              {referral.userId}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {referral.code}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {referral.commissionRate * 100}%
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {referral._count.referredUsers}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {referral._count.orders}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                              $
                              {referral.commissions
                                .reduce((acc, c) => acc + c.amount, 0) /
                                100}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  className="flex items-center gap-1 px-2 py-1 text-sm"
                                  onClick={() => setSelectedReferral(referral)}
                                >
                                  View
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
                    {paged.map((referral) => (
                      <motion.div
                        key={referral.id}
                        className="rounded-xl bg-white p-5 shadow hover:shadow-lg dark:bg-gray-900 transition"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {referral.code}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              User: {referral.userId}
                            </p>
                          </div>
                          <div className="text-right text-xl font-bold text-gray-900 dark:text-gray-100">
                            $
                            {referral.commissions
                              .reduce((acc, c) => acc + c.amount, 0) /
                              100}
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="secondary"
                            className="flex-1 px-2 py-1 text-sm"
                            onClick={() => setSelectedReferral(referral)}
                          >
                            View
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

        {selectedReferral && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">
                {selectedReferral.code}
              </h2>
              <p>User ID: {selectedReferral.userId}</p>
              <p>Commission Rate: {selectedReferral.commissionRate * 100}%</p>
              <h3 className="text-xl font-bold mt-4">Commissions</h3>
              <table className="w-full mt-2">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReferral.commissions.map((commission: any) => (
                    <tr key={commission.id}>
                      <td>{commission.orderId}</td>
                      <td>${commission.amount / 100}</td>
                      <td>{commission.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="primary"
                  onClick={() =>
                    createPayout(
                      selectedReferral.id,
                      selectedReferral.commissions.reduce(
                        (acc: number, commission: any) =>
                          commission.status === "UNPAID" ? acc + commission.amount : acc,
                        0
                      )
                    )
                  }
                >
                  Create Payout
                </Button>
                <Button onClick={() => setSelectedReferral(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </motion.div>
  );
};

export default ReferralsPage;
