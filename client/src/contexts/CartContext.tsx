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
import toast from 'react-hot-toast';

// Define our types (as before)
type CartItem = { id: string; quantity: number; service: {
  id: any;
  thumbnailUrl: any; name: string; price: number 
} };
type Cart = { id: string; items: CartItem[] };

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  addToCart: (serviceId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
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
    } catch (err: any) { // 👈 Change: explicitly type 'err' as 'any'
      console.error("Failed to add to cart", err);
      setError(err.response?.data?.error || "Could not add item to cart.");
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
    } catch (err: any) { // 👈 Change: explicitly type 'err' as 'any'
      console.error("Failed to remove from cart", err);
      setError(err.response?.data?.error || "Could not remove item from cart.");
    }
  };

  const itemCount = cart?.items?.length || 0;

  const value = { cart, loading, error, itemCount, addToCart, removeFromCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};