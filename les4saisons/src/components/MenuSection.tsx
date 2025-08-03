import React, { useEffect, useState } from 'react';
import { Plus, Star, Clock, MapPin, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import TacoCustomizationModal from './TacoCustomizationModal';
import SmashBurgerCustomizationModal from './SmashBurgerCustomizationModal';
import { categoryApi, menuApi, sauceApi, supplementApi, viandeApi } from '../services/api';
import { MenuItem, TacoCustomization, SmashBurgerCustomization, CartItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../data/translations';

interface MenuSectionProps {
  onModifyItem: (item: CartItem) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({ onModifyItem }) => {
  const { addToCart, updateItem, items } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showTacoModal, setShowTacoModal] = useState(false);
  const [selectedTaco, setSelectedTaco] = useState<MenuItem | null>(null);
  const [modifyingItemId, setModifyingItemId] = useState<string | null>(null);
  const [showSmashBurgerModal, setShowSmashBurgerModal] = useState(false);
  const [selectedSmashBurger, setSelectedSmashBurger] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sauces, setSauces] = useState<string[]>([]);
  const [supplements, setSupplements] = useState<any[]>([]);
  const [suppLoading, setSuppLoading] = useState(false);
  const [suppError, setSuppError] = useState<string | null>(null);
  const [viandes, setViandes] = useState<any[]>([]);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [catRes, menuRes, sauceRes, suppRes, viandeRes] = await Promise.all([
          categoryApi.getAll(),
          menuApi.getMenuItems(),
          sauceApi.getAll(),
          supplementApi.getAll(),
          viandeApi.getAll(),
        ]);
        setCategories(catRes.data);
        setMenuItems((menuRes.data || []).map((item: any) => ({ ...item, id: item._id })));
        setSauces((sauceRes.data || []).map((s: any) => s.name));
        setSupplements(suppRes.data || []);
        setViandes(viandeRes);
      } catch (e) {
        setError('Failed to load menu, categories, sauces, or supplements');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryNames = ['All', ...categories.map((cat: any) => cat.name)];
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const handleDirectCall = () => {
    window.open('tel:+15551234567', '_self');
  };

  const handleTacoClick = (item: MenuItem) => {
    setSelectedTaco(item);
    setShowTacoModal(true);
  };

  const handleSmashBurgerClick = (item: MenuItem) => {
    setSelectedSmashBurger(item);
    setShowSmashBurgerModal(true);
  };

  const handleAddTacoToCart = (item: MenuItem, customization: TacoCustomization) => {
    // Calculate final price based on customization
    let finalPrice = item.price;
    
    // Add size price
    const sizes = [
      { id: 'S', price: 0 },
      { id: 'M', price: 1.50 },
      { id: 'L', price: 3.00 },
      { id: 'XL', price: 4.50 },
      { id: 'XXL', price: 6.00 },
    ];
    const sizePrice = sizes.find(s => s.id === customization.size)?.price || 0;
    finalPrice += sizePrice;
    
    // Add supplement costs
    customization.supplements.forEach(supplement => {
      const match = supplement.match(/\(\+\$(\d+\.?\d*)\)/);
      if (match) {
        finalPrice += parseFloat(match[1]);
      }
    });
    
    // Add combo price
    if (customization.isCombo) {
      finalPrice += 4.99;
    }
    
    // Create customized item
    const customizedItem = {
      ...item,
      price: finalPrice,
      name: `${item.name} (${customization.size})`,
    };
    
    if (modifyingItemId) {
      const existingItem = items.find(item => item.id === modifyingItemId);
      updateItem(modifyingItemId, { ...customizedItem, id: modifyingItemId, quantity: existingItem?.quantity || 1 });
    } else {
      addToCart(customizedItem, customization);
    }
  };

  const handleModifyItem = (item: CartItem) => {
    setModifyingItemId(item.id);
    if (item.category === 'Tacos') {
      setSelectedTaco(item);
      setShowTacoModal(true);
    } else if (item.category === 'Smashes' || item.category === 'Burgers') {
      setSelectedSmashBurger(item);
      setShowSmashBurgerModal(true);
    }
  };

  const handleAddSmashBurgerToCart = (item: MenuItem, customization: SmashBurgerCustomization) => {
    // Calculate final price based on customization
    let finalPrice = item.price;
    
    // Add menu price
    if (customization.isMenu) {
      finalPrice += 5.99;
    }
    
    // Create description based on customization
    let customDescription = item.description;
    if (!customization.ingredients.lettuce || !customization.ingredients.onions || !customization.ingredients.tomatoes) {
      const removedItems = [];
      if (!customization.ingredients.lettuce) removedItems.push('lettuce');
      if (!customization.ingredients.onions) removedItems.push('onions');
      if (!customization.ingredients.tomatoes) removedItems.push('tomatoes');
      customDescription += ` (No ${removedItems.join(', ')})`;
    }
    
    // Create customized item
    const customizedItem = {
      ...item,
      price: finalPrice,
      name: `${item.name} ${customization.isMenu ? '(Menu)' : '(Solo)'}`,
      description: customDescription,
    };
    
    if (modifyingItemId) {
      const existingItem = items.find(item => item.id === modifyingItemId);
      updateItem(modifyingItemId, { ...customizedItem, id: modifyingItemId, quantity: existingItem?.quantity || 1 });
    } else {
      addToCart(customizedItem, customization);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Hero Section with Large Restaurant Image */}
      <div className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Les Quatre Saisons Restaurant Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {translations.hero.welcome[language]} <span className="text-red-500">Les Quatre Saisons</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
              {translations.hero.tagline[language]}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
              >
                {translations.hero.explore[language]}
              </button>
              <button 
                onClick={handleDirectCall}
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all transform hover:scale-105"
              >
                {translations.hero.callnow[language]}: 0956046007
              </button>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Menu Section */}
        <div id="menu-section" className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{translations.menu.ourMenu[language]}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            {translations.menu.discover[language]}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categoryNames.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Map and Call Section */}
        <div className="grid md:grid-cols-2 gap-6 mt-12 mb-8">
          {/* Map Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="h-48 bg-gradient-to-br from-red-900 to-red-800 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-red-300 mx-auto mb-2" />
                  <p className="text-red-200 font-medium">Interactive Map</p>
                </div>
              </div>
              {/* Simulated map with location markers */}
              <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 right-8 w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{translations.menu.findUs[language]}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
                145 Av. du Vert-Bois, 34090 Montpellier<br />
                France
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => window.open('https://maps.google.com/?q=145+Av.+du+Vert-Bois+34090+Montpellier', '_blank')}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{translations.menu.getDirections[language]}</span>
                </button>
                <button 
                  onClick={() => window.open('https://maps.google.com/?q=145+Av.+du+Vert-Bois+34090+Montpellier', '_blank')}
                  className="px-4 py-2 border border-red-600 text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                >
                  {translations.menu.viewMap[language]}
                </button>
              </div>
            </div>
          </div>

          {/* Direct Call Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-700 relative flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gray-900 rounded-full p-4 mb-4 shadow-lg border border-red-600">
                  <Phone className="h-12 w-12 text-red-500" />
                </div>
                <p className="text-red-300 font-medium">{translations.menu.call[language]} Now</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{translations.menu.orderByPhone[language]}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
                {translations.menu.callForOrder[language]}
              </p>
              <div className="space-y-3">
                <button 
                  onClick={handleDirectCall}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                >
                  <Phone className="h-5 w-5" />
                  <span>{translations.menu.call[language]} 0956046007</span>
                </button>
                <div className="text-center text-sm text-gray-500">
                  <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">{translations.menu.openHours1[language]}</p>
                  <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">{translations.menu.openHours2[language]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors duration-300">{translations.menu.loading[language]}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors duration-300">{translations.menu.noItems[language]}</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden hover:shadow-red-500/20 hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700 hover:border-red-600">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 flex items-center space-x-1 bg-white px-2 py-1 rounded-full text-sm">
                  <Star className="h-4 w-4 text-red-400 fill-current" />
                  <span className="font-medium text-gray-900">4.8</span>
                </div>
                {!item.available && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">{translations.menu.unavailable[language]}</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">{item.name}</h3>
                  <span className="text-lg font-bold text-red-500">${item.price.toFixed(2)}</span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed transition-colors duration-300">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-gray-400 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>15-20 min</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (item.category === 'Tacos') {
                        handleTacoClick(item);
                      } else if (item.category === 'Smashes' || item.category === 'Burgers') {
                        handleSmashBurgerClick(item);
                      } else {
                        addToCart(item);
                      }
                    }}
                    disabled={!item.available}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>
                      {item.category === 'Tacos' || item.category === 'Smashes' || item.category === 'Burgers' 
                          ? translations.menu.customize[language]
                          : translations.menu.addToCart[language]
                      }
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
        </div>
      </div>
    
    {/* Taco Customization Modal */}
    {showTacoModal && selectedTaco && (
      <TacoCustomizationModal
        item={selectedTaco}
        onClose={() => {
          setShowTacoModal(false);
          setModifyingItemId(null);
        }}
        onAddToCart={handleAddTacoToCart}
        modifyingItem={modifyingItemId ? items.find(i => i.id === modifyingItemId) : undefined}
        sauces={sauces}
        supplements={supplements}
        viandes={viandes}
      />
    )}
    
    {/* Smash/Burger Customization Modal */}
    {showSmashBurgerModal && selectedSmashBurger && (
      <SmashBurgerCustomizationModal
        item={selectedSmashBurger}
        onClose={() => {
          setShowSmashBurgerModal(false);
          setModifyingItemId(null);
        }}
        onAddToCart={handleAddSmashBurgerToCart}
        modifyingItem={modifyingItemId ? items.find(item => item.id === modifyingItemId) : undefined}
        sauces={sauces}
      />
    )}
    </>
  );
};

export default MenuSection;