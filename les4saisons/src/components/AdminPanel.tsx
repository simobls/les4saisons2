import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, TrendingUp, Users, DollarSign, BellRing, Utensils, Drumstick, Droplet, CupSoda, Tag, List } from 'lucide-react';
import { menuApi, categoryApi, sauceApi, drinkApi, pricePresetApi, supplementApi, viandeApi } from '../services/api';
import { MenuItem } from '../types';
import { useOrders } from '../context/OrderContext';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { getAllOrders, newOrderCount, clearNewOrderCount, updateOrderStatus } = useOrders();
  const allOrders = getAllOrders();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Category state
  const [categories, setCategories] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({ name: '', id: null as string | null });
  // Sauce state
  const [sauces, setSauces] = useState<any[]>([]);
  const [sauceLoading, setSauceLoading] = useState(false);
  const [sauceError, setSauceError] = useState<string | null>(null);
  const [sauceForm, setSauceForm] = useState({ name: '', id: null as string | null });
  // Drink state
  const [drinks, setDrinks] = useState<any[]>([]);
  const [drinkLoading, setDrinkLoading] = useState(false);
  const [drinkError, setDrinkError] = useState<string | null>(null);
  const [drinkForm, setDrinkForm] = useState({ name: '', id: null as string | null });
  // Price Preset state
  const [presets, setPresets] = useState<any[]>([]);
  const [presetLoading, setPresetLoading] = useState(false);
  const [presetError, setPresetError] = useState<string | null>(null);
  const [presetForm, setPresetForm] = useState({ name: '', value: '', id: null as string | null });
  // Supplements state
  const [supplements, setSupplements] = useState<any[]>([]);
  const [suppLoading, setSuppLoading] = useState(false);
  const [suppError, setSuppError] = useState<string | null>(null);
  const [suppForm, setSuppForm] = useState({ name: '', price: '' });
  const [editingSupp, setEditingSupp] = useState<any | null>(null);

  // Viandes (Meats) state
  const [viandes, setViandes] = useState<any[]>([]);
  const [viandeLoading, setViandeLoading] = useState(false);
  const [viandeError, setViandeError] = useState<string | null>(null);
  const [viandeForm, setViandeForm] = useState({ name: '', id: null as string | null });
  const [editingViande, setEditingViande] = useState<any | null>(null);

  // Add viandeId to formData
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    available: true,
    viandeId: '',
  });

  // Fetch supplements
  const fetchSupplements = async () => {
    setSuppLoading(true);
    try {
      const res = await supplementApi.getAll();
      setSupplements(res.data);
    } catch (e) {
      setSuppError('Failed to load supplements');
    } finally {
      setSuppLoading(false);
    }
  };

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await menuApi.getMenuItems();
        // Map _id to id for frontend consistency
        const itemsWithId = (res.data || []).map((item: any) => ({ ...item, id: item._id }));
        setItems(itemsWithId);
      } catch (err: any) {
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data);
    } catch (e) {
      setCatError('Failed to load categories');
    } finally {
      setCatLoading(false);
    }
  };

  // Fetch all global lists on tab change
  useEffect(() => {
    if (activeTab === 'categories' || activeTab === 'menu') {
      fetchCategories();
    } else if (activeTab === 'sauces' || activeTab === 'menu') {
      setSauceLoading(true);
      sauceApi.getAll().then(res => setSauces(res.data)).catch(e => setSauceError('Failed to load sauces')).finally(() => setSauceLoading(false));
    } else if (activeTab === 'drinks') {
      setDrinkLoading(true);
      drinkApi.getAll().then(res => setDrinks(res.data)).catch(e => setDrinkError('Failed to load drinks')).finally(() => setDrinkLoading(false));
    } else if (activeTab === 'prices') {
      setPresetLoading(true);
      pricePresetApi.getAll().then(res => setPresets(res.data)).catch(e => setPresetError('Failed to load price presets')).finally(() => setPresetLoading(false));
    } else if (activeTab === 'supplements') {
      fetchSupplements();
    } else if (activeTab === 'viandes') {
      fetchViandes();
    }
  }, [activeTab]);

  // Mock stats
  const stats = [
    { name: 'Total Orders', value: '1,234', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Revenue', value: '$45,678', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Active Customers', value: '892', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  // Use real orders from context
  const recentOrders = allOrders.slice(0, 10).map(order => ({
    id: order.id,
    customer: order.customerName,
    items: order.items.map(item => `${item.name} (${item.quantity})`).join(', '),
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
  }));

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const newItem: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500',
        available: formData.available,
        viandeId: formData.viandeId || undefined,
      };
      if (editingItem) {
        newItem.id = editingItem.id;
        const res = await menuApi.updateMenuItem(editingItem.id, newItem);
        setItems(prev => prev.map(item => item.id === editingItem.id ? res.data : item));
      } else {
        const res = await menuApi.createMenuItem(newItem);
        setItems(prev => [...prev, res.data]);
      }
      resetForm();
    } catch (err: any) {
      setError('Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      available: true,
      viandeId: '',
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      available: item.available,
      viandeId: item.viandeId || '',
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setLoading(true);
      setError(null);
      try {
        await menuApi.deleteMenuItem(id);
        setItems(prev => prev.filter(item => item.id !== id));
      } catch (err: any) {
        setError('Failed to delete menu item');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handlers for categories
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatLoading(true);
    setCatError(null);
    try {
      if (catForm.id) {
        await categoryApi.update(catForm.id, { name: catForm.name });
      } else {
        await categoryApi.create({ name: catForm.name });
      }
      await fetchCategories();
      setCatForm({ name: '', id: null });
    } catch (err: any) {
      setCatError('Failed to save category');
    } finally {
      setCatLoading(false);
    }
  };
  const handleCatEdit = (cat: any) => setCatForm({ name: cat.name, id: cat._id });
  const handleCatDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    setCatLoading(true);
    setCatError(null);
    try {
      await categoryApi.delete(id);
      await fetchCategories();
    } catch {
      setCatError('Failed to delete category');
    } finally {
      setCatLoading(false);
    }
  };

  // Handlers for sauces
  const handleSauceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSauceLoading(true);
    setSauceError(null);
    try {
      if (sauceForm.id) {
        await sauceApi.update(sauceForm.id, { name: sauceForm.name });
      } else {
        await sauceApi.create({ name: sauceForm.name });
      }
      const res = await sauceApi.getAll();
      setSauces(res.data);
      setSauceForm({ name: '', id: null });
    } catch {
      setSauceError('Failed to save sauce');
    } finally {
      setSauceLoading(false);
    }
  };
  const handleSauceEdit = (s: any) => setSauceForm({ name: s.name, id: s._id });
  const handleSauceDelete = async (id: string) => {
    if (!window.confirm('Delete this sauce?')) return;
    setSauceLoading(true);
    setSauceError(null);
    try {
      await sauceApi.delete(id);
      setSauces(sauces.filter(s => s._id !== id));
    } catch {
      setSauceError('Failed to delete sauce');
    } finally {
      setSauceLoading(false);
    }
  };

  // Handlers for drinks
  const handleDrinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDrinkLoading(true);
    setDrinkError(null);
    try {
      if (drinkForm.id) {
        await drinkApi.update(drinkForm.id, { name: drinkForm.name });
      } else {
        await drinkApi.create({ name: drinkForm.name });
      }
      const res = await drinkApi.getAll();
      setDrinks(res.data);
      setDrinkForm({ name: '', id: null });
    } catch {
      setDrinkError('Failed to save drink');
    } finally {
      setDrinkLoading(false);
    }
  };
  const handleDrinkEdit = (d: any) => setDrinkForm({ name: d.name, id: d._id });
  const handleDrinkDelete = async (id: string) => {
    if (!window.confirm('Delete this drink?')) return;
    setDrinkLoading(true);
    setDrinkError(null);
    try {
      await drinkApi.delete(id);
      setDrinks(drinks.filter(d => d._id !== id));
    } catch {
      setDrinkError('Failed to delete drink');
    } finally {
      setDrinkLoading(false);
    }
  };

  // Handlers for price presets
  const handlePresetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPresetLoading(true);
    setPresetError(null);
    try {
      if (presetForm.id) {
        await pricePresetApi.update(presetForm.id, { name: presetForm.name, value: parseFloat(presetForm.value) });
      } else {
        await pricePresetApi.create({ name: presetForm.name, value: parseFloat(presetForm.value) });
      }
      const res = await pricePresetApi.getAll();
      setPresets(res.data);
      setPresetForm({ name: '', value: '', id: null });
    } catch {
      setPresetError('Failed to save price preset');
    } finally {
      setPresetLoading(false);
    }
  };
  const handlePresetEdit = (p: any) => setPresetForm({ name: p.name, value: p.value.toString(), id: p._id });
  const handlePresetDelete = async (id: string) => {
    if (!window.confirm('Delete this price preset?')) return;
    setPresetLoading(true);
    setPresetError(null);
    try {
      await pricePresetApi.delete(id);
      setPresets(presets.filter(p => p._id !== id));
    } catch {
      setPresetError('Failed to delete price preset');
    } finally {
      setPresetLoading(false);
    }
  };

  // Supplements CRUD handlers
  const handleSuppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuppLoading(true);
    setSuppError(null);
    try {
      const price = parseFloat(suppForm.price);
      if (isNaN(price) || price < 0) throw new Error('Price must be a positive number');
      if (editingSupp) {
        await supplementApi.update(editingSupp._id, { name: suppForm.name, price });
      } else {
        await supplementApi.create({ name: suppForm.name, price });
      }
      setSuppForm({ name: '', price: '' });
      setEditingSupp(null);
      fetchSupplements();
    } catch (err: any) {
      setSuppError('Failed to save supplement');
    } finally {
      setSuppLoading(false);
    }
  };
  const handleSuppEdit = (supp: any) => {
    setSuppForm({ name: supp.name, price: supp.price.toString() });
    setEditingSupp(supp);
  };
  const handleSuppDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplement?')) {
      setSuppLoading(true);
      setSuppError(null);
      try {
        await supplementApi.delete(id);
        fetchSupplements();
      } catch (err: any) {
        setSuppError('Failed to delete supplement');
      } finally {
        setSuppLoading(false);
      }
    }
  };
  const resetSuppForm = () => {
    setSuppForm({ name: '', price: '' });
    setEditingSupp(null);
  };

  const fetchViandes = async () => {
    setViandeLoading(true);
    try {
      const res = await viandeApi.getAll();
      setViandes(res);
    } catch (e) {
      setViandeError('Failed to load meats');
    } finally {
      setViandeLoading(false);
    }
  };

  const handleViandeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setViandeLoading(true);
    setViandeError(null);
    try {
      if (viandeForm.id) {
        await viandeApi.update(viandeForm.id, { name: viandeForm.name });
      } else {
        await viandeApi.create({ name: viandeForm.name });
      }
      await fetchViandes();
      setViandeForm({ name: '', id: null });
      setEditingViande(null);
    } catch (err) {
      setViandeError('Failed to save meat');
    } finally {
      setViandeLoading(false);
    }
  };
  const handleViandeEdit = (v: any) => setViandeForm({ name: v.name, id: v._id });
  const handleViandeDelete = async (id: string) => {
    if (!window.confirm('Delete this meat?')) return;
    setViandeLoading(true);
    setViandeError(null);
    try {
      await viandeApi.delete(id);
      await fetchViandes();
    } catch {
      setViandeError('Failed to delete meat');
    } finally {
      setViandeLoading(false);
    }
  };
  const resetViandeForm = () => {
    setViandeForm({ name: '', id: null });
    setEditingViande(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'orders' && newOrderCount > 0) {
      clearNewOrderCount();
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as any);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your restaurant operations</p>
      </div>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading && <div className="mb-4 text-blue-600">Loading...</div>}
      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-8 bg-white rounded-t-xl shadow-sm p-2">
        <button className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-blue-500'}`} onClick={() => setActiveTab('overview')}><List className="h-5 w-5" /> Overview</button>
        <button className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === 'menu' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600 hover:text-orange-500'}`} onClick={() => setActiveTab('menu')}><Utensils className="h-5 w-5" /> Menu</button>
        <button className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === 'orders' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-600 hover:text-green-500'}`} onClick={() => setActiveTab('orders')}><Package className="h-5 w-5" /> Orders</button>
        <button className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === 'categories' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600 hover:text-purple-500'}`} onClick={() => setActiveTab('categories')}><Tag className="h-5 w-5" /> Categories</button>
        <button className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === 'sauces' ? 'border-b-2 border-pink-500 text-pink-600' : 'text-gray-600 hover:text-pink-500'}`} onClick={() => setActiveTab('sauces')}><Droplet className="h-5 w-5" /> Sauces</button>
        <button className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === 'drinks' ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-gray-600 hover:text-cyan-500'}`} onClick={() => setActiveTab('drinks')}><CupSoda className="h-5 w-5" /> Drinks</button>
        <button className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === 'prices' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-600 hover:text-yellow-500'}`} onClick={() => setActiveTab('prices')}><DollarSign className="h-5 w-5" /> Price Presets</button>
        <button className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === 'supplements' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600 hover:text-orange-500'}`} onClick={() => setActiveTab('supplements')}><Plus className="h-5 w-5" /> Supplements</button>
        <button className={`flex items-center gap-2 px-4 py-2 font-medium ${activeTab === 'viandes' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-600 hover:text-red-500'}`} onClick={() => setActiveTab('viandes')}><Drumstick className="h-5 w-5" /> Meats</button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              {newOrderCount > 0 && (
                <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                  <BellRing className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">{newOrderCount} new order{newOrderCount > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.items}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Menu Management Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Item Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {/* Viande (Meat) selection */}
                <select
                  value={formData.viandeId}
                  onChange={e => setFormData(prev => ({ ...prev, viandeId: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">No Meat</option>
                  {viandes.map(v => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
                <input
                  type="url"
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="md:col-span-2 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                  required
                />
                <div className="md:col-span-2 flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Available</span>
                  </label>
                  <div className="flex space-x-2 ml-auto">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      {editingItem ? 'Update' : 'Add'} Item
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Menu Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-orange-600 font-bold">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  {/* Show viande name if present */}
                  {item.viandeId && (
                    <div className="text-xs text-gray-500 mb-2">Meat: {viandes.find(v => v._id === item.viandeId)?.name || item.viandeId}</div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
            <div className="text-sm text-gray-500">
              Total Orders: {allOrders.length}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {allOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Tag className="h-6 w-6 text-purple-500" /> Manage Categories</h2>
          <form onSubmit={handleCatSubmit} className="flex gap-2 mb-4">
            <input type="text" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="Category name" className="border px-2 py-1 rounded" required />
            <button type="submit" className="bg-purple-500 text-white px-3 py-1 rounded">{catForm.id ? 'Update' : 'Add'}</button>
            {catForm.id && <button type="button" onClick={() => setCatForm({ name: '', id: null })} className="px-2">Cancel</button>}
          </form>
          {catError && <div className="text-red-500 mb-2">{catError}</div>}
          {catLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full bg-white rounded shadow overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => setCatForm({ name: cat.name, id: cat._id })} className="text-blue-600 hover:underline mr-4" title="Edit"><Edit className="inline h-4 w-4" /></button>
                      <button onClick={() => handleCatDelete(cat._id)} className="text-red-600 hover:underline" title="Delete"><Trash2 className="inline h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {/* Sauces Tab */}
      {activeTab === 'sauces' && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Droplet className="h-6 w-6 text-pink-500" /> Manage Sauces</h2>
          <form onSubmit={handleSauceSubmit} className="flex gap-2 mb-4">
            <input type="text" value={sauceForm.name} onChange={e => setSauceForm(f => ({ ...f, name: e.target.value }))} placeholder="Sauce name" className="border px-2 py-1 rounded" required />
            <button type="submit" className="bg-pink-500 text-white px-3 py-1 rounded">{sauceForm.id ? 'Update' : 'Add'}</button>
            {sauceForm.id && <button type="button" onClick={() => setSauceForm({ name: '', id: null })} className="px-2">Cancel</button>}
          </form>
          {sauceError && <div className="text-red-500 mb-2">{sauceError}</div>}
          {sauceLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full bg-white rounded shadow overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sauces.map((s, idx) => (
                  <tr key={s._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => setSauceForm({ name: s.name, id: s._id })} className="text-blue-600 hover:underline mr-4" title="Edit"><Edit className="inline h-4 w-4" /></button>
                      <button onClick={() => handleSauceDelete(s._id)} className="text-red-600 hover:underline" title="Delete"><Trash2 className="inline h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {/* Drinks Tab */}
      {activeTab === 'drinks' && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CupSoda className="h-6 w-6 text-cyan-500" /> Manage Drinks</h2>
          <form onSubmit={handleDrinkSubmit} className="flex gap-2 mb-4">
            <input type="text" value={drinkForm.name} onChange={e => setDrinkForm(f => ({ ...f, name: e.target.value }))} placeholder="Drink name" className="border px-2 py-1 rounded" required />
            <button type="submit" className="bg-cyan-500 text-white px-3 py-1 rounded">{drinkForm.id ? 'Update' : 'Add'}</button>
            {drinkForm.id && <button type="button" onClick={() => setDrinkForm({ name: '', id: null })} className="px-2">Cancel</button>}
          </form>
          {drinkError && <div className="text-red-500 mb-2">{drinkError}</div>}
          {drinkLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full bg-white rounded shadow overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drinks.map((d, idx) => (
                  <tr key={d._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => setDrinkForm({ name: d.name, id: d._id })} className="text-blue-600 hover:underline mr-4" title="Edit"><Edit className="inline h-4 w-4" /></button>
                      <button onClick={() => handleDrinkDelete(d._id)} className="text-red-600 hover:underline" title="Delete"><Trash2 className="inline h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {/* Price Presets Tab */}
      {activeTab === 'prices' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Manage Price Presets</h2>
          <form onSubmit={handlePresetSubmit} className="flex gap-2 mb-4">
            <input type="text" value={presetForm.name} onChange={e => setPresetForm(f => ({ ...f, name: e.target.value }))} placeholder="Preset name" className="border px-2 py-1" required />
            <input type="number" value={presetForm.value} onChange={e => setPresetForm(f => ({ ...f, value: e.target.value }))} placeholder="Value" className="border px-2 py-1" required min="0" step="0.01" />
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">{presetForm.id ? 'Update' : 'Add'}</button>
            {presetForm.id && <button type="button" onClick={() => setPresetForm({ name: '', value: '', id: null })} className="px-2">Cancel</button>}
          </form>
          {presetError && <div className="text-red-500 mb-2">{presetError}</div>}
          {presetLoading ? <div>Loading...</div> : (
            <ul>
              {presets.map(p => (
                <li key={p._id} className="flex items-center gap-2 mb-1">
                  <span>{p.name}: ${p.value}</span>
                  <button onClick={() => handlePresetEdit(p)} className="text-blue-500">Edit</button>
                  <button onClick={() => handlePresetDelete(p._id)} className="text-red-500">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* Supplements Tab */}
      {activeTab === 'supplements' && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="h-6 w-6 text-orange-500" /> Manage Supplements</h2>
          <form onSubmit={handleSuppSubmit} className="flex gap-2 mb-4">
            <input type="text" value={suppForm.name} onChange={e => setSuppForm(f => ({ ...f, name: e.target.value }))} placeholder="Supplement name" className="border px-2 py-1 rounded" required />
            <input type="number" value={suppForm.price} onChange={e => setSuppForm(f => ({ ...f, price: e.target.value }))} placeholder="Price" className="border px-2 py-1 rounded w-24" min="0" step="0.01" required />
            <button type="submit" className="bg-orange-500 text-white px-3 py-1 rounded">{editingSupp ? 'Update' : 'Add'}</button>
            {editingSupp && <button type="button" onClick={resetSuppForm} className="px-2">Cancel</button>}
          </form>
          {suppError && <div className="text-red-500 mb-2">{suppError}</div>}
          {suppLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full bg-white rounded shadow overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supplements.map((supp, idx) => (
                  <tr key={supp._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 font-medium text-gray-900">{supp.name}</td>
                    <td className="px-4 py-2"><span className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-semibold">${supp.price.toFixed(2)}</span></td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleSuppEdit(supp)} className="text-blue-600 hover:underline mr-4" title="Edit"><Edit className="inline h-4 w-4" /></button>
                      <button onClick={() => handleSuppDelete(supp._id)} className="text-red-600 hover:underline" title="Delete"><Trash2 className="inline h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {/* Viandes Tab */}
      {activeTab === 'viandes' && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Drumstick className="h-6 w-6 text-red-500" /> Manage Meats (Viandes)</h2>
          <form onSubmit={handleViandeSubmit} className="flex gap-2 mb-4">
            <input type="text" value={viandeForm.name} onChange={e => setViandeForm(f => ({ ...f, name: e.target.value }))} placeholder="Meat name" className="border px-2 py-1 rounded" required />
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">{viandeForm.id ? 'Update' : 'Add'}</button>
            {viandeForm.id && <button type="button" onClick={() => setViandeForm({ name: '', id: null })} className="px-2">Cancel</button>}
          </form>
          {viandeError && <div className="text-red-500 mb-2">{viandeError}</div>}
          {viandeLoading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full bg-white rounded shadow overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {viandes.map((v, idx) => (
                  <tr key={v._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 font-medium text-gray-900">{v.name}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => setViandeForm({ name: v.name, id: v._id })} className="text-blue-600 hover:underline mr-4" title="Edit"><Edit className="inline h-4 w-4" /></button>
                      <button onClick={() => handleViandeDelete(v._id)} className="text-red-600 hover:underline" title="Delete"><Trash2 className="inline h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;