import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { CartItem, TacoCustomization, SmashBurgerCustomization, DeliveryAddress } from '../types';
import { supplementApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../data/translations';
import { Truck, Store, MapPin } from 'lucide-react';

interface CartSidebarProps {
  onClose?: () => void;
  onCheckout?: () => void;
  onModifyItem?: (item: CartItem) => void;
}

function isTacoCustomization(custom: any): custom is TacoCustomization {
  return custom && typeof custom.size === 'string' && Array.isArray(custom.meats);
}

function isSmashBurgerCustomization(custom: any): custom is SmashBurgerCustomization {
  return custom && typeof custom.sauce === 'string' && typeof custom.isMenu === 'boolean';
}

const CartSidebar: React.FC<CartSidebarProps> = ({ onClose, onCheckout = () => {}, onModifyItem = () => {} }) => {
  const { items, removeFromCart, clearCart, deliveryInfo, setDeliveryType, setDeliveryAddress, getTotalPrice, getOrderTotal } = useCart();
  const { language } = useLanguage();
  const t = translations.cart;
  
  const [supplements, setSupplements] = useState<{ name: string; price: number }[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<DeliveryAddress>({
    street: '',
    city: 'Montpellier',
    zipCode: '',
    note: ''
  });
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    supplementApi.getAll().then(res => setSupplements(res.data || []));
  }, []);

  useEffect(() => {
    if (deliveryInfo.address) {
      setAddressForm(deliveryInfo.address);
    }
  }, [deliveryInfo.address]);

  const handleDeliveryTypeChange = (type: 'pickup' | 'delivery') => {
    setDeliveryType(type);
    if (type === 'delivery') {
      setShowAddressForm(true);
    } else {
      setShowAddressForm(false);
      setAddressError('');
    }
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    const newAddress = { ...addressForm, [field]: value };
    setAddressForm(newAddress);
    setDeliveryAddress(newAddress);
    
    // Clear error if user starts typing
    if (addressError && (field === 'street' || field === 'zipCode')) {
      setAddressError('');
    }
  };

  const validateAddress = () => {
    if (deliveryInfo.type === 'delivery') {
      if (!addressForm.street.trim() || !addressForm.zipCode.trim()) {
        setAddressError(t.addressRequired[language]);
        return false;
      }
    }
    return true;
  };

  const handleCheckout = () => {
    if (validateAddress()) {
      onCheckout();
    }
  };

  // Helper to calculate item price with supplements
  const calculateItemPrice = (item: CartItem) => {
    let basePrice = item.price;
    if (item.customizations && 'supplements' in item.customizations && Array.isArray(item.customizations.supplements)) {
      item.customizations.supplements.forEach((suppName: string) => {
        const supp = supplements.find(s => s.name === suppName);
        if (supp) basePrice += supp.price;
      });
    }
    return basePrice * item.quantity;
  };

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 p-6 overflow-y-auto transition-colors duration-300 border-l-4 border-red-600">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title[language]}</h2>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-2xl text-red-500 hover:text-red-700 transition-colors"
          >
            &times;
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t.empty[language]}</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {items.map((item: CartItem) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">€{calculateItemPrice(item).toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-red-500 hover:text-red-700 mt-1"
                    >
                      {t.remove[language]}
                    </button>
                  </div>
                </div>

                {/* Customization details */}
                {item.customizations && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded p-2">
                    {isTacoCustomization(item.customizations) && (
                      <div className="space-y-1">
                        <div><strong>Size:</strong> {item.customizations.size}</div>
                        {item.customizations.meats.length > 0 && (
                          <div><strong>Meats:</strong> {item.customizations.meats.join(', ')}</div>
                        )}
                        <div><strong>Sauce:</strong> {item.customizations.sauce}</div>
                        {item.customizations.supplements.length > 0 && (
                          <div><strong>Supplements:</strong> {item.customizations.supplements.join(', ')}</div>
                        )}
                        {item.customizations.isCombo && (
                          <div>
                            <strong>Combo:</strong> Yes<br />
                            <strong>Fries:</strong> {item.customizations.comboOptions?.fries}<br />
                            <strong>Drink:</strong> {item.customizations.comboOptions?.drink}
                          </div>
                        )}
                      </div>
                    )}
                    {isSmashBurgerCustomization(item.customizations) && (
                      <div className="space-y-1">
                        <div><strong>Sauce:</strong> {item.customizations.sauce}</div>
                        {item.customizations.isMenu && (
                          <div>
                            <strong>Menu:</strong> Yes<br />
                            <strong>Fries:</strong> {item.customizations.menuOptions?.fries}<br />
                            <strong>Drink:</strong> {item.customizations.menuOptions?.drink}
                          </div>
                        )}
                        <div>
                          <strong>Ingredients:</strong> {Object.entries(item.customizations.ingredients)
                            .filter(([_, v]) => v)
                            .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ') || 'None'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Order Type Selection */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t.orderType[language]}</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Pickup Button */}
              <button
                onClick={() => handleDeliveryTypeChange('pickup')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                  deliveryInfo.type === 'pickup'
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-400'
                }`}
              >
                <Store className="h-5 w-5" />
                <span className="font-medium">{t.pickup[language]}</span>
              </button>

              {/* Delivery Button */}
              <button
                onClick={() => handleDeliveryTypeChange('delivery')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                  deliveryInfo.type === 'delivery'
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                }`}
              >
                <Truck className="h-5 w-5" />
                <span className="font-medium">{t.delivery[language]}</span>
              </button>
            </div>

            {/* Delivery Address Form */}
            {showAddressForm && deliveryInfo.type === 'delivery' && (
              <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium text-gray-900 dark:text-white">{t.deliveryAddress[language]}</h4>
                </div>
                
                <input
                  type="text"
                  placeholder={t.streetAddress[language]}
                  value={addressForm.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder={t.city[language]}
                    value={addressForm.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder={t.zipCode[language]}
                    value={addressForm.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                {addressError && (
                  <p className="text-red-500 text-sm">{addressError}</p>
                )}
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 mb-6">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Subtotal:</span>
              <span>€{getTotalPrice().toFixed(2)}</span>
            </div>
            {deliveryInfo.type === 'delivery' && (
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>{t.deliveryFee[language]}:</span>
                <span>€{deliveryInfo.fee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
              <span>{t.total[language]}:</span>
              <span>€{getOrderTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCheckout}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              {t.checkout[language]}
            </button>
            <button
              onClick={clearCart}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {t.clear[language]}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartSidebar;