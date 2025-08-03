import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderApi } from '../services/api';

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ total, onClose, onPaymentSuccess }) => {
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    billingAddress: {
      street: '',
      city: '',
      zipCode: '',
      country: 'US',
    },
  });
  
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!paymentData.expiryDate || paymentData.expiryDate.length < 5) {
      newErrors.expiryDate = 'Please enter a valid expiry date';
    }

    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter the cardholder name';
    }

    if (!paymentData.email.trim() || !paymentData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!paymentData.billingAddress.street.trim()) {
      newErrors.street = 'Please enter your street address';
    }

    if (!paymentData.billingAddress.city.trim()) {
      newErrors.city = 'Please enter your city';
    }

    if (!paymentData.billingAddress.zipCode.trim()) {
      newErrors.zipCode = 'Please enter your ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      value = formatExpiryDate(value);
    } else if (field === 'cvv') {
      value = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPaymentData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value,
        },
      }));
    } else {
      setPaymentData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create order in backend after successful payment
      if (user) {
        const orderData = {
          customerName: paymentData.cardholderName || user.name,
          customerEmail: paymentData.email || user.email,
          items: items,
          subtotal: total * 0.926, // Remove tax for calculation
          tax: total * 0.074, // 8% tax
          total: total,
          orderType: 'delivery',
          specialInstructions: '',
        };
        
        const createdOrder = await orderApi.createOrder(orderData);
        addOrder(createdOrder);
      }
      
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
      setErrors({ general: 'Payment failed. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const getCardType = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5') || num.startsWith('2')) return 'Mastercard';
    if (num.startsWith('3')) return 'American Express';
    return 'Card';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Secure Payment</h2>
              <p className="text-sm text-gray-400">Complete your order</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-900/50 border border-red-600 text-red-300 p-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="font-semibold text-white mb-2">Order Summary</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Amount:</span>
              <span className="text-2xl font-bold text-red-500">${typeof total === 'number' ? total.toFixed(2) : '0.00'}</span>
            </div>
          </div>

          {/* Card Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-red-500" />
              <span>Card Information</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                  {paymentData.cardNumber && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                        {getCardType(paymentData.cardNumber)}
                      </span>
                    </div>
                  )}
                </div>
                {errors.cardNumber && (
                  <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 ${
                      errors.expiryDate ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  {errors.expiryDate && (
                    <p className="text-red-400 text-xs mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 ${
                      errors.cvv ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors.cvv && (
                    <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={paymentData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 ${
                    errors.cardholderName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="John Doe"
                />
                {errors.cardholderName && (
                  <p className="text-red-400 text-xs mt-1">{errors.cardholderName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Billing Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={paymentData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={paymentData.billingAddress.street}
                onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 ${
                  errors.street ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="123 Main Street"
              />
              {errors.street && (
                <p className="text-red-400 text-xs mt-1">{errors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={paymentData.billingAddress.city}
                  onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 ${
                    errors.city ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={paymentData.billingAddress.zipCode}
                  onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 ${
                    errors.zipCode ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="10001"
                />
                {errors.zipCode && (
                  <p className="text-red-400 text-xs mt-1">{errors.zipCode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="flex items-center space-x-2 text-green-400 mb-2">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <p className="text-xs text-gray-400">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={processing}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                <span>Pay ${typeof total === 'number' ? total.toFixed(2) : '0.00'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;