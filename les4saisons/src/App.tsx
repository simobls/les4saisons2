import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import MenuSection from './components/MenuSection';
import AdminPanel from './components/AdminPanel';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import { useAuth } from './context/AuthContext';
import PaymentModal from './components/PaymentModal';
import { CartItem } from './types';
import { useCart } from './context/CartContext';
import TacoCustomizationModal from './components/TacoCustomizationModal';
import SmashBurgerCustomizationModal from './components/SmashBurgerCustomizationModal';
import { LanguageProvider } from './context/LanguageContext';
import { useLanguage } from './context/LanguageContext';
import { translations } from './data/translations';

const AppContent: React.FC = () => {
  // Remove currentSection and handleNavigate
  const { user } = useAuth();
  const { getTotalPrice } = useCart();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modifyingItem, setModifyingItem] = useState<CartItem | null>(null);
  const [showTacoModal, setShowTacoModal] = useState(false);
  const [showSmashBurgerModal, setShowSmashBurgerModal] = useState(false);
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Called when "Modify" is clicked in the cart
  const handleModifyItem = (item: CartItem) => {
    setModifyingItem(item);
    if (item.category === 'Tacos') {
      setShowTacoModal(true);
    } else if (item.category === 'Smashes' || item.category === 'Burgers') {
      setShowSmashBurgerModal(true);
    }
  };

  // Called when modal is closed or modification is done
  const handleCloseModal = () => {
    setModifyingItem(null);
    setShowTacoModal(false);
    setShowSmashBurgerModal(false);
  };

  // Navigation handler for Header and Footer
  const handleNavigate = (section: string) => {
    if (section === 'admin' && user?.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      return;
    }
    navigate(section === 'menu' ? '/menu' : `/${section}`);
  };

  // Compute currentSection from location
  const location = window.location.pathname;
  let currentSection = 'menu';
  if (location.startsWith('/about')) currentSection = 'about';
  else if (location.startsWith('/contact')) currentSection = 'contact';
  else if (location.startsWith('/admin')) currentSection = 'admin';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header 
        onNavigate={handleNavigate} 
        currentSection={currentSection} 
        onCheckout={() => setShowPaymentModal(true)} 
        onModifyItem={handleModifyItem}
      />
      <main>
        <Routes>
          <Route path="/menu" element={<MenuSection onModifyItem={handleModifyItem} />} />
          <Route path="/about" element={<AboutSection />} />
          <Route path="/contact" element={<ContactSection />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/menu" replace />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </main>
      {showPaymentModal && <PaymentModal total={getTotalPrice()} onClose={() => setShowPaymentModal(false)} onPaymentSuccess={() => {}} />}
      {showTacoModal && modifyingItem && (
        <TacoCustomizationModal
          item={modifyingItem}
          onClose={handleCloseModal}
          onAddToCart={() => handleCloseModal()}
          modifyingItem={modifyingItem}
        />
      )}
      {showSmashBurgerModal && modifyingItem && (
        <SmashBurgerCustomizationModal
          item={modifyingItem}
          onClose={handleCloseModal}
          onAddToCart={() => handleCloseModal()}
          modifyingItem={modifyingItem}
        />
      )}
      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-black text-gray-900 dark:text-white py-12 border-t border-red-600 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-4">Les Quatre Saisons</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">
                {translations.footer.desc[language]}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{translations.footer.quickLinks[language]}</h4>
              <div className="space-y-2 text-sm">
                <button 
                  onClick={() => handleNavigate('menu')}
                  className="block text-gray-600 dark:text-gray-300 hover:text-red-400 transition-colors"
                >
                  {translations.header.menu[language]}
                </button>
                <button 
                  onClick={() => handleNavigate('about')}
                  className="block text-gray-600 dark:text-gray-300 hover:text-red-400 transition-colors"
                >
                  {translations.footer.aboutUs[language]}
                </button>
                <button 
                  onClick={() => handleNavigate('contact')}
                  className="block text-gray-600 dark:text-gray-300 hover:text-red-400 transition-colors"
                >
                  {translations.footer.contact[language]}
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{translations.footer.contactInfo[language]}</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                <p>{translations.footer.address1[language]}</p>
                <p>{translations.footer.address2[language]}</p>
                <p>{translations.footer.phone[language]}</p>
                <p>{translations.footer.email[language]}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{translations.footer.hours[language]}</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                <p>{translations.footer.open1[language]}</p>
                <p>{translations.footer.open2[language]}</p>
                <p>{translations.footer.open3[language]}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-300 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            <p>&copy; 2024 Les Quatre Saisons. {translations.footer.copyright[language]}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <OrderProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </OrderProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;