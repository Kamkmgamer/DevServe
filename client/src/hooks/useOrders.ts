import { useEffect, useState } from "react";
import api from "../api/axios";

export function useOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders").then((res) => setOrders(res.data));
  }, []);

  return orders;
}
