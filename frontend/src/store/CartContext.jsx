import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: '0.00', item_count: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cart/');
      setCart(data);
    } catch {
      // silent fail for anonymous
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/add/', { product_id: productId, quantity });
    setCart(data);
    toast?.success('Added to cart');
  };

  const updateQuantity = async (itemId, quantity) => {
    const { data } = await api.patch(`/cart/items/${itemId}/update/`, { quantity });
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const { data } = await api.delete(`/cart/items/${itemId}/remove/`);
    setCart(data);
    toast?.info('Item removed from cart');
  };

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
