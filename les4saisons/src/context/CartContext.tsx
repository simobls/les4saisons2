import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, MenuItem, TacoCustomization, SmashBurgerCustomization } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem, customizations?: TacoCustomization | SmashBurgerCustomization) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItem: (itemId: string, newItem: CartItem) => void;
  modifyItem: (itemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem, customizations?: TacoCustomization | SmashBurgerCustomization) => {
    setItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id && JSON.stringify(cartItem.customizations) === JSON.stringify(customizations));
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id && JSON.stringify(cartItem.customizations) === JSON.stringify(customizations)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1, customizations }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const updateItem = (itemId: string, newItem: CartItem) => {
    setItems(prev => prev.map(item => item.id === itemId ? newItem : item));
  };

  const modifyItem = (itemId: string) => {
    console.log("Modifying item:", itemId);
    // Here you would typically open a modal to edit the item's customizations
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateItem,
      modifyItem,
      clearCart,
      getTotalPrice,
      getTotalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
};