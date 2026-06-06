import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import { servicesApi, Service } from "../api/services";
import { ordersApi } from "../api/orders";
import { ratingsApi, Rating } from "../api/ratings";
import { authApi } from "../api/auth";
import { useTheme } from "../context/ThemeContext";

const STORAGE_URL = 'http://localhost:8081';
function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${STORAGE_URL}${normalized}`;
}

const placeholderImage =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80";

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = authApi.getCurrentUser();
  const { darkMode: dm } = useTheme();

  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  // Booking state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Save state
  const [saved, setSaved] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);

  // Review state — score initialisé à 5 par défaut
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // ─── images ───────────────────────────────────────────────────────────────
  let images = [placeholderImage];
  if (service?.photoUrls?.length) {
    images = service.photoUrls.map(u => getImageUrl(u) ?? u);
  } else if (service?.imageUrl) {
    images = [getImageUrl(service.imageUrl) ?? service.imageUrl];
  }

  // ─── stats dérivées du service (recalculées à chaque reload) ──────────────
  const averageRating = service?.averageRating ?? 0;
  const totalRatings = service?.totalRatings ?? 0;

  // ─── Chargement initial ───────────────────────────────────────────────────
  useEffect(() => {
    const loadService = async () => {
      if (!id) {
        setError("Service introuvable.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [data, reviewsData] = await Promise.all([
          servicesApi.getById(Number(id)),
          ratingsApi.getByService(Number(id)),
        ]);
        setService(data);
        setReviews(reviewsData);
      } catch {
        setError(
          "Impossible de charger les détails du service. Veuillez réessayer."
        );
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [id]);

  // ─── Check saved status ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !id) return;
    servicesApi.isSaved(Number(id)).then(setSaved).catch(() => {});
  }, [id, user]);

  // ─── Rechargement des données après un rating ─────────────────────────────
  const reloadServiceAndReviews = async () => {
    if (!id) return;
    try {
      const [data, reviewsData] = await Promise.all([
        servicesApi.getById(Number(id)),
        ratingsApi.getByService(Number(id)),
      ]);
      setService(data);      // averageRating + totalRatings mis à jour ici
      setReviews(reviewsData);
    } catch {
      // silencieux : les données actuelles restent affichées
    }
  };

  // ─── Réserver le service ──────────────────────────────────────────────────
  const handleBookService = async () => {
    if (!user) { navigate("/login"); return; }
    if (!service) return;
    try {
      setBookingLoading(true);
      await ordersApi.create(service.id, "Réservation depuis la page détail");
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch {
      alert("Échec de la réservation. Veuillez réessayer.");
    } finally {
      setBookingLoading(false);
    }
  };

  // ─── Enregistrer / désinscrire le service ────────────────────────────────
  const handleSaveToggle = async () => {
    if (!user) { navigate("/login"); return; }
    if (!service) return;
    setSavedLoading(true);
    try {
      if (saved) {
        await servicesApi.unsave(service.id);
        setSaved(false);
      } else {
        await servicesApi.save(service.id);
        setSaved(true);
      }
    } catch {
      alert("Impossible de modifier l'enregistrement. Réessayez.");
    } finally {
      setSavedLoading(false);
    }
  };

  // ─── Contacter le prestataire ─────────────────────────────────────────────
  const handleContactProvider = () => {
    if (!user) { navigate("/login"); return; }
    if (service?.provider?.id) {
      navigate(`/messages/${service.provider.id}`, {
        state: {
          providerName: service.provider.fullName,
          providerPhoto: service.provider.profilePhoto,
          serviceTitle: service.title,
        },
      });
    }
  };

  // ─── Soumettre un avis ────────────────────────────────────────────────────
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!service) return;

    setReviewError(null);
    try {
      setReviewLoading(true);
      // Appel Spring Boot : POST /api/ratings  { serviceId, score, comment }
      await ratingsApi.submit(service.id, reviewScore, reviewComment);

      // Reset du formulaire
      setReviewComment("");
      setReviewScore(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);

      // Rechargement des données → les statistiques se recalculent automatiquement
      await reloadServiceAndReviews();
    } catch (err: any) {
      console.error("Erreur soumission avis:", err);
      setReviewError(
        err?.response?.data?.message ??
          "Impossible de soumettre l'avis. Vous avez peut-être déjà évalué ce service."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  // ─── Thème ────────────────────────────────────────────────────────────────
  const bg      = dm ? "bg-gray-900"  : "bg-white";
  const text     = dm ? "text-white"   : "text-gray-900";
  const subtext  = dm ? "text-gray-400": "text-gray-500";
  const border   = dm ? "border-gray-700" : "border-gray-100";
  const boxBg    = dm ? "bg-gray-800" : "bg-gray-50";
  const cardBg   = dm ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100";

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen ${bg} flex flex-col transition-colors duration-300`}
      style={{ fontFamily: "'DM Sans', sans-serif", minWidth: 1280 }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Navbar />
      <div className="max-w-6xl mx-auto w-full px-8 py-8 flex-1">
        {loading ? (
          <div className={`text-center py-24 ${subtext}`}>
            Chargement des détails…
          </div>
        ) : error ? (
          <div className="text-center py-24 text-red-600">{error}</div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className={`flex items-center gap-2 text-xs ${subtext} mb-5`}>
              <button type="button" className="hover:text-red-700 transition-colors">
                {service?.categoryName ?? "Services"}
              </button>
              <span>›</span>
              <button type="button" className="hover:text-red-700 transition-colors">
                {service?.title ?? "Détail service"}
              </button>
              <span>›</span>
              <span className={dm ? "text-gray-300 font-medium" : "text-gray-600 font-medium"}>
                {service?.provider?.fullName ?? "Prestataire"}
              </span>
            </div>

            {/* Grille principale */}
            <div className="grid grid-cols-3 gap-8">

              {/* ── COLONNE GAUCHE ── */}
              <div className="col-span-2">

                {/* Titre */}
                <h1
                  className={`text-2xl font-extrabold ${text} mb-3 leading-tight`}
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {service?.title ?? "Détail du service"}
                </h1>

                {/* Ligne prestataire */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {service?.provider?.profilePhoto ? (
                      <img
                        src={getImageUrl(service.provider.profilePhoto) ?? ''}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      service?.provider?.fullName
                        ? service.provider.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
                        : "SP"
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${dm ? "text-gray-300" : "text-gray-700"}`}>
                    {service?.provider?.fullName ?? "Prestataire"}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= Math.round(averageRating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className={`text-sm ${subtext}`}>
                    {averageRating.toFixed(1)} ({totalRatings} avis)
                  </span>
                </div>

                {/* Image principale */}
                <div className={`rounded-2xl overflow-hidden mb-3 ${dm ? "bg-gray-850" : "bg-gray-50"}`}>
                  <img
                    src={images[activeImage]}
                    alt="Aperçu du service"
                    className="w-full h-80 object-cover"
                  />
                </div>

                {/* Miniatures */}
                <div className="flex gap-3 mb-8">
                  {images.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      onClick={() => setActiveImage(idx)}
                      className={`rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeImage === idx ? "border-red-700" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="w-20 h-14 object-cover" />
                    </button>
                  ))}
                </div>

                {/* Présentation du service */}
                <div className="mb-8">
                  <h2
                    className={`text-lg font-bold ${text} mb-4`}
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Présentation du service
                  </h2>
                  <p className={`text-sm ${subtext} leading-relaxed mb-3`}>
                    {service?.description ??
                      "La description du service s'affichera ici une fois les données chargées."}
                  </p>
                  {service?.categoryName && (
                    <p className={`text-sm ${subtext} leading-relaxed mb-5`}>
                      Catégorie : {service.categoryName}
                    </p>
                  )}
                  <ul className="space-y-2">
                    {[
                      "Proposition personnalisée pour votre projet",
                      "Livraison flexible avec révisions incluses",
                      "Communication transparente avec le prestataire",
                    ].map((item) => (
                      <li key={item} className={`flex items-start gap-2 text-sm ${subtext}`}>
                        <span className="text-red-700 mt-0.5 font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* À propos du prestataire */}
                <div className={`${boxBg} rounded-2xl p-6 mb-8 border ${border}`}>
                  <h2
                    className={`text-lg font-bold ${text} mb-4`}
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    À propos du prestataire
                  </h2>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-700 flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden">
                      {service?.provider?.profilePhoto ? (
                        <img
                          src={getImageUrl(service.provider.profilePhoto) ?? ''}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        service?.provider?.fullName
                          ? service.provider.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
                          : "SP"
                      )}
                    </div>
                    <div>
                      <div className={`font-bold ${text} mb-0.5`}>
                        {service?.provider?.fullName ?? "Prestataire"}
                      </div>
                      <div className={`text-xs ${subtext} mb-3`}>
                        {service?.provider?.city
                          ? `${service.provider.city} • Prestataire expérimenté`
                          : "Prestataire expérimenté avec un excellent historique"}
                      </div>
                      <p className={`text-sm ${subtext} leading-relaxed mb-3`}>
                        Un service fiable axé sur la transparence et la satisfaction
                        client à chaque commande.
                      </p>
                      <button
                        type="button"
                        className="text-sm text-red-700 font-semibold hover:underline"
                      >
                        Voir le portfolio →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Avis clients */}
                <div className="mb-8">
                  <h2
                    className={`text-lg font-bold ${text} mb-6`}
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Avis clients
                  </h2>

                  {/* Résumé des notes — recalculé automatiquement via service */}
                  <div className={`flex items-start gap-10 mb-8 p-6 ${boxBg} rounded-2xl border ${border}`}>
                    <div className="text-center">
                      <div
                        className={`text-5xl font-extrabold ${text} mb-1`}
                        style={{ fontFamily: "'Sora', sans-serif" }}
                      >
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="text-yellow-400 text-lg mb-1">★★★★★</div>
                      <div className={`text-xs ${subtext}`}>{totalRatings} avis</div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = reviews.filter((r) => r.score === stars).length;
                        return (
                          <div key={stars} className="flex items-center gap-3 mb-2">
                            <span className={`text-xs ${subtext} w-8`}>{stars} ★</span>
                            <div
                              className={`flex-1 ${dm ? "bg-gray-700" : "bg-gray-200"} rounded-full h-2`}
                            >
                              <div
                                className="bg-red-700 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${(count / (totalRatings || 1)) * 100}%`,
                                }}
                              />
                            </div>
                            <span className={`text-xs ${subtext} w-6`}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Liste des avis */}
                  <div className="space-y-4 mb-8">
                    <h3 className={`font-bold ${text} mb-4`}>Avis récents</h3>
                    {reviews.length === 0 ? (
                      <p className={`text-sm ${subtext} italic`}>
                        Aucun avis pour l'instant.
                      </p>
                    ) : (
                      reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className={`p-5 rounded-2xl border ${border} ${boxBg} transition-all`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
                                {rev.userPhoto ? (
                                  <img
                                    src={rev.userPhoto}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  rev.userName.slice(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <span className={`block text-sm font-semibold ${text}`}>
                                  {rev.userName}
                                </span>
                                <span className={`block text-xs ${subtext}`}>
                                  {new Date(rev.createdAt).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-yellow-400 text-sm">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>
                                  {star <= rev.score ? "★" : "☆"}
                                </span>
                              ))}
                            </div>
                          </div>
                          {rev.comment && (
                            <p
                              className={`text-sm ${dm ? "text-gray-300" : "text-gray-700"} leading-relaxed`}
                            >
                              {rev.comment}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Formulaire d'avis — uniquement si l'utilisateur n'est pas le prestataire */}
                  {user &&
                    service?.provider?.id &&
                    user.id !== service.provider.id && (
                      <div
                        className={`${cardBg} p-6 rounded-2xl border ${border}`}
                        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}
                      >
                        <h3 className={`font-bold ${text} mb-4`}>
                          Laisser un avis
                        </h3>
                        <form onSubmit={handleSubmitReview}>
                          {/* Sélection des étoiles */}
                          <div className="flex gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewScore(star)}
                                className={`text-2xl transition-colors ${
                                  star <= reviewScore
                                    ? "text-yellow-400"
                                    : dm
                                    ? "text-gray-600"
                                    : "text-gray-200"
                                }`}
                              >
                                ★
                              </button>
                            ))}
                            <span className={`ml-2 text-sm self-center ${subtext}`}>
                              {reviewScore}/5
                            </span>
                          </div>

                          {/* Commentaire */}
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Partagez votre expérience avec ce service…"
                            required
                            rows={3}
                            className={`w-full border rounded-xl p-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${
                              dm
                                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600"
                                : "bg-white border-gray-200 text-gray-900"
                            }`}
                          />

                          {/* Bouton + messages */}
                          <div className="flex items-center gap-4 flex-wrap">
                            <button
                              type="submit"
                              disabled={reviewLoading}
                              className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                              {reviewLoading ? "Envoi en cours…" : "Soumettre l'avis"}
                            </button>
                            {reviewSuccess && (
                              <span className="text-sm text-green-600 font-medium">
                                ✓ Avis soumis avec succès !
                              </span>
                            )}
                            {reviewError && (
                              <span className="text-sm text-red-600">
                                {reviewError}
                              </span>
                            )}
                          </div>
                        </form>
                      </div>
                    )}
                </div>
              </div>

              {/* ── COLONNE DROITE (Sticky) ── */}
              <div className="col-span-1">
                <div className="sticky top-24">
                  <div
                    className={`${cardBg} rounded-2xl p-6 mb-4 border ${border}`}
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
                  >
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wide ${subtext}`}>
                          Prestataire
                        </div>
                        <div className={`text-lg font-semibold ${text}`}>
                          {service?.provider?.fullName ?? "Inconnu"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={subtext}>Note</div>
                        <div className={`text-base font-bold ${text}`}>
                          {averageRating.toFixed(1)} ★
                        </div>
                      </div>
                    </div>
                    <div className={`space-y-3 mb-6 text-sm ${subtext}`}>
                      <div className="flex items-center gap-2">
                        <span>📁</span>
                        <span>{service?.categoryName || "Aucune catégorie"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏱</span>
                        <span>Délai selon la demande</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💬</span>
                        <span>Disponible pour demandes personnalisées</span>
                      </div>
                    </div>
                    <button
                      onClick={handleContactProvider}
                      className="w-full bg-red-700 hover:bg-red-800 text-white rounded-2xl py-3 text-sm font-semibold transition-colors mb-3 border-none cursor-pointer"
                    >
                      Contacter le prestataire
                    </button>
                    <button
                      onClick={handleBookService}
                      disabled={bookingLoading || bookingSuccess}
                      className={`w-full border rounded-2xl py-3 text-sm font-semibold transition-colors cursor-pointer ${
                        bookingSuccess
                          ? "bg-green-50 border-green-200 text-green-700"
                          : dm
                          ? "border-gray-700 bg-gray-800 text-gray-300 hover:border-red-700 hover:text-red-500"
                          : "border-gray-200 hover:border-red-700 text-gray-700 hover:text-red-700"
                      } disabled:opacity-70`}
                    >
                      {bookingLoading
                        ? "Réservation…"
                        : bookingSuccess
                        ? "Réservé avec succès !"
                        : "Réserver ce service"}
                    </button>

                    {/* ── Save / Unsave button ── */}
                    <button
                      onClick={handleSaveToggle}
                      disabled={savedLoading}
                      className={`w-full flex items-center justify-center gap-2 border rounded-2xl py-3 text-sm font-semibold transition-all cursor-pointer mt-3 ${
                        saved
                          ? dm
                            ? "border-red-700 bg-red-900/30 text-red-400"
                            : "border-red-600 bg-red-50 text-red-700"
                          : dm
                          ? "border-gray-700 bg-gray-800 text-gray-300 hover:border-yellow-500 hover:text-yellow-400"
                          : "border-gray-200 hover:border-yellow-500 text-gray-600 hover:text-yellow-600"
                      } disabled:opacity-50`}
                    >
                      <span>{saved ? '🔖' : '🏷️'}</span>
                      {savedLoading
                        ? "..."
                        : saved
                        ? "Enregistré"
                        : "Enregistrer ce service"}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}