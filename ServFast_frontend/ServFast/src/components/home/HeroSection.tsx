import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { ratingsApi } from "../../api/ratings";

const HERO_IMAGE = "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1100&q=85";

const FALLBACKS = [
  {
    id: "f1",
    userName: "Sophia Müller",
    userPhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80",
    score: 5,
    comment: "We hired a legal expert and a cloud architect within 48 hours. ServFast is now our default platform.",
  },
  {
    id: "f2",
    userName: "James Okafor",
    userPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
    score: 5,
    comment: "The vetting process is incredibly rigorous. Every professional we've worked with has exceeded expectations.",
  },
  {
    id: "f3",
    userName: "Amira Hassan",
    userPhoto: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80",
    score: 5,
    comment: "Found a senior DevOps engineer in less than 24 hours. The platform is clean, fast, and world-class.",
  },
  {
    id: "f4",
    userName: "Lucas Bernard",
    userPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80",
    score: 5,
    comment: "As a startup, speed matters. ServFast gave us access to enterprise-grade talent instantly.",
  },
];

const POPULAR_SEARCHES = ["Développement web", "Design logo", "SEO", "Mobile app", "Rédaction"];

function nameToColor(name = "") {
  const colors = ["#B91C1C", "#1D4ED8", "#047857", "#7C3AED", "#B45309", "#0F766E"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
}

export default function HeroSection() {
  const navigate = useNavigate();
  const user = authApi.getCurrentUser();

  const [testimonials, setTestimonials] = useState<any[]>(FALLBACKS);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const ratings = await ratingsApi.getRecent();
        const withComment = (ratings || []).filter((r: any) => r.comment?.trim().length > 0);
        if (withComment.length > 0) { setTestimonials(withComment); setCurrent(0); }
      } catch {}
    };
    fetch();
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    intervalRef.current = setInterval(() => goTo((current + 1) % testimonials.length), 4000);
    return () => clearInterval(intervalRef.current);
  }, [testimonials, current]);

  const goTo = (idx: number) => {
    if (animating) return;
    setAnimating(true);
    clearInterval(intervalRef.current);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 280);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/browse?q=${encodeURIComponent(searchQuery.trim())}` : "/browse");
  };

  const t = testimonials[current] || FALLBACKS[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }
        .hero-search-wrap:focus-within { border-color: #B91C1C !important; box-shadow: 0 0 0 3px rgba(185,28,28,0.12); }
        .popular-tag { transition: all 0.15s; }
        .popular-tag:hover { background: #FEF2F2 !important; color: #B91C1C !important; border-color: #B91C1C !important; }
        .hero-cta-primary { transition: background 0.2s, transform 0.15s, box-shadow 0.2s; }
        .hero-cta-primary:hover { background: #991B1B !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(185,28,28,0.4) !important; }
        .hero-cta-secondary { transition: background 0.2s, transform 0.15s; }
        .hero-cta-secondary:hover { background: #F9FAFB !important; transform: translateY(-1px); }
      `}</style>

      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: 480,
        background: "#fff",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* ── Left ── */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "52px 56px 52px 64px" }}>

          {/* Badge */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#FEF2F2", border: "1px solid #FECACA",
            color: "#B91C1C", fontSize: 11, fontWeight: 700,
            padding: "4px 12px", borderRadius: 9999,
            width: "fit-content", marginBottom: 20,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "#DC2626",
              display: "inline-block", animation: "pulse-dot 1.5s infinite",
            }} />
            12 000+ experts disponibles
          </span>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 42, fontWeight: 800, lineHeight: 1.15,
            letterSpacing: "-0.03em", color: "#111827", margin: "0 0 14px",
          }}>
            Find the perfect<br />
            <span style={{ color: "#B91C1C" }}>professional</span> for<br />
            every challenge.
          </h1>

          <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, maxWidth: 400, margin: "0 0 28px" }}>
            From IT to legal, connect with vetted experts who deliver results with speed and precision.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ marginBottom: 14 }}>
            <div className="hero-search-wrap" style={{
              display: "flex", border: "1.5px solid #E5E7EB", borderRadius: 14,
              overflow: "hidden", background: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "border-color 0.2s, box-shadow 0.2s",
              maxWidth: 440,
            }}>
              <span style={{ display: "flex", alignItems: "center", paddingLeft: 14, color: "#9CA3AF" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="What service are you looking for?"
                style={{
                  flex: 1, border: "none", outline: "none",
                  padding: "12px 12px", fontSize: 14,
                  background: "transparent", color: "#111827",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <button type="submit" style={{
                padding: "0 20px", background: "#B91C1C", border: "none",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#991B1B"}
              onMouseLeave={e => e.currentTarget.style.background = "#B91C1C"}
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular tags */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28, maxWidth: 440 }}>
            <span style={{ fontSize: 12, color: "#9CA3AF", alignSelf: "center" }}>Popular:</span>
            {POPULAR_SEARCHES.map(tag => (
              <button key={tag} className="popular-tag"
                onClick={() => navigate(`/browse?q=${encodeURIComponent(tag)}`)}
                style={{
                  fontSize: 12, padding: "3px 10px", borderRadius: 20,
                  border: "1px solid #E5E7EB", background: "transparent",
                  color: "#6B7280", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                {tag}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <button className="hero-cta-primary"
              onClick={() => navigate("/browse")}
              style={{
                background: "#B91C1C", color: "#fff", fontSize: 14, fontWeight: 700,
                padding: "11px 22px", borderRadius: 12, border: "none", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(185,28,28,0.3)",
              }}>
              Trouver un expert →
            </button>
            {(!user || user.role === "CLIENT") && (
              <button className="hero-cta-secondary"
                onClick={() => navigate("/register")}
                style={{
                  background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600,
                  padding: "11px 22px", borderRadius: 12,
                  border: "1px solid #E5E7EB", cursor: "pointer",
                }}>
                Devenir prestataire
              </button>
            )}
          </div>

          {/* Testimonial carousel */}
          <div style={{ maxWidth: 440 }}>
            <div style={{
              background: "#F9FAFB", border: "1px solid #F3F4F6",
              borderRadius: 20, padding: "18px 20px",
              opacity: animating ? 0 : 1,
              transform: animating ? "translateY(6px)" : "translateY(0)",
              transition: "opacity 0.28s ease, transform 0.28s ease",
            }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ fontSize: 13, color: i < t.score ? "#F59E0B" : "#E5E7EB" }}>★</span>
                ))}
              </div>
              <p style={{
                fontSize: 13, color: "#4B5563", lineHeight: 1.7,
                fontStyle: "italic", margin: "0 0 14px",
                display: "-webkit-box", WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                "{t.comment}"
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {t.userPhoto ? (
                    <img src={t.userPhoto} alt={t.userName}
                      style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      onError={e => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: nameToColor(t.userName),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>
                      {getInitials(t.userName)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{t.userName}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>Verified client</div>
                  </div>
                </div>
                {testimonials.length > 1 && (
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    {testimonials.map((_, i) => (
                      <button key={i} onClick={() => goTo(i)} style={{
                        width: i === current ? 18 : 6, height: 6,
                        borderRadius: 9999, border: "none", padding: 0, cursor: "pointer",
                        background: i === current ? "#B91C1C" : "#E5E7EB",
                        transition: "all 0.3s ease", flexShrink: 0,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right — image ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "32px 40px 32px 16px",
        }}>
          <div style={{ width: "100%", height: 360, borderRadius: 20, overflow: "hidden" }}>
            <img
              src={HERO_IMAGE}
              alt="Professionals working together"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
            />
          </div>
        </div>
      </section>
    </>
  );
}