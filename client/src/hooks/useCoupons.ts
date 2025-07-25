// src/hooks/useCoupons.ts
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
      setCoupons(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch coupons.");
      toast.error("Failed to fetch coupons.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await api.delete(`/coupons/${id}`);
      toast.success("Coupon deleted successfully!");
      fetchCoupons(); // Refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete coupon.");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return { coupons, loading, error, fetchCoupons, deleteCoupon };
};