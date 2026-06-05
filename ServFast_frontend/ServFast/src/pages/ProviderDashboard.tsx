import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { servicesApi, Service, ServiceCreateRequest } from '../api/services';
import { ordersApi, Order } from '../api/orders';
import { categoriesApi, Category } from '../api/categories';
import { authApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export default function ProviderDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'FIXED' | 'HOURLY' | 'QUOTE'>('FIXED');
  const [city, setCity] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  // Category: selected from list OR new name typed
  const [categoryMode, setCategoryMode] = useState<'select' | 'new'>('select');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const navigate = useNavigate();
  const user = authApi.getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== 'PROVIDER') { navigate('/login'); return; }
    const loadData = async () => {
      try {
        const [myServices, myOrders, cats] = await Promise.all([
          servicesApi.getMyServices(),
          ordersApi.getReceivedOrders(),
          categoriesApi.getAll(),
        ]);
        setServices(myServices);
        setOrders(myOrders);
        const catList = Array.isArray(cats) ? cats : (cats as any).content ?? [];
        setCategories(catList);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.servicePrice || 0), 0);
  let totalRatingSum = 0, totalRatingsCount = 0;
  services.forEach(s => {
    if (s.averageRating && s.totalRatings) {
      totalRatingSum += s.averageRating * s.totalRatings;
      totalRatingsCount += s.totalRatings;
    }
  });
  const overallRating = totalRatingsCount > 0 ? (totalRatingSum / totalRatingsCount).toFixed(1) : '0.0';

  const stats = [
    { label: 'Services', value: services.length.toString(), icon: '📊' },
    { label: 'Orders', value: orders.length.toString(), icon: '📦' },
    { label: 'Earnings', value: `${totalEarnings.toLocaleString()} TND`, icon: '💰' },
    { label: 'Rating', value: overallRating, icon: '⭐' },
  ];

  const resetForm = () => {
    setTitle(''); setDescription(''); setPrice('');
    setPriceType('FIXED'); setCity(''); setImageUrl('');
    setIsAvailable(true); setSelectedCategoryId('');
    setNewCategoryName(''); setCategoryMode('select');
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) { setFormError('Le titre est requis.'); return; }
    if (!price || isNaN(Number(price))) { setFormError('Prix invalide.'); return; }

    let finalCategoryId: number;

    if (categoryMode === 'new') {
      if (!newCategoryName.trim()) { setFormError('Nom de catégorie requis.'); return; }
      // Check if already exists (case-insensitive)
      const existing = categories.find(
        c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase()
      );
      if (existing) {
        finalCategoryId = existing.id;
      } else {
        try {
          const created = await categoriesApi.create({ name: newCategoryName.trim() });
          setCategories(prev => [...prev, created]);
          finalCategoryId = created.id;
        } catch {
          setFormError('Erreur lors de la création de la catégorie.');
          return;
        }
      }
    } else {
      if (selectedCategoryId === '') { setFormError('Veuillez sélectionner une catégorie.'); return; }
      finalCategoryId = Number(selectedCategoryId);
    }

    setSubmitting(true);
    try {
      const payload: ServiceCreateRequest = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        priceType,
        city: city.trim() || undefined,
        categoryId: finalCategoryId,
        isAvailable,
        imageUrl: imageUrl.trim() || undefined,
      };
      const created = await servicesApi.create(payload);
      setServices(prev => [created, ...prev]);
      setShowForm(false);
      resetForm();
    } catch {
      setFormError('Erreur lors de la création du service.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': case 'COMPLETED': return 'bg-emerald-50 text-emerald-700';
      case 'PENDING': return 'bg-yellow-50 text-yellow-700';
      case 'IN-PROGRESS': case 'ACCEPTED': return 'bg-blue-50 text-blue-700';
      case 'REJECTED': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-600 transition-colors bg-white";

  return (
    <div style={{ minWidth: 1280, fontFamily: "'DM Sans', sans-serif" }} className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, {user?.firstName}</h1>
              <p className="text-sm text-gray-500">Here's what's happening with your services today</p>
            </div>
            <button
              onClick={() => { setShowForm(true); resetForm(); }}
              className="px-5 py-2.5 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 transition-all cursor-pointer border-none"
            >
              + New Service
            </button>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {stats.map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-xs text-gray-400">+8%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Service Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px 36px', width: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Post a Service</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Title */}
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Titre du service *"
                className={inputCls}
              />

              {/* Description */}
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description"
                rows={3}
                className={inputCls}
                style={{ resize: 'vertical' }}
              />

              {/* Price + Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input
                  type="number" min={0}
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="Prix (TND) *"
                  className={inputCls}
                />
                <select value={priceType} onChange={e => setPriceType(e.target.value as any)} className={inputCls}>
                  <option value="FIXED">Prix fixe</option>
                  <option value="HOURLY">Par heure</option>
                  <option value="QUOTE">Sur devis</option>
                </select>
              </div>

              {/* City */}
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Ville (optionnel)"
                className={inputCls}
              />

              {/* Category */}
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button type="button"
                    onClick={() => setCategoryMode('select')}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 10, border: 'none',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      background: categoryMode === 'select' ? '#B91C1C' : '#F3F4F6',
                      color: categoryMode === 'select' ? '#fff' : '#6B7280',
                    }}
                  >
                    Catégorie existante
                  </button>
                  <button type="button"
                    onClick={() => setCategoryMode('new')}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 10, border: 'none',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      background: categoryMode === 'new' ? '#B91C1C' : '#F3F4F6',
                      color: categoryMode === 'new' ? '#fff' : '#6B7280',
                    }}
                  >
                    + Nouvelle catégorie
                  </button>
                </div>

                {categoryMode === 'select' ? (
                  <select
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                    className={inputCls}
                  >
                    <option value="">Sélectionner une catégorie *</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Nom de la nouvelle catégorie *"
                    className={inputCls}
                  />
                )}
              </div>

              {/* Image URL */}
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="URL de l'image (optionnel)"
                className={inputCls}
              />

              {/* Available */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={e => setIsAvailable(e.target.checked)}
                  style={{ accentColor: '#B91C1C', width: 16, height: 16 }}
                />
                Disponible immédiatement
              </label>

              {formError && (
                <p style={{ color: '#B91C1C', fontSize: 13, margin: 0, padding: '8px 12px', background: '#FEF2F2', borderRadius: 8 }}>
                  {formError}
                </p>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" disabled={submitting}
                  style={{
                    flex: 1, padding: '12px 0', background: '#B91C1C', color: '#fff',
                    border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15,
                    cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Création...' : 'Publier le service'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                  style={{
                    padding: '12px 20px', background: '#F3F4F6', color: '#374151',
                    border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-red-200 border-t-red-700 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-8">
          <div className="grid grid-cols-3 gap-8">

            {/* Services Management */}
            <div className="col-span-2">
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    My Services ({services.length})
                  </h2>
                  <button
                    onClick={() => { setShowForm(true); resetForm(); }}
                    className="text-xs font-semibold text-red-700 hover:text-red-800 bg-transparent border-none cursor-pointer"
                  >
                    + New Service
                  </button>
                </div>

                {services.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-400 text-sm mb-3">Aucun service publié pour le moment.</p>
                    <button
                      onClick={() => { setShowForm(true); resetForm(); }}
                      className="px-5 py-2 bg-red-700 text-white text-sm font-semibold rounded-xl border-none cursor-pointer hover:bg-red-800"
                    >
                      Créer mon premier service
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Prix</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Commandes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map(service => {
                          const serviceOrders = orders.filter(o => o.serviceId === service.id).length;
                          return (
                            <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div style={{
                                    width: 40, height: 40, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                                    background: service.imageUrl ? `url(${service.imageUrl}) center/cover` : '#FEF2F2',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18,
                                  }}>
                                    {!service.imageUrl && '🛠'}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{service.title}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-semibold text-gray-900">{service.price} TND</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(service.isAvailable ? 'ACTIVE' : 'PENDING')}`}>
                                  {service.isAvailable ? 'ACTIF' : 'INACTIF'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-gray-600">{serviceOrders}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {orders.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-gray-500">No orders yet.</div>
                  ) : orders.map(order => (
                    <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-xs flex-shrink-0">
                          {order.clientName?.slice(0, 2).toUpperCase() || 'CL'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{order.serviceTitle}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{order.clientName}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-900">{order.servicePrice} TND</span>
                        <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded-md ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <button className="w-full text-xs font-bold text-red-700 hover:text-red-800 transition-colors cursor-pointer bg-transparent border-none">
                    See More Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}