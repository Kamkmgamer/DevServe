// client/src/hooks/useCoupons.ts
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { Coupon } from "../types";

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/coupons");
      // New paginated shape { data, total, page, pageSize }
      setCoupons(res.data.data ?? res.data);
    } catch (err: unknown) {
      const msg = (err as any).response?.data?.message ?? "Failed to fetch coupons";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await api.delete(`/coupons/${id}`);
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (err: unknown) {
      toast.error((err as any).response?.data?.message ?? "Failed to delete coupon");
    }
  };

  useEffect(() => {
    void fetchCoupons();
  }, []);

  return { coupons, loading, error, fetchCoupons, deleteCoupon };
};