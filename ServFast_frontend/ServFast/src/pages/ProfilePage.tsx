import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { authApi } from '../api/auth';
import { usersApi, UserProfile } from '../api/users';
import { ordersApi, Order } from '../api/orders';
import { ratingsApi, Rating } from '../api/ratings';
import { servicesApi, Service } from '../api/services';
import { useTheme } from '../context/ThemeContext';

type Tab = 'info' | 'orders' | 'ratings' | 'services';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const { darkMode: dm } = useTheme();
  const currentUser = authApi.getCurrentUser();
  const isOwnProfile = !userId || String(currentUser?.id) === String(userId);
  const isProvider = currentUser?.role === 'PROVIDER';

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', bio: '', city: '', profilePhoto: '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Service form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: '', description: '', price: '', priceType: 'FIXED', city: '', categoryId: '', isAvailable: true, imageUrl: ''
  });

  useEffect(() => {
    if (!currentUser && !userId) {
      navigate('/login');
      return;
    }
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const profileData = userId ? await usersApi.getById(Number(userId)) : await usersApi.getMe();
      setProfile(profileData);
      setForm({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        city: profileData.city || '',
        profilePhoto: profileData.profilePhoto || '',
      });

      const profileServices = await servicesApi.getByUser(Number(profileData.id));
      setServices(profileServices);

      if (!userId) {
        if (isProvider) {
          const [myOrders] = await Promise.all([ordersApi.getReceivedOrders()]);
          setOrders(myOrders);
        } else {
          const [myOrders, myRatings] = await Promise.all([ordersApi.getMyOrders(), ratingsApi.getMyRatings()]);
          setOrders(myOrders);
          setRatings(myRatings);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true); setMsg('');
    try {
      const updated = await usersApi.updateProfile(form);
      setProfile(updated);
      authApi.updateStoredUser({ firstName: updated.firstName, lastName: updated.lastName });
      setEditing(false);
      setMsg('Profile updated successfully!');
    } catch { setMsg('Error updating profile'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (pwForm.newPw !== pwForm.confirm) { setMsg('Passwords do not match'); return; }
    setSaving(true); setMsg('');
    try {
      await usersApi.changePassword(pwForm.current, pwForm.newPw);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setMsg('Password changed successfully!');
    } catch { setMsg('Error changing password'); }
    finally { setSaving(false); }
  };

  const handleOrderStatus = async (orderId: number, status: string) => {
    try {
      const updated = await ordersApi.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (e) { console.error(e); }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Delete this service?')) return;
    try {
      await servicesApi.delete(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleServiceSubmit = async () => {
    if (!serviceForm.title || !serviceForm.categoryId) { setMsg('Title and category are required'); return; }
    setSaving(true); setMsg('');
    try {
      const payload = {
        title: serviceForm.title,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price) || 0,
        priceType: serviceForm.priceType as 'FIXED' | 'HOURLY' | 'QUOTE',
        city: serviceForm.city,
        categoryId: parseInt(serviceForm.categoryId),
        isAvailable: serviceForm.isAvailable,
        imageUrl: serviceForm.imageUrl,
      };
      if (editingService) {
        const updated = await servicesApi.update(editingService.id, payload);
        setServices(prev => prev.map(s => s.id === editingService.id ? updated : s));
      } else {
        const created = await servicesApi.create(payload);
        setServices(prev => [created, ...prev]);
      }
      setShowServiceForm(false);
      setEditingService(null);
      setServiceForm({ title: '', description: '', price: '', priceType: 'FIXED', city: '', categoryId: '', isAvailable: true, imageUrl: '' });
    } catch { setMsg('Error saving service'); }
    finally { setSaving(false); }
  };

  const openEditService = (s: Service) => {
    setEditingService(s);
    setServiceForm({
      title: s.title, description: s.description || '', price: String(s.price || ''),
      priceType: s.priceType || 'FIXED', city: s.city || '',
      categoryId: String(s.categoryId || ''), isAvailable: s.isAvailable, imageUrl: s.imageUrl || ''
    });
    setShowServiceForm(true);
  };

  const bg = dm ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const card = dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const input = dm ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900';
  const tabActive = dm ? 'bg-red-700 text-white' : 'bg-red-700 text-white';
  const tabInactive = dm ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200';

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: '👤 Profile' },
    { key: 'orders', label: isProvider ? '📦 Received Orders' : '📦 My Orders' },
    ...(isProvider ? [{ key: 'services' as Tab, label: '🛠️ My Services' }] : [{ key: 'ratings' as Tab, label: '⭐ My Reviews' }]),
  ];

  if (loading) return (
    <div className={`min-h-screen ${bg} flex items-center justify-center`}>
      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${bg}`}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header - Instagram Style */}
        <div className={`mb-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12`}>
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-1">
              <div className="w-full h-full rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center text-4xl font-bold text-gray-300">
                {profile?.profilePhoto
                  ? <img src={profile.profilePhoto} alt="avatar" className="w-full h-full object-cover" />
                  : `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`}
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-2xl font-light text-gray-900">{profile?.firstName} {profile?.lastName}</h1>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setEditing(!editing)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition border-none cursor-pointer ${
                    dm ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}>
                  {editing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>
            </div>

            <div className="flex justify-center md:justify-start gap-8 mb-4">
              {isProvider ? (
                <>
                  <div><span className="font-bold text-gray-900">{services.length}</span> services</div>
                  <div><span className="font-bold text-gray-900">{orders.length}</span> orders</div>
                </>
              ) : (
                <>
                  <div><span className="font-bold text-gray-900">{orders.length}</span> orders</div>
                  <div><span className="font-bold text-gray-900">{ratings.length}</span> reviews</div>
                </>
              )}
            </div>

            <div className="text-sm">
              <p className="font-semibold text-gray-900">{profile?.role}</p>
              <p className={`mt-1 whitespace-pre-wrap ${dm ? 'text-gray-300' : 'text-gray-700'}`}>
                {profile?.bio || 'No bio provided yet.'}
              </p>
              <div className={`mt-3 flex flex-col md:flex-row gap-x-4 gap-y-1 text-xs ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                {profile?.city && <span>📍 {profile.city}</span>}
                {profile?.email && <span>✉️ {profile.email}</span>}
                {profile?.phone && <span>📞 {profile.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Instagram style (border top) */}
        <div className={`flex justify-center border-t ${dm ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setEditing(false); }}
              className={`px-8 py-4 text-xs font-bold uppercase tracking-wider transition-all border-none cursor-pointer bg-transparent ${
                activeTab === t.key
                  ? `border-t border-t-black ${dm ? 'text-white border-t-white' : 'text-gray-900 border-t-gray-900'}`
                  : `${dm ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-900'}`
              }`}
              style={activeTab === t.key ? { marginTop: '-1px' } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {msg}
          </div>
        )}

        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className={`rounded-2xl border p-6 ${card}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Personal Information</h2>
              <button onClick={() => setEditing(!editing)}
                className="px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-semibold hover:bg-red-800 transition border-none cursor-pointer">
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing && (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <input value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))}
                        className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <input value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))}
                        className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} rows={3}
                      className={`w-full border rounded-lg px-3 py-2 text-sm resize-none ${input}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Profile Photo</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        {form.profilePhoto && <img src={form.profilePhoto} alt="preview" className="w-10 h-10 rounded-full object-cover" />}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setForm(f => ({ ...f, profilePhoto: reader.result as string }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className={`flex-1 border rounded-lg px-3 py-2 text-sm ${input} file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer`} 
                        />
                      </div>
                    </div>
                  </div>
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="w-full py-2 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 transition border-none cursor-pointer disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
                {/* Password change */}
                <div className={`mt-8 pt-6 border-t ${dm ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className="text-base font-bold mb-4">Change Password</h3>
                  <div className="space-y-3">
                    <input type="password" placeholder="Current password" value={pwForm.current}
                      onChange={e => setPwForm(f => ({...f, current: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                    <input type="password" placeholder="New password" value={pwForm.newPw}
                      onChange={e => setPwForm(f => ({...f, newPw: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                    <input type="password" placeholder="Confirm new password" value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                    <button onClick={handleChangePassword} disabled={saving}
                      className="px-6 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 transition border-none cursor-pointer disabled:opacity-60">
                      {saving ? 'Saving...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </>
            )}
            {!editing && (
              <div className="space-y-3">
                {[
                  { label: 'Email', value: profile?.email },
                  { label: 'Phone', value: profile?.phone || '—' },
                  { label: 'City', value: profile?.city || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className={`flex justify-between py-2 border-b ${dm ? 'border-gray-700' : 'border-gray-100'}`}>
                    <span className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className={`rounded-2xl border p-12 text-center ${card}`}>
                <p className={dm ? 'text-gray-400' : 'text-gray-500'}>No orders yet.</p>
              </div>
            ) : orders.map(o => (
              <div key={o.id} className={`rounded-2xl border p-5 ${card}`}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-base">{o.serviceTitle}</h3>
                    <p className={`text-sm mt-1 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                      {isProvider ? `From: ${o.clientName}` : `Provider: ${o.providerName}`}
                    </p>
                    {o.note && <p className={`text-sm mt-1 italic ${dm ? 'text-gray-400' : 'text-gray-500'}`}>"{o.note}"</p>}
                    <p className={`text-xs mt-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[o.status]}`}>{o.status}</span>
                    <span className="text-base font-bold text-red-700">${o.servicePrice}</span>
                    {isProvider && o.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleOrderStatus(o.id, 'ACCEPTED')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 border-none cursor-pointer">Accept</button>
                        <button onClick={() => handleOrderStatus(o.id, 'REJECTED')}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 border-none cursor-pointer">Reject</button>
                      </div>
                    )}
                    {isProvider && o.status === 'ACCEPTED' && (
                      <button onClick={() => handleOrderStatus(o.id, 'COMPLETED')}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 border-none cursor-pointer">Mark Completed</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RATINGS TAB (client only) */}
        {activeTab === 'ratings' && (
          <div className="space-y-4">
            {ratings.length === 0 ? (
              <div className={`rounded-2xl border p-12 text-center ${card}`}>
                <p className={dm ? 'text-gray-400' : 'text-gray-500'}>No reviews yet.</p>
              </div>
            ) : ratings.map(r => (
              <div key={r.id} className={`rounded-2xl border p-5 ${card}`}>
                <div className="flex justify-between">
                  <div>
                    <div className="flex gap-1 mb-2">
                      {Array.from({length: 5}).map((_, i) => (
                        <span key={i} className={i < r.score ? 'text-yellow-400' : dm ? 'text-gray-600' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                    <p className="text-sm">{r.comment || 'No comment'}</p>
                    <p className={`text-xs mt-2 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={async () => { await ratingsApi.delete(r.id); setRatings(prev => prev.filter(x => x.id !== r.id)); }}
                    className="text-red-600 hover:text-red-800 text-sm border-none bg-transparent cursor-pointer">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SERVICES TAB (provider only) */}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">My Services ({services.length})</h2>
              <button onClick={() => { setEditingService(null); setServiceForm({ title: '', description: '', price: '', priceType: 'FIXED', city: '', categoryId: '', isAvailable: true, imageUrl: '' }); setShowServiceForm(true); }}
                className="px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-semibold hover:bg-red-800 transition border-none cursor-pointer">
                + New Service
              </button>
            </div>

            {/* Service Form */}
            {showServiceForm && (
              <div className={`rounded-2xl border p-6 mb-6 ${card}`}>
                <h3 className="font-bold mb-4">{editingService ? 'Edit Service' : 'Post a Service'}</h3>
                <div className="space-y-3">
                  <input placeholder="Title *" value={serviceForm.title} onChange={e => setServiceForm(f => ({...f, title: e.target.value}))}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                  <textarea placeholder="Description" value={serviceForm.description} onChange={e => setServiceForm(f => ({...f, description: e.target.value}))} rows={3}
                    className={`w-full border rounded-lg px-3 py-2 text-sm resize-none ${input}`} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Price" value={serviceForm.price} onChange={e => setServiceForm(f => ({...f, price: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                    <select value={serviceForm.priceType} onChange={e => setServiceForm(f => ({...f, priceType: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`}>
                      <option value="FIXED">Fixed Price</option>
                      <option value="HOURLY">Hourly</option>
                      <option value="QUOTE">Quote</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="City" value={serviceForm.city} onChange={e => setServiceForm(f => ({...f, city: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                    <input type="number" placeholder="Category ID *" value={serviceForm.categoryId} onChange={e => setServiceForm(f => ({...f, categoryId: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                  </div>
                  <input placeholder="Image URL" value={serviceForm.imageUrl} onChange={e => setServiceForm(f => ({...f, imageUrl: e.target.value}))}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`} />
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="avail" checked={serviceForm.isAvailable} onChange={e => setServiceForm(f => ({...f, isAvailable: e.target.checked}))} />
                    <label htmlFor="avail" className="text-sm">Available</label>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleServiceSubmit} disabled={saving}
                      className="flex-1 py-2 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 transition border-none cursor-pointer disabled:opacity-60">
                      {saving ? 'Saving...' : editingService ? 'Update Service' : 'Post Service'}
                    </button>
                    <button onClick={() => setShowServiceForm(false)}
                      className={`px-6 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer ${dm ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {services.length === 0 ? (
                <div className={`rounded-2xl border p-12 text-center ${card}`}>
                  <p className={dm ? 'text-gray-400' : 'text-gray-500'}>No services yet. Post your first service!</p>
                </div>
              ) : services.map(s => (
                <div key={s.id} className={`rounded-2xl border p-5 flex justify-between items-center gap-4 ${card}`}>
                  <div>
                    <h3 className="font-bold">{s.title}</h3>
                    <p className={`text-sm mt-1 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{s.city || 'Remote'} · ${s.price}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {s.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      {s.categoryName && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">{s.categoryName}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/services/${s.id}`)}
                      className={`px-3 py-1.5 text-xs rounded-lg border-none cursor-pointer font-medium ${dm ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>View</button>
                    <button onClick={() => openEditService(s)}
                      className="px-3 py-1.5 text-xs rounded-lg border-none cursor-pointer font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">Edit</button>
                    <button onClick={() => handleDeleteService(s.id)}
                      className="px-3 py-1.5 text-xs rounded-lg border-none cursor-pointer font-medium bg-red-100 text-red-700 hover:bg-red-200">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}