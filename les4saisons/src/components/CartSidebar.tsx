import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { CartItem, TacoCustomization, SmashBurgerCustomization } from '../types';
import { supplementApi } from '../services/api';

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
  const { items, removeFromCart, clearCart, getTotalPrice } = useCart();
  const [supplements, setSupplements] = useState<{ name: string; price: number }[]>([]);
  const [delivery, setDelivery] = useState(false);

  const handleDelivery = () => {
    setDelivery(true);
  };
  const handlePickup = () => {
    setDelivery(false);
  };

  useEffect(() => {
    supplementApi.getAll().then(res => setSupplements(res.data || []));
  }, []);

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
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      height: '100vh',
      width: 380,
      background: '#fff',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
      zIndex: 1000,
      padding: 24,
      overflowY: 'auto',
      transition: 'transform 0.3s',
      borderLeft: '2px solid #e11d48',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Shopping Cart</h2>
        {onClose && (
          <button onClick={onClose} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', color: '#e11d48' }}>&times;</button>
        )}
      </div>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item: CartItem) => (
              <li key={item.id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{item.name}</strong> x {item.quantity}
                  </div>
                  <div>
                    ${calculateItemPrice(item).toFixed(2)}
                    <button
                      style={{ marginLeft: 12, color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                      onClick={() => removeFromCart(item.id)}
                      title={`Remove ${item.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {/* Customization details */}
                {item.customizations && (
                  <div style={{ marginTop: 8, marginLeft: 8, fontSize: 14, color: '#444' }}>
                    {isTacoCustomization(item.customizations) && (
                      <>
                        <div>Size: <b>{item.customizations.size}</b></div>
                        {item.customizations.meats.length > 0 && (
                          <div>Meats: {item.customizations.meats.join(', ')}</div>
                        )}
                        <div>Sauce: <b>{item.customizations.sauce}</b></div>
                        {item.customizations.supplements.length > 0 && (
                          <div>Supplements: {item.customizations.supplements.join(', ')}</div>
                        )}
                        {item.customizations.isCombo && (
                          <div>
                            Combo: Yes<br />
                            Fries: {item.customizations.comboOptions?.fries}<br />
                            Drink: {item.customizations.comboOptions?.drink}
                          </div>
                        )}
                      </>
                    )}
                    {isSmashBurgerCustomization(item.customizations) && (
                      <>
                        <div>Sauce: <b>{item.customizations.sauce}</b></div>
                        {item.customizations.isMenu && (
                          <div>
                            Menu: Yes<br />
                            Fries: {item.customizations.menuOptions?.fries}<br />
                            Drink: {item.customizations.menuOptions?.drink}
                          </div>
                        )}
                        <div>
                          Ingredients: {Object.entries(item.customizations.ingredients)
                            .filter(([_, v]) => v)
                            .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ') || 'None'}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 16, fontWeight: 'bold', fontSize: 18 }}>
            Total: {items.reduce((total, item) => total + calculateItemPrice(item), 0).toFixed(2)}
          </div>
          <button
            style={{ marginTop: 16, background: '#e11d48', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
            onClick={clearCart}
          >
            Clear Cart
          </button>
          <div style={{ marginTop: 16, fontWeight: 'bold', fontSize: 18 }}>
            Type de commande
          </div>
          <button
            style={{ marginTop: 8, background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600, width: '100%' }}
            onClick={handlePickup}
          >
            Retrait
          </button>
          <button
            style={{ marginTop: 8, background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600, width: '100%' }}
            onClick={handleDelivery}
          >
            Livraison
          </button>
        </>
      )}
    </div>
  );
};

export default CartSidebar;