import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/common/Navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import { useTheme } from "../context/ThemeContext";
import { servicesApi, Service } from "../api/services";

const STORAGE_URL = 'http://localhost:8081';

function getImageUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http') || photoUrl.startsWith('data:')) return photoUrl;
  const normalizedPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
  return `${STORAGE_URL}${normalizedPath}`;
}

export default function ExpertsPage() {
  const navigate = useNavigate();
  const { darkMode: dm } = useTheme();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExperts = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await servicesApi.search();
        setServices(result || []);
      } catch {
        setError("Unable to load experts right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadExperts();
  }, []);

  const expertsByProvider = useMemo(() => {
    const map = new Map<number, { providerId: number; name: string; city?: string; photo?: string; serviceCount: number; topService?: Service }>();

    services.forEach((service) => {
      const provider = service.provider;
      if (!provider) return;

      const current = map.get(provider.id) ?? {
        providerId: provider.id,
        name: provider.fullName,
        city: provider.city,
        photo: provider.profilePhoto,
        photoUrl: getImageUrl(provider.profilePhoto),
        serviceCount: 0,
        topService: service,
      };
      current.serviceCount += 1;
      if ((service.averageRating ?? 0) > (current.topService?.averageRating ?? 0)) {
        current.topService = service;
      }
      map.set(provider.id, current);
    });

    return Array.from(map.values()).sort((a, b) => b.serviceCount - a.serviceCount);
  }, [services]);

  const bg = dm ? "bg-gray-950" : "bg-white";
  const text = dm ? "text-white" : "text-gray-900";
  const subtext = dm ? "text-gray-400" : "text-gray-500";
  const cardBg = dm ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">Experts</p>
          <h1 className={`mt-3 text-4xl sm:text-5xl font-extrabold ${text}`}>Discover verified professionals</h1>
          <p className={`mt-4 max-w-2xl mx-auto text-sm sm:text-base ${subtext}`}>
            Browse service providers with real business expertise, backed by ratings and live offers.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading experts…</div>
        ) : error ? (
          <div className="py-20 text-center text-red-600">{error}</div>
        ) : expertsByProvider.length === 0 ? (
          <div className="py-20 text-center text-gray-500">No experts available yet.</div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {expertsByProvider.map((expert) => (
              <div
                key={expert.providerId}
                onClick={() => navigate(`/profile/${expert.providerId}`)}
                className={`border rounded-3xl overflow-hidden ${cardBg} shadow-sm cursor-pointer hover:shadow-lg transition-shadow`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-red-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {(expert as any).photoUrl ? (
                        <img
                          src={(expert as any).photoUrl}
                          alt={expert.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        expert.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                      )}
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${text}`}>{expert.name}</h2>
                      <p className={`text-sm ${subtext}`}>{expert.city ?? "Remote"}</p>
                    </div>
                  </div>

                  <p className={`text-sm ${subtext} mb-5`}>
                    Offers {expert.serviceCount} service{expert.serviceCount === 1 ? "" : "s"} on ServFast.
                  </p>

                  {expert.topService && (
                    <div className="rounded-3xl overflow-hidden border border-gray-200 bg-gray-50 dark:bg-gray-950 dark:border-gray-800">
                      <img
                        src={
                          getImageUrl(expert.topService.photoUrls?.[0] ?? expert.topService.imageUrl ?? null) ??
                          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&q=80"
                        }
                        alt={expert.topService.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-red-600 font-semibold mb-2">Top offer</div>
                        <h3 className={`text-lg font-semibold ${text}`}>{expert.topService.title}</h3>
                        <p className={`mt-2 text-sm ${subtext} line-clamp-2`}>{expert.topService.description}</p>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                          <span>${expert.topService.price.toLocaleString()}</span>
                          <button
                            onClick={() => navigate(`/services/${expert.topService?.id}`)}
                            className="rounded-full bg-red-700 px-4 py-2 text-white text-sm font-semibold hover:bg-red-800 transition-colors"
                          >
                            View offer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
