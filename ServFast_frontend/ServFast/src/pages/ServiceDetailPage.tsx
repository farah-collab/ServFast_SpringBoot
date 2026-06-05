import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { servicesApi, Service } from "../api/services";
import { ordersApi } from "../api/orders";
import { ratingsApi, Rating } from "../api/ratings";
import { authApi } from "../api/auth";
import { useTheme } from "../context/ThemeContext";

const placeholderImage = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80";

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

  // Review state
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  let images = [placeholderImage];
  if (service?.photoUrls?.length) {
    images = service.photoUrls;
  } else if (service?.imageUrl) {
    images = [service.imageUrl];
  }

  const averageRating = service?.averageRating ?? 0;
  const totalRatings = service?.totalRatings ?? 0;

  useEffect(() => {
    const loadService = async () => {
      if (!id) {
        setError("Service not found.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await servicesApi.getById(Number(id));
        setService(data);
        const reviewsData = await ratingsApi.getByService(Number(id));
        setReviews(reviewsData);
      } catch {
        setError("Unable to load the service details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [id]);

  const handleBookService = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!service) return;
    try {
      setBookingLoading(true);
      await ordersApi.create(service.id, "Booking from Service Details Page");
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch (err) {
      alert("Failed to book service. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactProvider = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (service?.provider?.id) {
      navigate(`/messages/${service.provider.id}`, { 
        state: { 
          providerName: service.provider.fullName,
          providerPhoto: service.provider.profilePhoto,
          serviceTitle: service.title
        } 
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!service) return;
    try {
      setReviewLoading(true);
      await ratingsApi.submit(service.id, reviewScore, reviewComment);
      setReviewSuccess(true);
      setReviewComment("");
      // reload service to update stats
      const data = await servicesApi.getById(Number(id));
      setService(data);
      const reviewsData = await ratingsApi.getByService(Number(id));
      setReviews(reviewsData);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      alert("Failed to submit review. You might have already reviewed this service.");
    } finally {
      setReviewLoading(false);
    }
  };

  const bg = dm ? "bg-gray-900" : "bg-white";
  const text = dm ? "text-white" : "text-gray-900";
  const subtext = dm ? "text-gray-400" : "text-gray-500";
  const border = dm ? "border-gray-700" : "border-gray-100";
  const boxBg = dm ? "bg-gray-800" : "bg-gray-50";
  const cardBg = dm ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100";

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
          <div className={`text-center py-24 ${subtext}`}>Loading service details…</div>
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
                {service?.title ?? "Service Details"}
              </button>
              <span>›</span>
              <span className={dm ? "text-gray-300 font-medium" : "text-gray-600 font-medium"}>
                {service?.provider?.fullName ?? "Provider"}
              </span>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-3 gap-8">

              {/* ── LEFT COLUMN ── */}
              <div className="col-span-2">

                {/* Title */}
                <h1
                  className={`text-2xl font-extrabold ${text} mb-3 leading-tight`}
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {service?.title ?? "Service Details"}
                </h1>

                {/* Provider row */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold">
                    {service?.provider?.fullName
                      ? service.provider.fullName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "SP"}
                  </div>
                  <span className={`text-sm font-semibold ${dm ? 'text-gray-300' : 'text-gray-700'}`}>
                    {service?.provider?.fullName ?? "Service Provider"}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>{star <= Math.round(averageRating) ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <span className={`text-sm ${subtext}`}>
                    {averageRating.toFixed(1)} ({totalRatings} reviews)
                  </span>
                </div>

                {/* Main image */}
                <div className={`rounded-2xl overflow-hidden mb-3 ${dm ? 'bg-gray-850' : 'bg-gray-50'}`}>
                  <img
                    src={images[activeImage]}
                    alt="Service preview"
                    className="w-full h-80 object-cover"
                  />
                </div>

                {/* Thumbnails */}
                <div className="flex gap-3 mb-8">
                  {images.map((img, idx) => (
                    <button
                      key={img}
                      onClick={() => setActiveImage(idx)}
                      className={`rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeImage === idx ? "border-red-700" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="w-20 h-14 object-cover" />
                    </button>
                  ))}
                </div>

                {/* Service Overview */}
                <div className="mb-8">
                  <h2
                    className={`text-lg font-bold ${text} mb-4`}
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Service Overview
                  </h2>
                  <p className={`text-sm ${subtext} leading-relaxed mb-3`}>
                    {service?.description ?? "A detailed service description will appear here once the service data loads."}
                  </p>
                  <p className={`text-sm ${subtext} leading-relaxed mb-5`}>
                    {service?.categoryName
                      ? `Category: ${service.categoryName}`
                      : "This service is provided by an experienced professional with attention to detail and quality."}
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Custom proposal built for your project",
                      "Flexible delivery and revisions",
                      "Clear communication with your provider",
                    ].map((item) => (
                      <li key={item} className={`flex items-start gap-2 text-sm ${subtext}`}>
                        <span className="text-red-700 mt-0.5 font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* About the Provider */}
                <div className={`${boxBg} rounded-2xl p-6 mb-8 border ${border}`}>
                  <h2
                    className={`text-lg font-bold ${text} mb-4`}
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    About the Provider
                  </h2>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {service?.provider?.fullName
                        ? service.provider.fullName
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "SP"}
                    </div>
                    <div>
                      <div className={`font-bold ${text} mb-0.5`}>
                        {service?.provider?.fullName ?? "Service Provider"}
                      </div>
                      <div className={`text-xs ${subtext} mb-3`}>
                        {service?.provider?.city
                          ? `${service.provider.city} • Experienced Provider`
                          : "Experienced provider with a strong track record"}
                      </div>
                      <p className={`text-sm ${subtext} leading-relaxed mb-3`}>
                        {service?.description
                          ? "Delivering reliable service with a focus on transparency and client satisfaction for every order."
                          : "Provider details will appear when the service data has loaded."}
                      </p>
                      <button type="button" className="text-sm text-red-700 font-semibold hover:underline">
                        View Portfolio →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Client Feedback */}
                <div className="mb-8">
                  <h2
                    className={`text-lg font-bold ${text} mb-6`}
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Client Feedback
                  </h2>
                  <div className={`flex items-start gap-10 mb-8 p-6 ${boxBg} rounded-2xl border ${border}`}>
                    <div className="text-center">
                      <div
                        className={`text-5xl font-extrabold ${text} mb-1`}
                        style={{ fontFamily: "'Sora', sans-serif" }}
                      >
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="text-yellow-400 text-lg mb-1">★★★★★</div>
                      <div className={`text-xs ${subtext}`}>{totalRatings} Reviews</div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-3 mb-2">
                          <span className={`text-xs ${subtext} w-8`}>{stars} ★</span>
                          <div className={`flex-1 ${dm ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                            <div
                              className="bg-red-700 h-2 rounded-full"
                              style={{ width: `${(reviews.filter(r => r.score === stars).length / (totalRatings || 1)) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs ${subtext} w-6`}>
                            {reviews.filter(r => r.score === stars).length}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4 mb-8">
                    <h3 className={`font-bold ${text} mb-4`}>Recent Reviews</h3>
                    {reviews.length === 0 ? (
                      <p className={`text-sm ${subtext} italic`}>No reviews with comments yet.</p>
                    ) : (
                      reviews.map((rev) => (
                        <div key={rev.id} className={`p-5 rounded-2xl border ${border} ${boxBg} transition-all`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
                                {rev.userPhoto ? (
                                  <img src={rev.userPhoto} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  rev.userName.slice(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <span className={`block text-sm font-semibold ${text}`}>{rev.userName}</span>
                                <span className={`block text-xs ${subtext}`}>
                                  {new Date(rev.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-yellow-400 text-sm">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>{star <= rev.score ? "★" : "☆"}</span>
                              ))}
                            </div>
                          </div>
                          {rev.comment && (
                            <p className={`text-sm ${dm ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                              {rev.comment}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Review Form */}
                  {user && user.role !== 'PROVIDER' && (
                    <div className={`${cardBg} p-6 rounded-2xl border ${border}`} style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
                      <h3 className={`font-bold ${text} mb-4`}>Leave a Review</h3>
                      <form onSubmit={handleSubmitReview}>
                        <div className="flex gap-2 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewScore(star)}
                              className={`text-2xl transition-colors ${star <= reviewScore ? "text-yellow-400" : "text-gray-200"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this service..."
                          required
                          rows={3}
                          className={`w-full border rounded-xl p-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${
                            dm ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600' : 'bg-white border-gray-200 text-gray-900'
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={reviewLoading}
                          className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                          {reviewLoading ? "Submitting..." : "Submit Review"}
                        </button>
                        {reviewSuccess && <span className="ml-4 text-sm text-green-600">Review submitted successfully!</span>}
                      </form>
                    </div>
                  )}
                </div>

              </div>

              {/* ── RIGHT COLUMN (Sticky sidebar) ── */}
              <div className="col-span-1">
                <div className="sticky top-24">
                  <div
                    className={`${cardBg} rounded-2xl p-6 mb-4 border ${border}`}
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
                  >
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wide ${subtext}`}>Provider</div>
                        <div className={`text-lg font-semibold ${text}`}>
                          {service?.provider?.fullName ?? "Unknown Provider"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={subtext}>Rating</div>
                        <div className={`text-base font-bold ${text}`}>
                          {averageRating.toFixed(1)} ★
                        </div>
                      </div>
                    </div>
                    <div className={`space-y-3 mb-6 text-sm ${subtext}`}>
                      <div className="flex items-center gap-2">
                        <span>📁</span>
                        <span>{service?.categoryName || "No category"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏱</span>
                        <span>Delivery time varies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💬</span>
                        <span>Available for custom requests</span>
                      </div>
                    </div>
                    <button
                      onClick={handleContactProvider}
                      className="w-full bg-red-700 hover:bg-red-800 text-white rounded-2xl py-3 text-sm font-semibold transition-colors mb-3 border-none cursor-pointer"
                    >
                      Contact Provider
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
                      {bookingLoading ? "Booking..." : bookingSuccess ? "Booked Successfully!" : "Book this service"}
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