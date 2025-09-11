// client/src/contexts/CartContext.tsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

export type CartItem = {
  id: string;
  quantity: number;
  service: {
    id: string;
    thumbnailUrl: string;
    name: string;
    price: number;
  };
};

export type Cart = {
  id: string;
  items: CartItem[];
};

export interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  total: number;
  addToCart: (serviceId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  createOrder: (
    requirements: Record<string, unknown>,
    discount?: number
  ) => Promise<{ id: string }>;
  refresh: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

type Props = { children: ReactNode };

export const CartProvider = ({ children }: Props) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown, fallback: string) => {
    const message =
      (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (err as Error)?.message ||
      fallback;
    setError(message);
    return message;
  }, []);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Cart>("/cart");
      setCart(res.data);
    } catch (err) {
      const msg = handleError(err, "Failed to load cart.");
      console.error("Failed to fetch cart:", err);
      toast.error(msg);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, handleError]);

  useEffect(() => {
    // refetch when auth state changes
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (serviceId: string, quantity = 1) => {
      if (!isAuthenticated) {
        toast.error("Please log in to add items to your cart.");
        return;
      }
      if (!serviceId || quantity <= 0) {
        toast.error("Invalid item or quantity.");
        return;
      }

      // optimistic update
      const prev = cart;
      const next = (() => {
        if (!prev) {
          // create a temporary cart structure
          return {
            id: "temp",
            items: [],
          } as Cart;
        }
        return { ...prev, items: [...prev.items] };
      })();

      // try to find existing item to bump quantity visually
      const existingIdx = next.items.findIndex(
        (i) => i.service.id === serviceId
      );
      if (existingIdx >= 0) {
        const ex = next.items[existingIdx];
        next.items[existingIdx] = {
          ...ex,
          quantity: ex.quantity + quantity,
        };
      } else {
        // optimistic skeleton item (price/name will be corrected on fetch)
        next.items.push({
          id: `temp-${serviceId}-${Date.now()}`,
          quantity,
          service: {
            id: serviceId,
            thumbnailUrl: "",
            name: "Loading…",
            price: 0,
          },
        });
      }
      setCart(next);

      try {
        await api.post("/cart/items", { serviceId, quantity });
        await fetchCart(); // reconcile with server
        toast.success("Added to cart");
      } catch (err) {
        const msg = handleError(err, "Could not add item to cart.");
        console.error("Failed to add to cart:", err);
        toast.error(msg);
        // rollback
        setCart(prev ?? null);
      }
    },
    [cart, fetchCart, isAuthenticated, handleError]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      if (!itemId) return;

      const prev = cart;
      // optimistic remove
      const next =
        prev && {
          ...prev,
          items: prev.items.filter((i) => i.id !== itemId),
        };
      setCart(next ?? null);

      try {
        await api.delete(`/cart/items/${itemId}`);
        await fetchCart();
        toast.success("Removed from cart");
      } catch (err) {
        const msg = handleError(err, "Could not remove item from cart.");
        console.error("Failed to remove from cart:", err);
        toast.error(msg);
        // rollback
        setCart(prev ?? null);
      }
    },
    [cart, fetchCart, handleError]
  );

  const createOrder = useCallback(
    async (
      requirements: Record<string, unknown>,
      discount: number = 0
    ): Promise<{ id: string }> => {
      if (!isAuthenticated || !cart || cart.items.length === 0) {
        const msg = "Cart is empty or user not authenticated.";
        toast.error(msg);
        throw new Error(msg);
      }

      const payload = {
        items: cart.items.map((item) => ({
          serviceId: item.service.id,
          quantity: item.quantity,
        })) as ReadonlyArray<{ serviceId: string; quantity: number }>,
        requirements,
        discount,
      };

      try {
        const res = await api.post<{ id: string }>("/orders", payload);
        toast.success("Order created successfully");
        // Optionally clear or refresh cart
        await fetchCart();
        return res.data;
      } catch (err) {
        const msg = handleError(err, "Failed to create order.");
        console.error("Failed to create order:", err);
        toast.error(msg);
        throw err;
      }
    },
    [cart, isAuthenticated, fetchCart, handleError]
  );

  const itemCount = useMemo(() => cart?.items?.length || 0, [cart]);

  const total = useMemo(
    () =>
      cart?.items?.reduce(
        (sum, item) => sum + item.service.price * item.quantity,
        0
      ) || 0,
    [cart]
  );

  const value: CartContextType = useMemo(
    () => ({
      cart,
      loading,
      error,
      itemCount,
      total,
      addToCart,
      removeFromCart,
      createOrder,
      refresh: fetchCart,
    }),
    [
      cart,
      loading,
      error,
      itemCount,
      total,
      addToCart,
      removeFromCart,
      createOrder,
      fetchCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};