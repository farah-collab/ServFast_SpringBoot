import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi, UserProfile } from "../../api/users";

export default function FeaturedProfessionals() {
  const navigate = useNavigate();
  const [experts, setExperts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Try featured first, fallback to all experts
        let data: UserProfile[] = [];
        try {
          data = await usersApi.getFeatured(4);
        } catch {
          const all = await usersApi.getExperts({ page: 0, size: 4 });
          data = Array.isArray(all) ? all.slice(0, 4) : [];
        }
        setExperts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load featured experts", err);
        setExperts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getInitials = (user: UserProfile) => {
    const first = user.firstName?.charAt(0) || "";
    const last = user.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  // Don't render the section at all if no experts and not loading
  if (!loading && experts.length === 0) return null;

  return (
    <section className="px-16 pb-12 pt-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Professionals</h2>
        <button
          onClick={() => navigate("/browse")}
          className="text-sm font-semibold text-red-700 no-underline hover:opacity-75 bg-transparent border-none cursor-pointer"
        >
          View All →
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden animate-pulse bg-gray-50">
                <div className="w-full h-40 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="w-20 h-3 bg-gray-200 rounded" />
                  <div className="w-full h-4 bg-gray-200 rounded" />
                  <div className="w-16 h-3 bg-gray-200 rounded" />
                </div>
              </div>
            ))
          : experts.map(expert => (
              <button
                key={expert.id}
                onClick={() => navigate(`/browse`)}
                className="border border-gray-100 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-red-100 hover:-translate-y-1 bg-white text-left p-0"
              >
                <div className="relative">
                  {expert.profilePhoto ? (
                    <img
                      src={expert.profilePhoto}
                      alt={expert.fullName}
                      className="w-full h-40 object-cover"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">{getInitials(expert)}</span>
                    </div>
                  )}
                  {expert.verified && (
                    <span className="absolute top-2.5 left-2.5 bg-red-700 text-white text-xs font-bold px-2 py-0.5 rounded">
                      VERIFIED
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs text-gray-400 mb-1">{expert.fullName}</div>
                  <div className="font-bold text-sm text-gray-900 leading-snug mb-2 min-h-[2.5rem]">
                    {expert.specialty || "Expert Professionnel"}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-sm font-bold">
                      {expert.experienceYears || 0} ans d'exp.
                    </span>
                  </div>
                  {expert.city && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <span className="text-xs text-gray-400">📍 {expert.city}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
      </div>
    </section>
  );
}