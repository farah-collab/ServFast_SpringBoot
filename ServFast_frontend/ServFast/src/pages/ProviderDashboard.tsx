import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { servicesApi, Service, ServiceCreateRequest } from '../api/services';
import { ordersApi, Order } from '../api/orders';
import { categoriesApi, Category } from '../api/categories';
import { authApi } from '../api/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axiosConfig';

const STORAGE_URL = 'http://localhost:8081';

function getImageUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http') || photoUrl.startsWith('data:')) return photoUrl;
  const normalizedPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
  return `${STORAGE_URL}${normalizedPath}`;
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url as string;
}

export default function ProviderDashboard() {
  const [services, setServices]     = useState<Service[]>([]);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');

  // Order action state
  const [orderActionLoading, setOrderActionLoading] = useState<number | null>(null);

  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice]           = useState('');
  const [priceType, setPriceType]   = useState<'FIXED' | 'HOURLY' | 'QUOTE'>('FIXED');
  const [city, setCity]             = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [imageFile, setImageFile]         = useState<File | null>(null);
  const [imagePreview, setImagePreview]   = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryMode, setCategoryMode]         = useState<'select' | 'new'>('select');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [newCategoryName, setNewCategoryName]   = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode: dm } = useTheme();
  const user = authApi.getCurrentUser();

  useEffect(() => {
    if (location.state?.openCreateForm) {
      setShowForm(true);
      resetForm();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (!user || user.role !== 'PROVIDER') { navigate('/login'); return; }
    const load = async () => {
      try {
        const [myServices, myOrders, cats] = await Promise.all([
          servicesApi.getMyServices(),
          ordersApi.getReceivedOrders(),
          categoriesApi.getAll(),
        ]);
        setServices(myServices);
        setOrders(myOrders);
        setCategories(Array.isArray(cats) ? cats : (cats as any).content ?? []);
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Stats — earnings basé uniquement sur les orders ACCEPTED ou COMPLETED ──
  const acceptedOrCompleted = orders.filter(
    o => o.status === 'COMPLETED' || o.status === 'ACCEPTED'
  );
  const totalEarnings = acceptedOrCompleted.reduce(
    (sum, o) => sum + (o.servicePrice || 0), 0
  );

  let ratingSum = 0, ratingCount = 0;
  services.forEach(s => {
    if (s.averageRating && s.totalRatings) {
      ratingSum   += s.averageRating * s.totalRatings;
      ratingCount += s.totalRatings;
    }
  });
  const overallRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '0.0';

  const stats = [
    { label: 'Services',  value: services.length.toString(),             icon: '📊' },
    { label: 'Orders',    value: orders.length.toString(),                icon: '📦' },
    { label: 'Earnings',  value: `${totalEarnings.toLocaleString()} TND`, icon: '💰' },
    { label: 'Rating',    value: overallRating,                           icon: '⭐' },
  ];

  const resetForm = () => {
    setTitle(''); setDescription(''); setPrice('');
    setPriceType('FIXED'); setCity(''); setIsAvailable(true);
    setImageFile(null); setImagePreview(null);
    setSelectedCategoryId(''); setNewCategoryName('');
    setCategoryMode('select'); setFormError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setFormError('Veuillez sélectionner une image valide.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setFormError("L'image ne doit pas dépasser 5 Mo."); return; }
    setImageFile(file);
    setFormError('');
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ── Accept / Reject order ──────────────────────────────────────────────────
  const handleOrderAction = async (orderId: number, action: 'accept' | 'reject') => {
    setOrderActionLoading(orderId);
    try {
      const updated = action === 'accept'
        ? await ordersApi.accept(orderId)
        : await ordersApi.reject(orderId);
      // Mise à jour locale avec la réponse du serveur
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
    } catch (err: any) {
      console.error('Order action error', err);
      // Affichage inline sans alert()
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, _error: true } as any : o
      ));
    } finally {
      setOrderActionLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim())               { setFormError('Le titre est requis.'); return; }
    if (!price || isNaN(Number(price))) { setFormError('Prix invalide.'); return; }

    let finalCategoryId: number;
    if (categoryMode === 'new') {
      if (!newCategoryName.trim()) { setFormError('Nom de catégorie requis.'); return; }
      const existing = categories.find(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase());
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

    let uploadedImageUrl: string | undefined;
    if (imageFile) {
      try {
        setImageUploading(true);
        uploadedImageUrl = await uploadImage(imageFile);
      } catch {
        setFormError("Erreur lors de l'upload de l'image.");
        setImageUploading(false);
        return;
      } finally {
        setImageUploading(false);
      }
    }

    setSubmitting(true);
    try {
      const payload: ServiceCreateRequest = {
        title:       title.trim(),
        description: description.trim(),
        price:       Number(price),
        priceType,
        city:        city.trim() || undefined,
        categoryId:  finalCategoryId,
        isAvailable,
        photoUrls:   uploadedImageUrl ? [uploadedImageUrl] : undefined,
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
      case 'ACTIVE': case 'COMPLETED': return { bg: dm ? '#052e16' : '#f0fdf4', color: dm ? '#4ade80' : '#15803d' };
      case 'ACCEPTED':                 return { bg: dm ? '#1e3a5f' : '#eff6ff', color: dm ? '#93c5fd' : '#1d4ed8' };
      case 'PENDING':                  return { bg: dm ? '#422006' : '#fefce8', color: dm ? '#fcd34d' : '#a16207' };
      case 'IN-PROGRESS':              return { bg: dm ? '#1e3a5f' : '#eff6ff', color: dm ? '#93c5fd' : '#1d4ed8' };
      case 'REJECTED':                 return { bg: dm ? '#450a0a' : '#fef2f2', color: dm ? '#fca5a5' : '#b91c1c' };
      default:                         return { bg: dm ? '#1f2937' : '#f9fafb', color: dm ? '#d1d5db' : '#6b7280' };
    }
  };

  const inputCls = `w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-red-600 transition-colors ${dm ? 'bg-gray-800 border-gray-750 text-white focus:bg-gray-800' : 'bg-white border-gray-200 text-gray-900'}`;

  return (
    <div style={{ minWidth: 1280, fontFamily: "'DM Sans', sans-serif" }} className={`flex flex-col min-h-screen transition-colors duration-300 ${dm ? 'bg-gray-955 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />

      {/* Header */}
      <div className={`border-b ${dm ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className={`text-3xl font-bold mb-1 ${dm ? 'text-white' : 'text-gray-900'}`}>
                Bienvenue, {user?.firstName}
              </h1>
              <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                Voici ce qui se passe avec vos services aujourd'hui
              </p>
            </div>
            <button
              onClick={() => { setShowForm(true); resetForm(); }}
              className="px-5 py-2.5 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 transition-all cursor-pointer border-none"
            >
              + Nouveau service
            </button>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {stats.map(stat => (
              <div key={stat.label} className={`border rounded-xl p-6 ${dm ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  {stat.label === 'Earnings' && (
                    <span className="text-xs text-emerald-500 font-semibold">Acceptées</span>
                  )}
                </div>
                <div className={`text-2xl font-bold mb-1 ${dm ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                <div className={`text-xs ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal formulaire ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: dm ? '#1f2937' : '#fff', color: dm ? '#fff' : '#000', borderRadius: 20, padding: '32px 36px', width: 580, maxHeight: '92vh', overflowY: 'auto', boxShadow: dm ? 'none' : '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Publier un service</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: dm ? '#9CA3AF' : '#6B7280' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre du service *" className={inputCls} />
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} className={inputCls} style={{ resize: 'vertical' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} placeholder="Prix (TND) *" className={inputCls} />
                <select value={priceType} onChange={e => setPriceType(e.target.value as any)} className={inputCls}>
                  <option value="FIXED">Prix fixe</option>
                  <option value="HOURLY">Par heure</option>
                  <option value="QUOTE">Sur devis</option>
                </select>
              </div>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Ville (optionnel)" className={inputCls} />
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {(['select', 'new'] as const).map(mode => (
                    <button key={mode} type="button" onClick={() => setCategoryMode(mode)}
                      style={{ flex: 1, padding: '7px 0', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: categoryMode === mode ? '#B91C1C' : dm ? '#374151' : '#F3F4F6', color: categoryMode === mode ? '#fff' : dm ? '#D1D5DB' : '#6B7280' }}>
                      {mode === 'select' ? 'Catégorie existante' : '+ Nouvelle catégorie'}
                    </button>
                  ))}
                </div>
                {categoryMode === 'select' ? (
                  <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value === '' ? '' : Number(e.target.value))} className={inputCls}>
                    <option value="">Sélectionner une catégorie *</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                ) : (
                  <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nom de la nouvelle catégorie *" className={inputCls} />
                )}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: dm ? '#F3F4F6' : '#374151', marginBottom: 8 }}>Image du service</p>
                <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed', borderColor: imagePreview ? '#B91C1C' : dm ? '#374151' : '#E5E7EB', borderRadius: 12, padding: imagePreview ? 0 : '24px 16px', textAlign: 'center', cursor: 'pointer', background: imagePreview ? 'transparent' : dm ? '#1f2937' : '#FAFAFA', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  {imagePreview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={imagePreview} alt="Aperçu" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block', borderRadius: 10 }} />
                      <button type="button" onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✕ Supprimer</button>
                      <div style={{ padding: '8px 12px', fontSize: 12, color: dm ? '#9CA3AF' : '#6B7280', background: dm ? '#111827' : '#F9FAFB' }}>{imageFile?.name} — Cliquez pour changer</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: dm ? '#F3F4F6' : '#374151', margin: '0 0 4px' }}>Cliquez pour sélectionner une image</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>PNG, JPG, WEBP — max 5 Mo</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: dm ? '#D1D5DB' : '#374151' }}>
                <input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} style={{ accentColor: '#B91C1C', width: 16, height: 16 }} />
                Disponible immédiatement
              </label>
              {formError && (
                <p style={{ color: '#B91C1C', fontSize: 13, margin: 0, padding: '8px 12px', background: dm ? '#450A0A' : '#FEF2F2', borderRadius: 8 }}>{formError}</p>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" disabled={submitting || imageUploading}
                  style={{ flex: 1, padding: '12px 0', background: '#B91C1C', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: submitting || imageUploading ? 'not-allowed' : 'pointer', opacity: submitting || imageUploading ? 0.7 : 1 }}>
                  {imageUploading ? 'Upload image...' : submitting ? 'Création...' : 'Publier le service'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                  style={{ padding: '12px 20px', background: dm ? '#374151' : '#F3F4F6', color: dm ? '#F3F4F6' : '#374151', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-red-200 border-t-red-700 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-8">
          <div className="grid grid-cols-3 gap-8">

            {/* ── Services ── */}
            <div className="col-span-2">
              <div className={`border rounded-2xl overflow-hidden ${dm ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className={`px-6 py-5 border-b flex items-center justify-between ${dm ? 'border-gray-800' : 'border-gray-100'}`}>
                  <h2 className={`text-lg font-bold ${dm ? 'text-white' : 'text-gray-900'}`}>Mes Services ({services.length})</h2>
                  <button onClick={() => { setShowForm(true); resetForm(); }} className="text-xs font-semibold text-red-700 hover:text-red-800 bg-transparent border-none cursor-pointer">
                    + Nouveau service
                  </button>
                </div>
                {services.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className={`text-sm mb-3 ${dm ? 'text-gray-400' : 'text-gray-400'}`}>Aucun service publié pour le moment.</p>
                    <button onClick={() => { setShowForm(true); resetForm(); }} className="px-5 py-2 bg-red-700 text-white text-sm font-semibold rounded-xl border-none cursor-pointer hover:bg-red-800">
                      Créer mon premier service
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${dm ? 'border-gray-800' : 'border-gray-100'}`}>
                          {['Service', 'Prix', 'Statut', 'Commandes'].map(h => (
                            <th key={h} className={`text-left px-6 py-4 text-xs font-bold uppercase tracking-wider ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {services.map(service => {
                          const serviceOrders = orders.filter(o => o.serviceId === service.id).length;
                          const thumb = service.photoUrls?.[0] || service.imageUrl;
                          const imageUrl = getImageUrl(thumb);
                          return (
                            <tr key={service.id} className={`border-b transition-colors ${dm ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0, overflow: 'hidden', background: imageUrl ? `url(${imageUrl}) center/cover` : dm ? '#1f2937' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                                    {!imageUrl && '🛠'}
                                  </div>
                                  <span className={`text-sm font-medium ${dm ? 'text-white' : 'text-gray-900'}`}>{service.title}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-sm font-semibold ${dm ? 'text-white' : 'text-gray-900'}`}>{service.price} TND</span>
                              </td>
                              <td className="px-6 py-4">
                                <span style={{ ...getStatusColor(service.isAvailable ? 'ACTIVE' : 'PENDING'), padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>
                                  {service.isAvailable ? 'ACTIF' : 'INACTIF'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-650'}`}>{serviceOrders}</span>
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

            {/* ── Commandes récentes ── */}
            <div>
              <div className={`border rounded-2xl overflow-hidden ${dm ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className={`px-6 py-5 border-b ${dm ? 'border-gray-800' : 'border-gray-100'}`}>
                  <h3 className={`text-lg font-bold ${dm ? 'text-white' : 'text-gray-900'}`}>
                    Commandes récentes
                  </h3>
                  <p className={`text-xs mt-0.5 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                    {orders.filter(o => o.status === 'PENDING').length} en attente
                  </p>
                </div>

                <div className={`divide-y ${dm ? 'divide-gray-800' : 'divide-gray-100'}`} style={{ maxHeight: 520, overflowY: 'auto' }}>
                  {orders.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-gray-500">
                      Aucune commande pour l'instant.
                    </div>
                  ) : orders.map(order => {
                    const statusStyle = getStatusColor(order.status);
                    const isPending   = order.status === 'PENDING';
                    const isActing    = orderActionLoading === order.id;

                    return (
                      <div key={order.id} className={`px-5 py-4 transition-colors ${dm ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>

                        {/* En-tête commande */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-xs flex-shrink-0">
                            {order.clientName?.slice(0, 2).toUpperCase() || 'CL'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${dm ? 'text-white' : 'text-gray-900'}`}>
                              {order.serviceTitle}
                            </p>
                            <p className={`text-[10px] mt-0.5 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                              {order.clientName}
                            </p>
                          </div>
                        </div>

                        {/* Prix + Statut */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-bold ${dm ? 'text-white' : 'text-gray-900'}`}>
                            {order.servicePrice} TND
                          </span>
                          <span style={{ ...statusStyle, padding: '3px 10px', borderRadius: 9999, fontSize: 10, fontWeight: 700 }}>
                            {order.status}
                          </span>
                        </div>

                        {/* Date */}
                        <p className="text-[10px] text-gray-400 mb-3">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </p>

                        {/* ── Boutons Accept / Reject (uniquement si PENDING) ── */}
                        {isPending && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOrderAction(order.id, 'accept')}
                              disabled={isActing}
                              style={{
                                flex: 1, padding: '7px 0', borderRadius: 10, border: 'none',
                                fontWeight: 700, fontSize: 12, cursor: isActing ? 'not-allowed' : 'pointer',
                                background: isActing ? '#6b7280' : '#15803d',
                                color: '#fff', opacity: isActing ? 0.7 : 1,
                                transition: 'background 0.2s',
                              }}
                            >
                              {isActing ? '...' : '✓ Accepter'}
                            </button>
                            <button
                              onClick={() => handleOrderAction(order.id, 'reject')}
                              disabled={isActing}
                              style={{
                                flex: 1, padding: '7px 0', borderRadius: 10, border: 'none',
                                fontWeight: 700, fontSize: 12, cursor: isActing ? 'not-allowed' : 'pointer',
                                background: isActing ? '#6b7280' : '#b91c1c',
                                color: '#fff', opacity: isActing ? 0.7 : 1,
                                transition: 'background 0.2s',
                              }}
                            >
                              {isActing ? '...' : '✕ Refuser'}
                            </button>
                          </div>
                        )}

                        {/* Message si acceptée — earnings augmentés */}
                        {order.status === 'ACCEPTED' && (
                          <div style={{ background: dm ? '#052e16' : '#f0fdf4', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: dm ? '#4ade80' : '#15803d', fontWeight: 600 }}>
                            ✓ Acceptée · +{order.servicePrice} TND ajoutés aux gains
                          </div>
                        )}

                        {/* Message si rejetée */}
                        {order.status === 'REJECTED' && (
                          <div style={{ background: dm ? '#450a0a' : '#fef2f2', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: dm ? '#fca5a5' : '#b91c1c', fontWeight: 600 }}>
                            ✕ Commande refusée
                          </div>
                        )}

                        {/* Message d'erreur inline */}
                        {(order as any)._error && (
                          <div style={{ background: dm ? '#422006' : '#fefce8', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: dm ? '#fcd34d' : '#a16207', fontWeight: 600 }}>
                            ⚠ Erreur lors de l'action — réessayez
                          </div>
                        )}
                      </div>
                    );
                  })}
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