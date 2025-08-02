// client/src/contexts/CartContext.tsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

// Define types
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

type Cart = {
  id: string;
  items: CartItem[];
};

// Update the discount parameter type
export interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  total: number;
  addToCart: (serviceId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  createOrder: (
    requirements: Record<string, any>,
    discount?: number
  ) => Promise<{ id: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Cart>("/cart");
      setCart(res.data);
    } catch (err: any) {
      console.error("Failed to fetch cart", err);
      setError(err.response?.data?.error || "Failed to load cart.");
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (serviceId: string, quantity: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    try {
      await api.post("/cart/items", { serviceId, quantity });
      await fetchCart();
    } catch (err: any) {
      console.error("Failed to add to cart", err);
      setError(err.response?.data?.error || "Could not add item to cart.");
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
    } catch (err: any) {
      console.error("Failed to remove from cart", err);
      setError(err.response?.data?.error || "Could not remove item from cart.");
    }
  };

  const createOrder = async (
    requirements: Record<string, any>,
    discount: number = 0
  ) => {
    if (!isAuthenticated || !cart || cart.items.length === 0) {
      toast.error("Cart is empty or user not authenticated.");
      throw new Error("Cart is empty or user not authenticated.");
    }

    try {
      const payload = {
        items: cart.items.map((item) => ({
          serviceId: item.service.id,
          quantity: item.quantity,
        })),
        requirements,
        discount,
      };

      console.log('Creating order with payload:', payload);

      const res = await api.post("/orders", payload);
      toast.success("Order created successfully");
      return res.data;
    } catch (err: any) {
      console.error("Failed to create order", err);
      toast.error(err.response?.data?.message || "Failed to create order.");
      throw err;
    }
  };

  const itemCount = cart?.items?.length || 0;

  const total =
    cart?.items?.reduce(
      (sum, item) => sum + item.service.price * item.quantity,
      0
    ) || 0;

  const value: CartContextType = {
    cart,
    loading,
    error,
    itemCount,
    total,
    addToCart,
    removeFromCart,
    createOrder,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};