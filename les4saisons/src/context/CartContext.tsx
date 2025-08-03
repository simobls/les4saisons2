import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, MenuItem, TacoCustomization, SmashBurgerCustomization, DeliveryInfo, DeliveryAddress } from '../types';

interface CartContextType {
  items: CartItem[];
  deliveryInfo: DeliveryInfo;
  addToCart: (item: MenuItem, customizations?: TacoCustomization | SmashBurgerCustomization) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItem: (itemId: string, newItem: CartItem) => void;
  modifyItem: (itemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  setDeliveryType: (type: 'pickup' | 'delivery') => void;
  setDeliveryAddress: (address: DeliveryAddress) => void;
  getOrderTotal: () => number;
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

const DELIVERY_FEE = 3.50; // €3.50 delivery fee

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    type: 'pickup',
    fee: 0
  });

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
    setDeliveryInfo({
      type: 'pickup',
      fee: 0
    });
  };

  const setDeliveryType = (type: 'pickup' | 'delivery') => {
    setDeliveryInfo(prev => ({
      ...prev,
      type,
      fee: type === 'delivery' ? DELIVERY_FEE : 0,
      address: type === 'pickup' ? undefined : prev.address
    }));
  };

  const setDeliveryAddress = (address: DeliveryAddress) => {
    setDeliveryInfo(prev => ({
      ...prev,
      address
    }));
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getOrderTotal = () => {
    return getTotalPrice() + deliveryInfo.fee;
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      deliveryInfo,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateItem,
      modifyItem,
      clearCart,
      getTotalPrice,
      getTotalItems,
      setDeliveryType,
      setDeliveryAddress,
      getOrderTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};