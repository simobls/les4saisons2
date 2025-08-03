import { supabase } from '../lib/supabase';
import { MenuItem, User, Order, CartItem } from '../types';

// Auth Services
export const authService = {
  async signUp(email: string, password: string, name: string, role: 'client' | 'admin' = 'client') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          name,
          role,
        });

      if (profileError) throw profileError;
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return { ...data, profile };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return { user, profile };
  },
};

// Menu Services
export const menuService = {
  async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      available: item.available,
    }));
  },

  async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        available: item.available,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      available: data.available,
    };
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .update({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        category: updates.category,
        image: updates.image,
        available: updates.available,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      available: data.available,
    };
  },

  async deleteMenuItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Order Services
export const orderService = {
  async createOrder(
    userId: string,
    customerName: string,
    customerEmail: string,
    items: CartItem[],
    total: number
  ): Promise<Order> {
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
        total,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      price: item.price,
      customizations: item.customizations || {},
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return {
      id: order.id,
      userId: order.user_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      total: order.total,
      status: order.status as 'pending' | 'preparing' | 'ready' | 'delivered',
      createdAt: new Date(order.created_at),
      items,
    };
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(order => ({
      id: order.id,
      userId: order.user_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      total: order.total,
      status: order.status as 'pending' | 'preparing' | 'ready' | 'delivered',
      createdAt: new Date(order.created_at),
      items: order.order_items.map((item: any) => ({
        id: item.menu_items.id,
        name: item.menu_items.name,
        description: item.menu_items.description,
        price: item.price,
        category: item.menu_items.category,
        image: item.menu_items.image,
        available: item.menu_items.available,
        quantity: item.quantity,
        customizations: item.customizations,
      })),
    }));
  },

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(order => ({
      id: order.id,
      userId: order.user_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      total: order.total,
      status: order.status as 'pending' | 'preparing' | 'ready' | 'delivered',
      createdAt: new Date(order.created_at),
      items: order.order_items.map((item: any) => ({
        id: item.menu_items.id,
        name: item.menu_items.name,
        description: item.menu_items.description,
        price: item.price,
        category: item.menu_items.category,
        image: item.menu_items.image,
        available: item.menu_items.available,
        quantity: item.quantity,
        customizations: item.customizations,
      })),
    }));
  },

  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'preparing' | 'ready' | 'delivered'
  ): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw error;
  },
};