import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/common/Footer';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';
import { servicesApi, Service } from '../api/services';
import { categoriesApi, Category } from '../api/categories';
import api from '../api/axiosConfig';

// ── URL de base du stockage Spring Boot ──
const STORAGE_URL = 'http://localhost:8081';

function getImageUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http') || photoUrl.startsWith('data:')) return photoUrl;
  const normalizedPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
  return `${STORAGE_URL}${normalizedPath}`;
}

const initialServiceForm = {
  title: '',
  description: '',
  price: '',
  city: '',
  category_id: '',
  photos: [] as File[],
  photoPreviews: [] as string[],
};

type Tab = 'profile' | 'my-services' | 'saved' | 'publish';

const Icons = {
  User: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 13.5C2.5 11.015 5.015 9 8 9s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Briefcase: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="5.5" width="12" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 5.5V4a1.5 1.5 0 011.5-1.5h2A1.5 1.5 0 0110.5 4v1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 9h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Bookmark: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 2h8a1 1 0 011 1v10.5l-5-3-5 3V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 13V4M7 7l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 14.5v1A1.5 1.5 0 005 17h10a1.5 1.5 0 001.5-1.5v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Camera: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="5" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="10.5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 5l1-2h3l1 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5 3.5l.5 8M9 3.5l-.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Star: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
      <path d="M6.5 1l1.545 3.13L11.5 4.635l-2.5 2.435.59 3.43L6.5 8.885l-3.09 1.615L4 7.07 1.5 4.635l3.455-.505L6.5 1z" />
    </svg>
  ),
  MapPin: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.5 1C4.015 1 2 3.015 2 5.5c0 3.5 4.5 6.5 4.5 6.5s4.5-3 4.5-6.5C11 3.015 8.985 1 6.5 1z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  X: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

// ─── Service Card avec photo visible ─────────────────────────────────────────
function ServiceCard({ service, dm, onDelete }: { service: Service; dm: boolean; onDelete?: (id: number) => void }) {
  const navigate = useNavigate();
  const categoryName = service.categoryName ?? 'Service';
  const price = Number(service.price ?? 0);
  const rating = Number(service.averageRating ?? 0);

  const firstPhoto = service.photoUrls?.[0] ?? null;
  const photoUrl = getImageUrl(firstPhoto);

  return (
    <div
      onClick={() => navigate(`/services/${service.id}`)}
      className={`rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5 cursor-pointer ${dm ? 'border-gray-800 bg-gray-900 hover:border-red-700/50' : 'border-gray-100 bg-white hover:shadow-lg hover:shadow-red-50'
        }`}
      style={{ boxShadow: dm ? 'none' : '0 2px 12px rgba(0,0,0,0.04)' }}
    >

      {/* ── Photo ── */}
      <div className="relative">
        {photoUrl ? (
          <img src={photoUrl} alt={service.title} className="w-full h-40 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className={`w-full h-40 flex items-center justify-center ${dm ? 'bg-gray-800' : 'bg-red-50'}`}>
            <span className="text-4xl opacity-20">🛠️</span>
          </div>
        )}

        {/* ── Bouton supprimer visible sur la carte ── */}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(service.id); }}
            className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer border-none shadow-md"
          >
            Supprimer
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wide">{categoryName}</span>
          {rating > 0 && (
            <div className="flex items-center gap-1 text-amber-400">
              <Icons.Star />
              <span className={`text-xs font-semibold ${dm ? 'text-white' : 'text-gray-900'}`}>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <h3 className={`font-bold text-sm leading-snug mb-2 ${dm ? 'text-white' : 'text-gray-900'}`}>{service.title}</h3>
        {service.description && (
          <p className={`text-xs leading-relaxed mb-3 line-clamp-2 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
            {service.description}
          </p>
        )}
        <div className={`flex items-center justify-between pt-3 border-t ${dm ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-1 text-gray-400">
            <Icons.MapPin />
            <span className="text-xs">{service.city ?? 'N/A'}</span>
          </div>
          <span className="font-extrabold text-red-600 text-sm">{price.toLocaleString('fr-TN')} DT</span>
        </div>
      </div>
    </div>
  );
}

// ─── Modal modification profil ────────────────────────────────────────────────
function EditProfileModal({ profile, dm, onClose, onSave, onUserUpdate }: {
  profile: any;
  dm: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onUserUpdate?: (partial: { firstName?: string; lastName?: string; profilePhoto?: string }) => void;
}) {
  const [fullName, setFullName] = useState(
    profile?.fullName || (profile?.firstName ? `${profile.firstName} ${profile.lastName}` : '')
  );
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.profilePhoto ? getImageUrl(profile.profilePhoto) : null
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const inputCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-red-500 ${dm ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let profilePhoto = profile?.profilePhoto;
      if (avatarFile) {
        profilePhoto = await usersApi.uploadPhoto(avatarFile);
      }

      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      const updated = await usersApi.updateProfile({
        firstName,
        lastName,
        phone,
        city,
        bio,
        profilePhoto,
      });

      // Update storage and parent state
      authApi.updateStoredUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        profilePhoto: updated.profilePhoto,
      });

      // Propagate to Navbar and any other UserContext consumer
      onUserUpdate?.({
        firstName: updated.firstName,
        lastName: updated.lastName,
        profilePhoto: updated.profilePhoto,
      });

      onSave(updated);
      onClose();
    } catch {
      setError('Impossible de mettre à jour le profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-lg rounded-2xl border p-8 shadow-2xl ${dm ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
        }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-bold ${dm ? 'text-white' : 'text-gray-900'}`}>Modifier le profil</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 cursor-pointer bg-transparent border-none">
            <Icons.X />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Photo de profil ── */}
          <div className="flex flex-col items-center mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider mb-3 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
              Photo de profil
            </span>
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-red-700/30 flex items-center justify-center"
                style={{ background: avatarPreview ? 'transparent' : 'linear-gradient(135deg, #C0001B, #8B0013)' }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-extrabold">{fullName?.[0]?.toUpperCase() ?? '?'}</span>
                )}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all gap-1">
                <Icons.Camera />
                <span className="text-white text-[10px] font-bold">Changer</span>
              </div>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <p className={`text-xs mt-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>Cliquez sur la photo pour changer</p>
          </div>

          <label className="block">
            <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Nom complet</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Votre nom complet" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Téléphone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+216 XX XXX XXX" />
            </label>
            <label className="block">
              <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Ville</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} placeholder="Tunis, Sfax..." />
            </label>
          </div>

          <label className="block">
            <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Bio</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Présentez votre expérience et vos compétences..." />
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all cursor-pointer border-none">
              {loading ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Icons.Check />}
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" onClick={onClose}
              className={`px-5 py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer bg-transparent ${dm ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
                }`}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const { darkMode: dm } = useTheme();
  const { user, updateUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<any>(null);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [savedServices, setSavedServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newService, setNewService] = useState(initialServiceForm);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [publishLoading, setPublishLoading] = useState(false);
  const [serviceMessage, setServiceMessage] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileData, servicesData, savedData, categoriesData] = await Promise.all([
          usersApi.getMe(),
          servicesApi.getMyServices(),
          servicesApi.getSaved(),
          categoriesApi.getAll(),
        ]);

        setProfile(profileData);
        setMyServices(servicesData || []);
        setSavedServices(savedData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Failed to load profile data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const refreshServices = async () => {
    try {
      const data = await servicesApi.getMyServices();
      setMyServices(data || []);
    } catch (error) {
      console.error('Failed to refresh services', error);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceMessage(null);
    setServiceError(null);

    // Validation
    if (!newService.title || !newService.description || !newService.price) {
      setServiceError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!newService.category_id && !newCategoryName.trim()) {
      setServiceError('Veuillez sélectionner ou écrire une catégorie.');
      return;
    }

    setPublishLoading(true);
    try {
      // Créer nouvelle catégorie si écrite manuellement
      let categoryId = newService.category_id;
      if (!categoryId && newCategoryName.trim()) {
        try {
          const catRes = await categoriesApi.create({ name: newCategoryName.trim() });
          categoryId = String(catRes.id);
          setCategories((prev) => [...prev, catRes]);
          setNewCategoryName('');
        } catch {
          setServiceError('Impossible de créer la catégorie.');
          setPublishLoading(false);
          return;
        }
      }

      // Upload photos first to get their backend URLs
      const uploadedUrls: string[] = [];
      for (const photo of newService.photos) {
        try {
          const url = await usersApi.uploadPhoto(photo);
          uploadedUrls.push(url);
        } catch (uploadErr) {
          console.error("Failed to upload photo", uploadErr);
        }
      }

      const payload = {
        title: newService.title,
        description: newService.description,
        price: parseFloat(newService.price) || 0,
        priceType: 'FIXED' as const,
        city: newService.city,
        categoryId: parseInt(categoryId),
        isAvailable: true,
        photoUrls: uploadedUrls,
      };

      await servicesApi.create(payload);
      setServiceMessage('Service publié avec succès ! ✓');
      setNewService(initialServiceForm);
      setNewCategoryName('');
      await refreshServices();
      setTimeout(() => { setServiceMessage(null); setActiveTab('my-services'); }, 2000);
    } catch (err) {
      console.error('Service creation error:', err);
      setServiceError('Impossible de créer le service. Vérifiez les champs et réessayez.');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Supprimer ce service ?')) return;
    try {
      await servicesApi.delete(id);
      setMyServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert('Impossible de supprimer le service.');
    }
  };

  const handleBannerAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const photoUrl = await usersApi.uploadPhoto(file);
      const updated = await usersApi.updateProfile({ profilePhoto: photoUrl });
      setProfile(updated);
      // Sync to localStorage + propagate to Navbar via UserContext
      updateUser({ profilePhoto: photoUrl });
    } catch (err) {
      console.error("Failed to update profile photo", err);
      alert("Impossible de mettre à jour la photo de profil.");
    } finally {
      setLoading(false);
    }
  };

  // ── Gestion photos avec prévisualisation ──────────────────────
  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewService((p) => ({ ...p, photos: files, photoPreviews: previews }));
  };

  const removePhoto = (index: number) => {
    setNewService((p) => ({
      ...p,
      photos: p.photos.filter((_, i) => i !== index),
      photoPreviews: p.photoPreviews.filter((_, i) => i !== index),
    }));
  };

  const bg = dm ? 'bg-gray-950' : 'bg-gray-50';
  const card = dm ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';
  const text = dm ? 'text-white' : 'text-gray-900';
  const sub = dm ? 'text-gray-400' : 'text-gray-500';
  const inputCls = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-red-500 ${dm ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
    }`;

  const tabs: { id: Tab; label: string; Icon: () => React.ReactElement; count?: number }[] = [
    { id: 'profile', label: 'Mon profil', Icon: Icons.User },
    { id: 'my-services', label: 'Mes services', Icon: Icons.Briefcase, count: myServices.length },
    { id: 'saved', label: 'Enregistrés', Icon: Icons.Bookmark, count: savedServices.length },
    { id: 'publish', label: 'Publier un service', Icon: Icons.Plus },
  ];

  return (
    <div className={`${bg} min-h-screen transition-colors duration-300`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar />      {/* ── Modal modification profil ── */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          dm={dm}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => setProfile(updated)}
          onUserUpdate={updateUser}
        />
      )}

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #C0001B 0%, #8B0013 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-6xl mx-auto px-8 py-10 relative">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-3xl font-extrabold overflow-hidden border-2 border-white/30"
                style={{ fontFamily: "'Sora', sans-serif" }}>
                {profile?.profilePhoto
                  ? <img src={getImageUrl(profile.profilePhoto) || ''} alt="" className="w-full h-full object-cover" />
                  : (profile?.firstName?.[0] ?? user?.firstName?.[0] ?? '?')}
              </div>
              <button onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all cursor-pointer border-none bg-transparent">
                <Icons.Camera />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerAvatarChange} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
                {profile?.fullName || (profile?.firstName ? `${profile.firstName} ${profile.lastName}` : '') || 'Mon profil'}
              </h1>
              {/* Bio sous le nom */}
              {profile?.bio && (
                <p className="text-white/80 text-sm italic mt-1 mb-2 max-w-md leading-relaxed">
                  "{profile.bio}"
                </p>
              )}
              <p className="text-white/70 text-sm">
                {profile?.city ? `📍 ${profile.city}` : 'Membre ServFast'}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white/90 border border-white/20">
                  {profile?.role?.toUpperCase() ?? 'CLIENT'}
                </span>
                <span className="text-white/60 text-xs">{profile?.email}</span>
              </div>
            </div>

            {/* Bouton Modifier profil */}
            <div className="flex flex-col gap-3 items-end">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
              >
                <Icons.Edit />
                Modifier le profil
              </button>

              {/* Quick stats */}
              <div className="flex gap-4">
                {[
                  { n: myServices.length, label: 'Services publiés' },
                  { n: savedServices.length, label: 'Enregistrés' },
                ].map(({ n, label }) => (
                  <div key={label} className="text-center bg-white/10 rounded-2xl px-6 py-3 border border-white/20">
                    <div className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{n}</div>
                    <div className="text-xs text-white/70 mt-1 whitespace-nowrap">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* ── Tab Nav ── */}
        <div className={`flex gap-1 p-1 rounded-2xl mb-8 ${dm ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'}`}
          style={{ boxShadow: dm ? 'none' : '0 2px 12px rgba(0,0,0,0.05)' }}>
          {tabs.map(({ id, label, Icon, count }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === id
                ? 'bg-red-700 text-white shadow-sm'
                : dm ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}>
              <Icon />
              {label}
              {count !== undefined && count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${activeTab === id ? 'bg-white/25 text-white' : 'bg-red-700 text-white'
                  }`}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: Profile — affiche les infos + services publiés ── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Infos résumé */}
            <div className={`rounded-2xl border p-6 ${card}`} style={{ boxShadow: dm ? 'none' : '0 2px 12px rgba(0,0,0,0.04)' }}>
              <h2 className={`text-lg font-bold mb-4 ${text}`} style={{ fontFamily: "'Sora', sans-serif" }}>Informations du compte</h2>
              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: 'Nom complet', value: profile?.fullName || (profile?.firstName ? `${profile.firstName} ${profile.lastName}` : '') },
                  { label: 'Email', value: profile?.email },
                  { label: 'Ville', value: profile?.city },
                  { label: 'Téléphone', value: profile?.phone },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${sub}`}>{label}</div>
                    <div className={`text-sm font-semibold ${text}`}>{value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services publiés dans l'onglet profil */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${text}`} style={{ fontFamily: "'Sora', sans-serif" }}>
                  Mes services publiés
                </h2>
                <button onClick={() => navigate('/dashboard', { state: { openCreateForm: true } })}
                  className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer border-none"
                  style={{ boxShadow: '0 4px 14px rgba(192,0,27,0.25)' }}>
                  <Icons.Plus />
                  Publier un service
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
                </div>
              ) : myServices.length === 0 ? (
                <div className={`rounded-2xl border p-12 text-center ${card}`}>
                  <span className="text-4xl mb-3 block">🛠️</span>
                  <p className={`font-semibold mb-1 ${text}`}>Aucun service publié</p>
                  <p className={`text-sm ${sub}`}>Publiez votre premier service pour commencer</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-5">
                  {myServices.map((s) => (
                    <ServiceCard key={s.id} service={s} dm={dm} onDelete={handleDeleteService} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: My Services ── */}
        {activeTab === 'my-services' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold ${text}`} style={{ fontFamily: "'Sora', sans-serif" }}>Mes services publiés</h2>
                <p className={`text-sm mt-1 ${sub}`}>{myServices.length} service{myServices.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => navigate('/dashboard', { state: { openCreateForm: true } })}
                className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer border-none"
                style={{ boxShadow: '0 4px 14px rgba(192,0,27,0.25)' }}>
                <Icons.Plus />
                Publier un service
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
              </div>
            ) : myServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="text-5xl">🛠️</span>
                <p className={`text-lg font-semibold ${text}`}>Aucun service publié</p>
                <button onClick={() => navigate('/dashboard', { state: { openCreateForm: true } })}
                  className="mt-2 px-6 py-2.5 bg-red-700 text-white font-bold rounded-xl text-sm hover:bg-red-800 transition-all cursor-pointer border-none">
                  Publier un service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {myServices.map((s) => (
                  <ServiceCard key={s.id} service={s} dm={dm} onDelete={handleDeleteService} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Saved ── */}
        {activeTab === 'saved' && (
          <div>
            <div className="mb-6">
              <h2 className={`text-xl font-bold ${text}`} style={{ fontFamily: "'Sora', sans-serif" }}>Services enregistrés</h2>
              <p className={`text-sm mt-1 ${sub}`}>{savedServices.length} service{savedServices.length !== 1 ? 's' : ''} sauvegardé{savedServices.length !== 1 ? 's' : ''}</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
              </div>
            ) : savedServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="text-5xl">🔖</span>
                <p className={`text-lg font-semibold ${text}`}>Aucun service enregistré</p>
                <a href="/browse" className="mt-2 px-6 py-2.5 bg-red-700 text-white font-bold rounded-xl text-sm hover:bg-red-800 transition-all no-underline">
                  Explorer les services
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {savedServices.map((s) => (
                  <ServiceCard key={s.id} service={s} dm={dm} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Publish ── */}
        {activeTab === 'publish' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className={`text-xl font-bold ${text}`} style={{ fontFamily: "'Sora', sans-serif" }}>Publier un service</h2>
              <p className={`text-sm mt-1 ${sub}`}>Renseignez les informations de votre service.</p>
            </div>

            <div className={`rounded-2xl border p-8 ${card}`} style={{ boxShadow: dm ? 'none' : '0 2px 12px rgba(0,0,0,0.04)' }}>
              <form onSubmit={handleServiceSubmit} className="space-y-5">
                {serviceMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                    <Icons.Check />{serviceMessage}
                  </div>
                )}
                {serviceError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{serviceError}</div>
                )}

                <label className="block">
                  <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${sub}`}>Titre <span className="text-red-500">*</span></span>
                  <input value={newService.title}
                    onChange={(e) => setNewService((p) => ({ ...p, title: e.target.value }))}
                    className={inputCls} placeholder="Ex: Création de site web professionnel" />
                </label>

                <label className="block">
                  <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${sub}`}>Description <span className="text-red-500">*</span></span>
                  <textarea value={newService.description}
                    onChange={(e) => setNewService((p) => ({ ...p, description: e.target.value }))}
                    rows={5} className={`${inputCls} resize-none`}
                    placeholder="Décrivez votre service en détail..." />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${sub}`}>Prix (DT) <span className="text-red-500">*</span></span>
                    <div className="relative">
                      <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm ${sub}`}>DT</span>
                      <input type="number" min="0" value={newService.price}
                        onChange={(e) => setNewService((p) => ({ ...p, price: e.target.value }))}
                        className={`${inputCls} pl-8`} placeholder="0" />
                    </div>
                  </label>
                  <label className="block">
                    <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${sub}`}>Ville</span>
                    <input value={newService.city}
                      onChange={(e) => setNewService((p) => ({ ...p, city: e.target.value }))}
                      className={inputCls} placeholder="Tunis, Sfax..." />
                  </label>
                </div>

                {/* ── Catégorie : sélectionner OU écrire ── */}
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${sub}`}>
                    Catégorie <span className="text-red-500">*</span>
                  </span>

                  {/* Champ de saisie libre avec datalist pour suggestion */}
                  <div className="relative">
                    <input
                      list="categories-list"
                      value={newCategoryName || (categories.find(c => String(c.id) === newService.category_id)?.name ?? '')}
                      onChange={(e) => {
                        const typed = e.target.value;
                        // Chercher si ça correspond à une catégorie existante
                        const match = categories.find(
                          c => c.name.toLowerCase() === typed.toLowerCase()
                        );
                        if (match) {
                          setNewService((p) => ({ ...p, category_id: String(match.id) }));
                          setNewCategoryName('');
                        } else {
                          setNewCategoryName(typed);
                          setNewService((p) => ({ ...p, category_id: '' }));
                        }
                      }}
                      className={inputCls}
                      placeholder="Sélectionner ou écrire une catégorie..."
                    />
                    <datalist id="categories-list">
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name} />
                      ))}
                    </datalist>
                  </div>

                  {/* Indicateur : catégorie existante ou nouvelle */}
                  {newService.category_id && (
                    <p className="text-xs text-emerald-600 mt-1 font-medium">
                      ✓ Catégorie existante sélectionnée
                    </p>
                  )}
                  {newCategoryName && !newService.category_id && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      + Nouvelle catégorie sera créée : "{newCategoryName}"
                    </p>
                  )}
                </div>

                {/* ── Photos avec prévisualisation ── */}
                <label className="block">
                  <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${sub}`}>Photos du service</span>

                  {/* Zone upload */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dm ? 'border-gray-700 hover:border-red-700/50 bg-gray-800/50'
                      : 'border-gray-200 hover:border-red-400 bg-gray-50'
                      }`}
                    onClick={() => document.getElementById('service-photos')?.click()}>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dm ? 'bg-gray-700' : 'bg-red-50'}`}>
                        <span className="text-red-600"><Icons.Upload /></span>
                      </div>
                      <p className={`text-sm font-semibold ${text}`}>
                        {newService.photos.length > 0
                          ? 'Cliquez pour ajouter d\'autres photos'
                          : 'Cliquez pour ajouter des photos'}
                      </p>
                      <p className={`text-xs ${sub}`}>PNG, JPG, WEBP — max 5 Mo par fichier</p>
                    </div>
                    <input id="service-photos" type="file" accept="image/*" multiple className="hidden"
                      onChange={handlePhotosChange} />
                  </div>

                  {/* ── Prévisualisation des photos ── */}
                  {newService.photoPreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {newService.photoPreviews.map((preview, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={preview}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-24 object-cover rounded-xl border border-gray-200"
                          />
                          {/* Bouton supprimer photo */}
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none"
                          >
                            <Icons.X />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-md">
                              Principal
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </label>

                <div className="flex items-center gap-4 pt-2">
                  <button type="submit" disabled={publishLoading}
                    className="flex items-center gap-2 px-7 py-3 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all cursor-pointer border-none"
                    style={{ boxShadow: '0 4px 14px rgba(192,0,27,0.3)' }}>
                    {publishLoading
                      ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      : <Icons.Plus />}
                    {publishLoading ? 'Publication...' : 'Publier le service'}
                  </button>
                  <button type="button" onClick={() => setNewService(initialServiceForm)}
                    className={`px-5 py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer bg-transparent ${dm ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
                      }`}>
                    Réinitialiser
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}