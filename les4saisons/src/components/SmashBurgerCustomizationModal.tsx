import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MenuItem, SmashBurgerCustomization } from '../types';
import { CartItem } from '../types';
import { useEffect } from 'react';
import { supplementApi } from '../services/api';

interface SmashBurgerCustomizationModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (item: MenuItem, customization: SmashBurgerCustomization) => void;
  modifyingItem?: CartItem;
  sauces?: string[];
}

const SmashBurgerCustomizationModal: React.FC<SmashBurgerCustomizationModalProps> = ({
  item,
  onClose,
  onAddToCart,
  modifyingItem,
  sauces = [],
}) => {
  const [customization, setCustomization] = useState<SmashBurgerCustomization>(
    modifyingItem?.customizations && 'isMenu' in modifyingItem.customizations
      ? (modifyingItem.customizations as SmashBurgerCustomization)
      : {
    sauce: '',
    isMenu: false,
    menuOptions: {
      fries: '',
      drink: '',
    },
    ingredients: {
      lettuce: true,
      onions: true,
      tomatoes: true,
    },
          supplements: [],
        }
  );
  const [supplements, setSupplements] = useState<{ name: string; price: number }[]>([]);
  const [suppWarning, setSuppWarning] = useState('');
  const maxSupplements = 4;
  useEffect(() => {
    supplementApi.getAll().then(res => setSupplements(res.data || []));
  }, []);

  const friesOptions = [
    'Regular Fries', 'Seasoned Fries', 'Sweet Potato Fries', 'Loaded Fries', 
    'Curly Fries', 'Onion Rings'
  ];

  const drinkOptions = [
    'Coca Cola', 'Pepsi', 'Sprite', 'Orange Soda', 'Water', 'Iced Tea', 
    'Lemonade', 'Coffee', 'Milkshake Vanilla', 'Milkshake Chocolate'
  ];

  const calculatePrice = () => {
    let basePrice = item.price;
    // Add supplement costs (from supplements prop)
    if (customization.supplements && Array.isArray(customization.supplements)) {
      customization.supplements.forEach(suppName => {
        const supp = supplements.find(s => s.name === suppName);
        if (supp) basePrice += supp.price;
      });
    }
    // Add menu price
    if (customization.isMenu) {
      basePrice += 5.99;
    }
    return basePrice;
  };

  const handleAddToCart = () => {
    if (!customization.sauce) {
      alert('Please select a sauce');
      return;
    }
    if (customization.isMenu && (!customization.menuOptions?.fries || !customization.menuOptions?.drink)) {
      alert('Please select fries and drink for your menu');
      return;
    }

    onAddToCart(item, customization);
    onClose();
  };

  const toggleIngredient = (ingredient: keyof typeof customization.ingredients) => {
    setCustomization(prev => ({
      ...prev,
      ingredients: {
        ...prev.ingredients,
        [ingredient]: !prev.ingredients[ingredient]
      }
    }));
  };

  const handleSupplementToggle = (supplement: string) => {
    setCustomization(prev => {
      let newSupps;
      if (prev.supplements && prev.supplements.includes(supplement)) {
        newSupps = prev.supplements.filter(s => s !== supplement);
        setSuppWarning('');
      } else if ((prev.supplements?.length || 0) < maxSupplements) {
        newSupps = [...(prev.supplements || []), supplement];
        setSuppWarning('');
      } else {
        setSuppWarning(`You can select up to ${maxSupplements} supplements.`);
        return prev;
      }
      return { ...prev, supplements: newSupps };
    });
  };

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

        <div className="p-6 space-y-6">
          {/* Sauce Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Sauce *</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {sauces.map((sauce) => (
                <button
                  key={sauce}
                  onClick={() => setCustomization(prev => ({ ...prev, sauce }))}
                  className={`p-3 rounded-lg border transition-all text-sm ${
                    customization.sauce === sauce
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {sauce}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredients Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customize Ingredients</h3>
            <div className="space-y-3">
              {Object.entries(customization.ingredients).map(([ingredient, included]) => (
                <div key={ingredient} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900 capitalize">{ingredient}</span>
                  <button
                    onClick={() => toggleIngredient(ingredient as keyof typeof customization.ingredients)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      included
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}
                  >
                    {included ? 'Included' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Option */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                id="menu"
                checked={customization.isMenu}
                onChange={(e) => setCustomization(prev => ({ 
                  ...prev, 
                  isMenu: e.target.checked,
                  menuOptions: e.target.checked ? prev.menuOptions : { fries: '', drink: '' }
                }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="menu" className="text-lg font-semibold text-gray-900">
                Make it a Menu (+$5.99)
              </label>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Includes fries and a drink of your choice
            </p>

            {customization.isMenu && (
              <div className="space-y-4 pl-6 border-l-2 border-orange-200">
                {/* Fries Selection */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Choose Fries</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {friesOptions.map((fries) => (
                      <button
                        key={fries}
                        onClick={() => setCustomization(prev => ({
                          ...prev,
                          menuOptions: { ...prev.menuOptions!, fries }
                        }))}
                        className={`p-2 rounded-lg border transition-all text-sm ${
                          customization.menuOptions?.fries === fries
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
                  <div className="grid grid-cols-2 gap-2">
                    {drinkOptions.map((drink) => (
                      <button
                        key={drink}
                        onClick={() => setCustomization(prev => ({
                          ...prev,
                          menuOptions: { ...prev.menuOptions!, drink }
                        }))}
                        className={`p-2 rounded-lg border transition-all text-sm ${
                          customization.menuOptions?.drink === drink
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

          {/* Supplements */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Supplements (Optional, max 4)</h3>
            {suppWarning && <div className="text-red-500 mb-2">{suppWarning}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {supplements.map((supplement) => (
                <button
                  key={supplement.name}
                  onClick={() => handleSupplementToggle(supplement.name)}
                  className={`p-3 rounded-lg border transition-all text-sm text-left ${
                    customization.supplements?.includes(supplement.name)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {supplement.name} <span className="text-gray-500">${supplement.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Solo Option Info */}
          {!customization.isMenu && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Solo Option</h4>
              <p className="text-sm text-blue-700">
                Your {item.category.toLowerCase()} will be served alone without sides or drink.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-orange-600">
              ${calculatePrice().toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={handleAddToCart}
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmashBurgerCustomizationModal;