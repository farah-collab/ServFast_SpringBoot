import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ratingsApi, Rating } from "../../api/ratings";

const STORAGE_URL = 'http://localhost:8081';
function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${STORAGE_URL}${normalized}`;
}

export default function TestimonialBanner() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Rating[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ratingsApi.getRecent();
        // Filter to only ratings with comments
        const withComments = data.filter((r) => r.comment && r.comment.trim().length > 0);
        setTestimonials(withComments.slice(0, 10));
      } catch (err) {
        console.error("Failed to load testimonials", err);
      }
    };
    load();
  }, []);

  // Auto-cycle testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const currentTestimonial = testimonials[currentIdx];

  const getInitial = (name?: string) => (name ? name.charAt(0).toUpperCase() : "?");

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < score ? "text-amber-400" : "text-gray-600"}>
        ★
      </span>
    ));
  };

  return (
    <>
      {/* Testimonial quote */}
      <section className="bg-gray-900 text-white px-16 py-18 grid grid-cols-2 gap-18 items-center">
        <div>
          <div className="text-xs text-red-500 font-bold tracking-widest uppercase mb-4">
            Témoignages
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight mb-8">
            Ce que disent nos clients
          </h2>
          <button
            onClick={() => navigate("/experts")}
            className="bg-red-700 hover:bg-red-600 text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors border-none cursor-pointer"
          >
            Trouver votre expert →
          </button>
        </div>

        <div className="bg-white/5 rounded-2xl p-8 border-l-4 border-red-700 min-h-[200px]">
          {currentTestimonial ? (
            <>
              <div className="flex mb-3 text-sm">{renderStars(currentTestimonial.score)}</div>
              <p className="text-gray-300 text-sm leading-loose italic mb-6">
                "{currentTestimonial.comment}"
              </p>
              <div className="flex items-center gap-3">
                  {currentTestimonial.userPhoto ? (
                  <img
                    src={getImageUrl(currentTestimonial.userPhoto) ?? currentTestimonial.userPhoto}
                    alt={currentTestimonial.userName}
                    className="w-11 h-11 rounded-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-red-700 flex items-center justify-center font-extrabold text-base shrink-0">
                    {getInitial(currentTestimonial.userName)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-sm">{currentTestimonial.userName}</div>
                  <div className="text-xs text-gray-400">Client vérifié</div>
                </div>
              </div>

              {/* Dots indicator */}
              {testimonials.length > 1 && (
                <div className="flex gap-1.5 mt-4">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIdx(i)}
                      className={`w-2 h-2 rounded-full border-none cursor-pointer transition-all ${
                        i === currentIdx ? "bg-red-700 w-4" : "bg-gray-600"
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-sm leading-loose italic">
              "ServFast a complètement transformé notre façon de trouver des talents.
              Le processus est rigoureux et la rapidité est incomparable.
              C'est notre plateforme de référence."
            </p>
          )}
        </div>
      </section>

      {/* Stats row */}
      <section className="bg-gray-900 text-white px-16 py-14 border-t border-white/5">
        <div className="grid grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-extrabold mb-2">
              {testimonials.length > 0 ? `${testimonials.length}+` : "—"}
            </div>
            <div className="text-xs text-gray-400 leading-relaxed">Avis récents avec commentaires</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold mb-2">
              {testimonials.length > 0
                ? (testimonials.reduce((sum, t) => sum + t.score, 0) / testimonials.length).toFixed(1)
                : "—"}
            </div>
            <div className="text-xs text-gray-400 leading-relaxed">Note moyenne des clients</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold mb-2">98%</div>
            <div className="text-xs text-gray-400 leading-relaxed">Taux de satisfaction client</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold mb-2">24/7</div>
            <div className="text-xs text-gray-400 leading-relaxed">Support et disponibilité</div>
          </div>
        </div>
      </section>
    </>
  );
}