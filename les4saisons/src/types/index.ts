export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  sauces?: string[];
  viandeId?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  customizations?: TacoCustomization | SmashBurgerCustomization;
}

export interface TacoCustomization {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  meats: string[];
  sauce: string;
  supplements: string[];
  isCombo: boolean;
  comboOptions?: {
    fries: string;
    drink: string;
  };
}

export interface SmashBurgerCustomization {
  sauce: string;
  isMenu: boolean;
  menuOptions?: {
    fries: string;
    drink: string;
  };
  ingredients: {
    lettuce: boolean;
    onions: boolean;
    tomatoes: boolean;
  };
}

export interface DeliveryAddress {
  street: string;
  city: string;
  zipCode: string;
  note?: string;
}

export interface DeliveryInfo {
  type: 'pickup' | 'delivery';
  address?: DeliveryAddress;
  fee: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  deliveryInfo?: DeliveryInfo;
}

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};