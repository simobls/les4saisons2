import React, { useState } from 'react';
import { ShoppingCart, User, Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import AuthModal from './AuthModal';
import CartSidebar from './CartSidebar';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../data/translations';

interface HeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
  onCheckout: () => void;
  onModifyItem: (item: import('../types').CartItem) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentSection, onCheckout, onModifyItem }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  const navigation = [
    { name: translations.header.menu[language], section: 'menu' },
    { name: translations.header.about[language], section: 'about' },
    { name: translations.header.contact[language], section: 'contact' },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: translations.header.admin[language], section: 'admin' });
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-2xl sticky top-0 z-40 border-b border-red-600 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => onNavigate('menu')}
            >
              <h1 className="text-2xl font-bold text-red-500">Les Quatre Saisons</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.section}
                  onClick={() => onNavigate(item.section)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentSection === item.section
                      ? 'text-red-500 border-b-2 border-red-500'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-400'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-semibold"
                aria-label="Switch language"
              >
                {language === 'en' ? 'EN 🇬🇧' : 'FR 🇫🇷'}
              </button>
              {/* Theme Switcher */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Cart button */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-red-400 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* User actions */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block transition-colors duration-300">
                    Welcome, {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:block">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 dark:text-gray-300 transition-colors duration-300"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-300 dark:border-gray-700 py-4 transition-colors duration-300">
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <button
                    key={item.section}
                    onClick={() => {
                      onNavigate(item.section);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 text-left text-sm font-medium transition-colors ${
                      currentSection === item.section
                        ? 'text-red-500'
                        : 'text-gray-700 dark:text-gray-300 hover:text-red-400'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showCart && <CartSidebar onClose={() => setShowCart(false)} onCheckout={onCheckout} onModifyItem={onModifyItem} />}
    </>
  );
};

export default Header;