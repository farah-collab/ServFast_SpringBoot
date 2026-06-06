import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import HeroSection from "../components/home/HeroSection";
import CategoryGrid from "../components/home/CategoryGrid";
import HowItWorks from "../components/home/HowItWorks";
import TestimonialBanner from "../components/home/TestimonialBanner";
import { servicesApi, Service } from "../api/services";
import { useTheme } from "../context/ThemeContext";

// ── URL de base du stockage Spring Boot ──
const STORAGE_URL = 'http://localhost:8081';

function getImageUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http') || photoUrl.startsWith('data:')) return photoUrl;
  const normalizedPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
  return `${STORAGE_URL}${normalizedPath}`;
}

function FeaturedServiceCard({ service, onClick, dm }: { service: Service; onClick: () => void; dm: boolean }) {
  const firstPhoto = service.photoUrls?.[0] ?? service.imageUrl ?? null;
  const photo = getImageUrl(firstPhoto);
  const category = service.categoryName ?? 'Service';
  const price = Number(service.price ?? 0);
  const rating = Number(service.averageRating ?? 0);
  
  const provider = service.provider ?? (service as any).user;
  const providerName = provider?.fullName ?? provider?.full_name ?? (provider?.firstName ? `${provider.firstName} ${provider.lastName}` : '');
  const providerPhoto = provider?.profilePhoto ?? provider?.avatar_url ?? null;

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer w-full p-0 block ${
        dm ? 'border-gray-800 bg-gray-900 hover:border-red-700/50' : 'border-gray-100 bg-white hover:shadow-red-50'
      }`}
      style={{ boxShadow: dm ? 'none' : '0 2px 12px rgba(0,0,0,0.04)' }}
    >
      {/* Photo */}
      <div className="relative">
        {photo ? (
          <img src={photo} alt={service.title} className="w-full h-44 object-cover" />
        ) : (
          <div className={`w-full h-44 flex items-center justify-center ${dm ? 'bg-gray-800' : 'bg-red-50'}`}>
            <span className="text-5xl opacity-20">🛠️</span>
          </div>
        )}
        <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full bg-red-700 text-white uppercase tracking-wide">
          {category}
        </span>
      </div>
      {/* Contenu */}
      <div className="p-4">
        <h3 className={`font-bold text-sm leading-snug mb-2 line-clamp-2 ${dm ? 'text-white' : 'text-gray-900'}`}>{service.title}</h3>

        {/* Provider */}
        {provider && (
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full overflow-hidden bg-red-100 flex items-center justify-center text-xs font-bold text-red-700 flex-shrink-0`}>
              {providerPhoto
                ? <img src={getImageUrl(providerPhoto) || ''} alt={providerName} className="w-full h-full object-cover" />
                : (providerName?.[0]?.toUpperCase() ?? '?')}
            </div>
            <span className={`text-xs truncate ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{providerName}</span>
          </div>
        )}
        <div className={`flex items-center justify-between pt-3 border-t ${dm ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-1">
            {rating > 0 && (
              <>
                <span className="text-amber-400 text-xs">★</span>
                <span className={`text-xs font-semibold ${dm ? 'text-gray-300' : 'text-gray-700'}`}>{rating.toFixed(1)}</span>
              </>
            )}
          </div>
          <span className="font-extrabold text-red-600 text-sm">{price.toLocaleString('fr-TN')} DT</span>
        </div>
      </div>
    </button>
  );
}

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const navigate = useNavigate();
  const { darkMode: dm } = useTheme();

  useEffect(() => {
    servicesApi.search()
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setFeaturedServices(arr.slice(0, 6)); // 6 premiers
      })
      .catch(() => setFeaturedServices([]))
      .finally(() => setLoadingServices(false));
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className={`w-full min-h-screen transition-colors duration-300 ${dm ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />
      <HeroSection />
      <CategoryGrid />

      {/* ── Featured Services ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-8 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-2">À la une</p>
            <h2 className={`text-3xl font-extrabold ${dm ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
              Services populaires
            </h2>
          </div>
          <button
            onClick={() => navigate('/services')}
            className="flex items-center gap-2 text-sm font-bold text-red-700 hover:text-red-800 border border-red-200 hover:border-red-400 px-4 py-2 rounded-xl transition-all cursor-pointer bg-transparent"
          >
            Voir tous les services →
          </button>
        </div>

        {loadingServices ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          </div>
        ) : featuredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">🛠️</span>
            <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Aucun service disponible pour le moment</p>
            <button onClick={() => navigate('/services')}
              className="px-5 py-2 bg-red-700 text-white font-bold rounded-xl text-sm hover:bg-red-800 border-none cursor-pointer">
              Explorer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((s) => (
              <FeaturedServiceCard
                key={s.id}
                service={s}
                dm={dm}
                onClick={() => navigate(`/services/${s.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <HowItWorks />
      <TestimonialBanner />
      <Footer />
    </div>
  );
}