import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem } from '../types';
import { useAuth } from './AuthContext';
import { orderApi } from '../services/api';

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrdersByUser: (userId: string) => Order[];
  getAllOrders: () => Order[];
  newOrderCount: number;
  clearNewOrderCount: () => void;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load orders from backend
  const refreshOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let fetchedOrders: Order[] = [];
      
      if (user.role === 'admin') {
        fetchedOrders = await orderApi.getAllOrders();
      } else {
        fetchedOrders = await orderApi.getUserOrders();
      }
      
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load orders when user changes
  useEffect(() => {
    refreshOrders();
  }, [user]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a simple notification beep
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio notification not available');
    }
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    
    // If current user is admin, show notification and play sound
    if (user?.role === 'admin') {
      setNewOrderCount(prev => prev + 1);
      playNotificationSound();
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('New Order Received!', {
          body: `Order from ${order.customerName} - $${order.total.toFixed(2)}`,
          icon: '/vite.svg',
          tag: 'new-order'
        });
      }
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    // Update locally first for immediate feedback
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    
    // Update in backend
    orderApi.updateOrderStatus(orderId, status).catch(error => {
      console.error('Failed to update order status:', error);
      // Revert local change on error
      refreshOrders();
    });
  };

  const getOrdersByUser = (userId: string) => {
    return orders.filter(order => order.userId === userId);
  };

  const getAllOrders = () => {
    return orders;
  };

  const clearNewOrderCount = () => {
    setNewOrderCount(0);
  };

  // Request notification permission when component mounts
  useEffect(() => {
    if (user?.role === 'admin' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      addOrder,
      updateOrderStatus,
      getOrdersByUser,
      getAllOrders,
      newOrderCount,
      clearNewOrderCount,
      refreshOrders,
    }}>
      {children}
    </OrderContext.Provider>
  );
};