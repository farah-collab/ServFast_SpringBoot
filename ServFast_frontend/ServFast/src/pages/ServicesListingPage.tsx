import { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import { useTheme } from "../context/ThemeContext";
import { servicesApi, Service } from "../api/services";
import { categoriesApi, Category } from "../api/categories";

export default function ServicesListingPage() {
  const navigate = useNavigate();
  const { darkMode: dm } = useTheme();

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const dm_bg = dm ? "#111827" : "#ffffff";
  const dm_card = dm ? "#1F2937" : "#ffffff";
  const dm_border = dm ? "#374151" : "#E5E7EB";
  const dm_text = dm ? "#F9FAFB" : "#111827";
  const dm_sub = dm ? "#9CA3AF" : "#6B7280";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [svc, cats] = await Promise.all([
          servicesApi.search(),
          categoriesApi.getAll(),
        ]);
        setServices(Array.isArray(svc) ? svc : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Search handler removed

  const handleCategoryClick = (catId: number) => {
    setActiveCategory(catId === activeCategory ? null : catId);
  };

  const popularServices = [...services]
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 6);

  const categoryServices = activeCategory
    ? services.filter(s => s.categoryId === activeCategory).slice(0, 6)
    : services.slice(0, 6);

  const displayedServices = activeCategory ? categoryServices : popularServices;

  const stars = (rating: number) =>
    [1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : dm ? "#374151" : "#D1D5DB", fontSize: 12 }}>★</span>
    ));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .svc-card { transition: transform 0.22s, box-shadow 0.22s; cursor: pointer; }
        .svc-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.13) !important; }
        .cat-chip { transition: all 0.18s; cursor: pointer; }
        .cat-chip:hover { transform: translateY(-2px); }
        .hero-search:focus-within { box-shadow: 0 0 0 3px rgba(185,28,28,0.18); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px);} to { opacity:1; transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.5s ease both; }
      `}</style>

      <div style={{ minHeight: "100vh", background: dm_bg, fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar />        <section style={{
          background: dm
            ? "linear-gradient(135deg, #1a0505 0%, #111827 60%)"
            : "linear-gradient(135deg, #fff5f5 0%, #fff 60%)",
          padding: "72px 40px 56px",
          borderBottom: `1px solid ${dm_border}`,
        }}>
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }} className="fade-up">
            <div style={{
              display: "inline-block", fontSize: 12, fontWeight: 700,
              padding: "4px 14px", borderRadius: 20,
              background: dm ? "rgba(185,28,28,0.15)" : "#FEF2F2",
              color: "#B91C1C", marginBottom: 16, letterSpacing: "0.05em",
            }}>
              PROFESSIONAL SERVICES PLATFORM
            </div>

            <h1 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 44, fontWeight: 800,
              color: dm ? "#F9FAFB" : "#111827",
              margin: "0 0 12px", lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}>
              Find the best service
              <br />for your project
            </h1>

            <p style={{
              fontSize: 17, color: dm_sub,
              margin: "0 auto 36px", maxWidth: 520, lineHeight: 1.6,
            }}>
              Thousands of qualified professionals ready to help.
              From concept to delivery.
            </p>

            {/* Search bar removed */}

            <div style={{ marginTop: 18, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: dm_sub }}>Popular:</span>
              {['Web development', 'Logo design', 'SEO', 'Mobile app', 'Copywriting'].map(tag => (
                <button key={tag} onClick={() => navigate(`/browse?q=${encodeURIComponent(tag)}`)} style={{
                  fontSize: 13, padding: "3px 12px", borderRadius: 20,
                  border: `1px solid ${dm_border}`,
                  background: "transparent", color: dm_sub, cursor: "pointer",
                  transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#B91C1C"; e.currentTarget.style.color = "#B91C1C"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = dm_border; e.currentTarget.style.color = dm_sub; }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section style={{
          background: dm ? "#1F2937" : "#B91C1C",
          padding: "18px 40px",
        }}>
          <div style={{
            maxWidth: 900, margin: "0 auto",
            display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 12,
          }}>
            {[
              { value: `${services.length}+`, label: "Services available" },
              { value: `${categories.length}+`, label: "Categories" },
              { value: "100%", label: "Verified professionals" },
              { value: "24/7", label: "Customer support" },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 40px 80px" }}>

          <section style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div>
                <h2 style={{
                  fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800,
                  color: dm_text, margin: "0 0 4px", letterSpacing: "-0.02em",
                }}>
                  Explore by category
                </h2>
                <p style={{ fontSize: 14, color: dm_sub, margin: 0 }}>
                  Pick a category to browse services
                </p>
              </div>
              <button onClick={() => navigate("/browse")} style={{
                fontSize: 13, fontWeight: 600, color: "#B91C1C",
                background: "none", border: "none", cursor: "pointer",
                padding: 0, fontFamily: "'DM Sans', sans-serif",
              }}>
                View all →
              </button>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: 14,
            }}>
              {categories.slice(0, 12).map(cat => (
                <button
                  key={cat.id}
                  className="cat-chip"
                  onClick={() => handleCategoryClick(cat.id)}
                  style={{
                    padding: "18px 12px", borderRadius: 14,
                    background: activeCategory === cat.id
                      ? "#B91C1C"
                      : dm ? "#1F2937" : "#F9FAFB",
                    border: `1.5px solid ${activeCategory === cat.id ? "#B91C1C" : dm_border}`,
                    cursor: "pointer", textAlign: "center",
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: activeCategory === cat.id ? "0 4px 16px rgba(185,28,28,0.3)" : "none",
                  }}
                >
                  <div style={{
                    fontSize: 13, fontWeight: 700, lineHeight: 1.4,
                    color: activeCategory === cat.id ? "#fff" : dm_text,
                  }}>
                    {cat.name}
                  </div>
                </button>
              ))}

              <button
                className="cat-chip"
                onClick={() => navigate("/browse")}
                style={{
                  padding: "18px 12px", borderRadius: 14,
                  background: "transparent",
                  border: `1.5px dashed ${dm ? "#374151" : "#D1D5DB"}`,
                  cursor: "pointer", textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: dm_sub }}>
                  Browse all
                </div>
              </button>
            </div>
          </section>

          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div>
                <h2 style={{
                  fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800,
                  color: dm_text, margin: "0 0 4px", letterSpacing: "-0.02em",
                }}>
                  {activeCategory
                    ? `Services: ${categories.find(c => c.id === activeCategory)?.name}`
                    : "Popular services"}
                </h2>
                <p style={{ fontSize: 14, color: dm_sub, margin: 0 }}>
                  {activeCategory ? "Services in this category" : "Top-rated services on the platform"}
                </p>
              </div>
              <button onClick={() => navigate("/browse")} style={{
                fontSize: 13, fontWeight: 600, color: "#B91C1C",
                background: "none", border: "none", cursor: "pointer",
                padding: 0, fontFamily: "'DM Sans', sans-serif",
              }}>
                Advanced search →
              </button>
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                <div style={{
                  width: 38, height: 38, border: "3px solid #B91C1C",
                  borderTopColor: "transparent", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
              </div>
            ) : displayedServices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <p style={{ fontSize: 16, color: dm_sub }}>No services found in this category yet.</p>
                <button onClick={() => setActiveCategory(null)} style={{
                  marginTop: 12, padding: "8px 24px", borderRadius: 10,
                  background: "#B91C1C", color: "#fff", border: "none",
                  fontWeight: 600, cursor: "pointer", fontSize: 14,
                }}>
                  View all services
                </button>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 22,
              }}>
                {displayedServices.map(s => (
                  <div
                    key={s.id}
                    className="svc-card"
                    onClick={() => navigate(`/services/${s.id}`)}
                    style={{
                      background: dm_card, border: `1px solid ${dm_border}`,
                      borderRadius: 18, overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                      <img
                        src={s.photoUrls?.[0] ?? s.imageUrl ?? "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=700&q=80"}
                        alt={s.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                      <div style={{
                        position: "absolute", top: 12, left: 12,
                        background: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(4px)",
                        fontSize: 11, fontWeight: 700,
                        padding: "3px 10px", borderRadius: 20,
                        color: "#374151",
                      }}>
                        {s.categoryName || "Service"}
                      </div>
                      {s.isAvailable && (
                        <div style={{
                          position: "absolute", top: 12, right: 12,
                          background: "#16a34a", fontSize: 10, fontWeight: 700,
                          padding: "3px 8px", borderRadius: 20, color: "#fff",
                        }}>
                          Available
                        </div>
                      )}
                    </div>

                    <div style={{ padding: "16px 18px 18px" }}>
                      <h3 style={{
                        fontSize: 14, fontWeight: 700, color: dm_text,
                        margin: "0 0 8px", lineHeight: 1.4,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {s.title}
                      </h3>

                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: "50%",
                          background: "#B91C1C", overflow: "hidden",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}>
                          {s.provider?.profilePhoto
                            ? <img src={s.provider.profilePhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : s.provider?.fullName?.[0] ?? "P"}
                        </div>
                        <span style={{ fontSize: 12, color: dm_sub, fontWeight: 500 }}>
                          {s.provider?.fullName ?? "Professional"}
                          {s.provider?.city && ` · ${s.provider.city}`}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
                        {stars(s.averageRating || 0)}
                        <span style={{ fontSize: 12, color: dm_sub }}>
                          {s.averageRating ? s.averageRating.toFixed(1) : "—"}
                          {" "}({s.totalRatings || 0} reviews)
                        </span>
                      </div>

                      <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        paddingTop: 12, borderTop: `1px solid ${dm_border}`,
                      }}>
                        <div>
                          <div style={{ fontSize: 10, color: dm_sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Starting at
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#B91C1C" }}>
                            {s.price.toLocaleString()} TND
                          </div>
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
                          background: dm ? "#374151" : "#F3F4F6", color: dm_sub,
                        }}>
                          {s.priceType === "HOURLY" ? "/hour" : s.priceType === "QUOTE" ? "Quote" : "Fixed"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && services.length > 6 && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <button onClick={() => navigate("/browse")} style={{
                  padding: "14px 40px", borderRadius: 14,
                  background: "transparent",
                  border: `2px solid #B91C1C`,
                  color: "#B91C1C", fontWeight: 700, fontSize: 15,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#B91C1C"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#B91C1C"; }}
                >
                  View all {services.length} services →
                </button>
              </div>
            )}
          </section>

          <section style={{
            marginTop: 72,
            background: dm ? "#1F2937" : "#FFF5F5",
            borderRadius: 24, padding: "44px 48px",
            border: `1px solid ${dm_border}`,
          }}>
            <h2 style={{
              fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800,
              color: dm_text, margin: "0 0 8px", letterSpacing: "-0.02em",
              textAlign: "center",
            }}>
              How it works
            </h2>
            <p style={{ textAlign: "center", color: dm_sub, fontSize: 14, margin: "0 0 36px" }}>
              Simple, fast and secure
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
              {[
                { step: "01", title: "Search", desc: "Explore services or use Browse for a focused search." },
                { step: "02", title: "Connect", desc: "Message a provider directly and discuss details." },
                { step: "03", title: "Deliver", desc: "Track progress and confirm completion." },
              ].map(item => (
                <div key={item.step} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 18,
                    background: dm ? "#374151" : "#fff",
                    border: `2px solid ${dm_border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, margin: "0 auto 14px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    color: dm_text,
                  }}>
                    {item.step}
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: "#B91C1C",
                    letterSpacing: "0.1em", marginBottom: 6,
                  }}>
                    STEP {item.step}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: dm_text, margin: "0 0 6px" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 13, color: dm_sub, lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </>
  );
}
