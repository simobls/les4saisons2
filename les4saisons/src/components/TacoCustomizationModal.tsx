import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { MenuItem, TacoCustomization } from '../types';
import { CartItem } from '../types';
import { viandeApi } from '../services/api';
import { useEffect } from 'react';

interface TacoCustomizationModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem, customization: TacoCustomization) => void;
  modifyingItem?: CartItem;
  sauces?: string[];
  supplements?: { name: string; price: number }[];
  viandes?: { _id: string; name: string }[];
}

const TacoCustomizationModal: React.FC<TacoCustomizationModalProps> = ({
  item,
  onClose,
  onAddToCart,
  modifyingItem,
  sauces = [],
  supplements = [],
  viandes = [],
}) => {
  const [customization, setCustomization] = useState<TacoCustomization>(
    modifyingItem?.customizations && 'size' in modifyingItem.customizations
      ? (modifyingItem.customizations as TacoCustomization)
      : {
    size: 'S',
    meats: [],
    sauce: '',
    supplements: [],
    isCombo: false,
    comboOptions: {
      fries: '',
      drink: '',
    },
        }
  );

  const sizes = [
    { id: 'S', name: 'Small', meats: 1, price: 0 },
    { id: 'M', name: 'Medium', meats: 1, price: 1.50 },
    { id: 'L', name: 'Large', meats: 2, price: 3.00 },
    { id: 'XL', name: 'Extra Large', meats: 3, price: 4.50 },
    { id: 'XXL', name: 'Double XL', meats: 4, price: 6.00 },
  ];

  // Use viandeId from item if present
  const viandeName = item.viandeId && viandes.find(v => v._id === item.viandeId)?.name;
  const meats = viandeName ? [viandeName] : viandes.length > 0 ? viandes.map(v => v.name) : [
    'Beef', 'Chicken', 'Pork', 'Fish', 'Shrimp', 'Chorizo', 'Carnitas', 'Al Pastor'
  ];

  // Remove the hardcoded sauces array
  // const sauces = [
  //   'Mild Salsa', 'Hot Salsa', 'Verde Salsa', 'Chipotle', 'Habanero', 
  //   'Sour Cream', 'Guacamole', 'Pico de Gallo'
  // ];

  // Remove the hardcoded supplements array
  // const supplements = [
  //   'Extra Cheese (+$1.00)', 'Avocado (+$1.50)', 'Jalapeños (+$0.50)', 
  //   'Onions (+$0.50)', 'Cilantro (+$0.50)', 'Lime (+$0.25)', 
  //   'Lettuce (+$0.50)', 'Tomatoes (+$0.75)'
  // ];

  const friesOptions = [
    'Regular Fries', 'Seasoned Fries', 'Sweet Potato Fries', 'Loaded Fries'
  ];

  const drinkOptions = [
    'Coca Cola', 'Pepsi', 'Sprite', 'Orange Soda', 'Water', 'Horchata', 
    'Jamaica', 'Tamarindo'
  ];

  const selectedSize = sizes.find(s => s.id === customization.size)!;
  const maxMeats = selectedSize.meats;
  const maxSupplements = 4;
  const [suppWarning, setSuppWarning] = useState('');
  const [sauceWarning, setSauceWarning] = useState('');

  const calculatePrice = () => {
    let basePrice = item.price + selectedSize.price;
    // Add supplement costs (from supplements prop)
    customization.supplements.forEach(suppName => {
      const supp = supplements.find(s => s.name === suppName);
      if (supp) basePrice += supp.price;
    });
    // Add combo price
    if (customization.isCombo) {
      basePrice += 4.99;
    }
    return basePrice;
  };

  // For meats, allow multiple of the same meat
  const handleMeatIncrement = (meat: string) => {
    setCustomization(prev => {
      if (prev.meats.length < maxMeats) {
        return { ...prev, meats: [...prev.meats, meat] };
      }
      return prev;
    });
  };
  const handleMeatDecrement = (meat: string) => {
    setCustomization(prev => {
      const idx = prev.meats.lastIndexOf(meat);
      if (idx !== -1) {
        const newMeats = [...prev.meats];
        newMeats.splice(idx, 1);
      return { ...prev, meats: newMeats };
      }
      return prev;
    });
  };

  const handleSupplementToggle = (supplement: string) => {
    setCustomization(prev => {
      let newSupps;
      if (prev.supplements.includes(supplement)) {
        newSupps = prev.supplements.filter(s => s !== supplement);
        setSuppWarning('');
      } else if (prev.supplements.length < maxSupplements) {
        newSupps = [...prev.supplements, supplement];
        setSuppWarning('');
      } else {
        setSuppWarning(`You can select up to ${maxSupplements} supplements.`);
        return prev;
      }
      return { ...prev, supplements: newSupps };
    });
  };

  // For sauces, allow up to 2 selections
  const handleSauceToggle = (sauce: string) => {
    setCustomization(prev => {
      let newSauces = prev.sauce ? prev.sauce.split(',') : [];
      if (newSauces.includes(sauce)) {
        newSauces = newSauces.filter(s => s !== sauce);
        setSauceWarning('');
      } else if (newSauces.length < 2) {
        newSauces = [...newSauces, sauce];
        setSauceWarning('');
      } else {
        setSauceWarning('You can select up to 2 sauces.');
        return prev;
      }
      return { ...prev, sauce: newSauces.join(',') };
    });
  };

  const handleAddToCart = () => {
    const saucesSelected = customization.sauce ? customization.sauce.split(',').filter(Boolean) : [];
    if (saucesSelected.length === 0) {
      alert('Please select at least one sauce');
      return;
    }
    if (customization.meats.length === 0) {
      alert('Please select at least one meat');
      return;
    }
    if (customization.isCombo && (!customization.comboOptions?.fries || !customization.comboOptions?.drink)) {
      alert('Please select fries and drink for your combo');
      return;
    }

    onAddToCart(item, customization);
    onClose();
  };

  // Add toast feedback (simple alert for now)
  const showToast = (msg: string) => alert(msg);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Customize Your {item.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-8">
          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">Choose Size <span className="ml-2 text-gray-400" title="Size affects max meats">?</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setCustomization(prev => ({ 
                    ...prev, 
                    size: size.id as any,
                    meats: prev.meats.slice(0, size.meats) // Limit meats when size changes
                  }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    customization.size === size.id
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{size.name}</div>
                  <div className="text-sm text-gray-600">{size.meats} meat{size.meats > 1 ? 's' : ''}</div>
                  <div className="text-sm font-medium text-orange-600">
                    {size.price > 0 ? `+$${size.price.toFixed(2)}` : 'Base'}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <hr className="my-4" />
          {/* Meat Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              Choose Meats ({customization.meats.length}/{maxMeats})
              <span className="ml-2 text-gray-400" title="You can select the same meat multiple times">?</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {meats.map((meat) => {
                const count = customization.meats.filter(m => m === meat).length;
                return (
                  <div key={meat} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                    <button
                      onClick={() => handleMeatDecrement(meat)}
                      disabled={count === 0}
                      className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                      title="Remove one"
                    >-</button>
                    <span className="min-w-[60px] text-center font-medium">{meat} {count > 0 && <span className="text-orange-600">x{count}</span>}</span>
                <button
                      onClick={() => handleMeatIncrement(meat)}
                      disabled={customization.meats.length >= maxMeats}
                      className="px-2 py-1 bg-orange-200 rounded disabled:opacity-50"
                      title="Add one"
                    >+</button>
                  </div>
                );
              })}
            </div>
          </div>
          <hr className="my-4" />
          {/* Sauce Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">Choose Sauces (max 2) *<span className="ml-2 text-gray-400" title="You can select up to 2 sauces">?</span></h3>
            {sauceWarning && <div className="text-red-500 mb-2">{sauceWarning}</div>}
            <div className="flex flex-wrap gap-2">
              {sauces.map((sauce) => {
                const selected = customization.sauce.split(',').includes(sauce);
                return (
                  <label key={sauce} className={`flex items-center px-3 py-2 rounded-full border cursor-pointer transition-all ${selected ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleSauceToggle(sauce)}
                      className="mr-2 accent-orange-500"
                    />
                  {sauce}
                  </label>
                );
              })}
            </div>
          </div>
          <hr className="my-4" />
          {/* Supplements */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">Add Supplements (Optional, max 4)<span className="ml-2 text-gray-400" title="Supplements add extra cost">?</span></h3>
            {suppWarning && <div className="text-red-500 mb-2">{suppWarning}</div>}
            <div className="flex flex-wrap gap-2">
              {supplements.map((supplement) => (
                <button
                  key={supplement.name}
                  onClick={() => handleSupplementToggle(supplement.name)}
                  className={`px-4 py-2 rounded-full border transition-all text-sm font-medium flex items-center gap-2 ${
                    customization.supplements.includes(supplement.name)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {supplement.name} <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">+${supplement.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
          <hr className="my-4" />
          {/* Combo Option */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                id="combo"
                checked={customization.isCombo}
                onChange={(e) => setCustomization(prev => ({ 
                  ...prev, 
                  isCombo: e.target.checked,
                  comboOptions: e.target.checked ? prev.comboOptions : { fries: '', drink: '' }
                }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="combo" className="text-lg font-semibold text-gray-900">
                Make it a Combo (+$4.99)
              </label>
            </div>
            {customization.isCombo && (
              <div className="space-y-4 pl-6 border-l-2 border-orange-200">
                {/* Fries Selection */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Choose Fries</h4>
                  <div className="flex flex-wrap gap-2">
                    {friesOptions.map((fries) => (
                      <button
                        key={fries}
                        onClick={() => setCustomization(prev => ({
                          ...prev,
                          comboOptions: { ...prev.comboOptions!, fries }
                        }))}
                        className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                          customization.comboOptions?.fries === fries
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {fries}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Drink Selection */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Choose Drink</h4>
                  <div className="flex flex-wrap gap-2">
                    {drinkOptions.map((drink) => (
                      <button
                        key={drink}
                        onClick={() => setCustomization(prev => ({
                          ...prev,
                          comboOptions: { ...prev.comboOptions!, drink }
                        }))}
                        className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                          customization.comboOptions?.drink === drink
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {drink}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <hr className="my-4" />
          {/* Summary Section */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-gray-900">Your Taco</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><b>Size:</b> {sizes.find(s => s.id === customization.size)?.name}</li>
              <li><b>Meats:</b> {customization.meats.join(', ') || 'None'}</li>
              <li><b>Sauces:</b> {customization.sauce || 'None'}</li>
              <li><b>Supplements:</b> {customization.supplements.join(', ') || 'None'}</li>
              {customization.isCombo && (
                <li><b>Combo:</b> Yes, Fries: {customization.comboOptions?.fries}, Drink: {customization.comboOptions?.drink}</li>
              )}
            </ul>
          </div>
        </div>
        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0 flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-orange-600">
              ${calculatePrice().toFixed(2)}
            </span>
          <button
            className="ml-4 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            onClick={() => {
              handleAddToCart();
              showToast('Added to cart!');
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default TacoCustomizationModal;