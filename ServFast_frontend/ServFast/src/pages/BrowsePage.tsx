import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { useTheme } from "../context/ThemeContext";
import { servicesApi, Service } from "../api/services";
import { usersApi, UserProfile } from "../api/users";
import { categoriesApi, Category } from "../api/categories";

const STORAGE_URL = 'http://localhost:8081';
function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${STORAGE_URL}${normalized}`;
}

type Tab = "services" | "experts";
type SortOption = "relevant" | "price_asc" | "price_desc" | "rating";

export default function BrowsePage() {
  const { darkMode: dm } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<Tab>("services");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");

  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minRating, setMinRating] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("relevant");

  const [services, setServices] = useState<Service[]>([]);
  const [experts, setExperts] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const dm_card   = dm ? "#1F2937" : "#ffffff";
  const dm_border = dm ? "#374151" : "#E5E7EB";
  const dm_text   = dm ? "#F9FAFB" : "#111827";
  const dm_sub    = dm ? "#9CA3AF" : "#6B7280";
  const dm_bg     = dm ? "#111827" : "#F3F4F6";
  const dm_input  = dm ? "#1F2937" : "#ffffff";

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const catId = Number(categoryParam);
      if (!isNaN(catId)) {
        setSelectedCategory(catId);
      }
    }
    categoriesApi.getAll()
      .then(data => setCategories(Array.isArray(data) ? data : (data as any).content ?? []))
      .catch(() => setCategories([]));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "services") {
        const data = await servicesApi.search({
          keyword: query || undefined,
          city: location || undefined,
          categoryId: selectedCategory !== "" ? Number(selectedCategory) : undefined,
          maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
        });
        let sorted = [...data];
        if (sortBy === "price_asc")  sorted.sort((a, b) => a.price - b.price);
        if (sortBy === "price_desc") sorted.sort((a, b) => b.price - a.price);
        if (sortBy === "rating")     sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        setServices(sorted);
      } else {
        const data = await usersApi.getExperts({ keyword: query || undefined });
        let sorted = [...data];
        if (sortBy === "rating") sorted.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
        if (location) sorted = sorted.filter(e => e.city?.toLowerCase().includes(location.toLowerCase()));
        setExperts(sorted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, query, selectedCategory, maxPrice, location, sortBy]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    setSearchParams(inputValue ? { q: inputValue } : {});
  };

  const resetFilters = () => {
    setSelectedCategory("");
    setMaxPrice("");
    setMinRating("");
    setLocation("");
    setSortBy("relevant");
  };

  const stars = (rating: number) =>
    [1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : dm ? "#374151" : "#D1D5DB", fontSize: 13 }}>★</span>
    ));

  const inputStyle: React.CSSProperties = {
    border: `1.5px solid ${dm_border}`, borderRadius: 10,
    padding: "8px 12px", fontSize: 13,
    background: dm_input, color: dm_text,
    outline: "none", width: "100%",
    fontFamily: "'DM Sans', sans-serif",
  };

  const resultCount = activeTab === "services" ? services.length : experts.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .browse-card { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .browse-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.13) !important; }
        .filter-input:focus { border-color: #B91C1C !important; box-shadow: 0 0 0 3px rgba(185,28,28,0.12); }
        .tab-btn { transition: all 0.2s; }
        .msg-btn { transition: all 0.15s; }
        .msg-btn:hover { background: #991B1B !important; transform: translateY(-1px); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: dm_bg, fontFamily: "'DM Sans', sans-serif" }}>
        <Navbar />

        {/* ── Hero Search ── */}
        <div style={{
          background: dm ? "#1a0505" : "#fff5f5",
          borderBottom: `1px solid ${dm_border}`,
          padding: "32px 40px 24px",
        }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <h1 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 28, fontWeight: 800,
              color: dm ? "#F87171" : "#B91C1C",
              margin: "0 0 6px", letterSpacing: "-0.02em",
            }}>
              Search ServFast
            </h1>
            <p style={{ color: dm_sub, fontSize: 14, margin: "0 0 20px" }}>
              Find the service or expert you need
            </p>
            <form onSubmit={handleSearch}>
              <div style={{
                display: "flex",
                border: `1.5px solid ${dm_border}`,
                borderRadius: 14, overflow: "hidden",
                background: dm_input,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}>
                <span style={{ display: "flex", alignItems: "center", paddingLeft: 16, color: dm_sub }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <input
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Ex: plumber, web developer, designer..."
                  style={{
                    flex: 1, border: "none", outline: "none",
                    padding: "13px 16px", fontSize: 15,
                    background: "transparent", color: dm_text,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                <button type="submit" style={{
                  padding: "0 32px", background: "#B91C1C",
                  border: "none", color: "#fff",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#991B1B"}
                onMouseLeave={e => e.currentTarget.style.background = "#B91C1C"}
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        <div style={{
          width: '100%', margin: "0 auto",
          padding: "28px 40px 60px",
          display: "flex", gap: 28, alignItems: "flex-start",
        }}>

          {/* ── Sidebar Filters ── */}
          <div style={{
            width: 230, flexShrink: 0,
            background: dm_card, border: `1px solid ${dm_border}`,
            borderRadius: 16, padding: "20px 18px",
            position: "sticky", top: 84,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: dm_text }}>Filters</span>
              <button onClick={resetFilters} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "#B91C1C", fontWeight: 600, padding: 0,
              }}>
                Reset
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Category — services only */}
              {activeTab === "services" && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: dm_sub, display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>
                    CATEGORY
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value === "" ? "" : Number(e.target.value))}
                    className="filter-input"
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="">All</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Location */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: dm_sub, display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>
                  LOCALISATION
                </label>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City, region..."
                  className="filter-input"
                  style={inputStyle}
                />
              </div>

              {/* Max Price — services only */}
              {activeTab === "services" && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: dm_sub, display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>
                    MAX PRICE (TND)
                  </label>
                  <input
                    type="number" min={0}
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="ex: 500"
                    className="filter-input"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Min Rating */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: dm_sub, display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>
                  MINIMUM RATING
                </label>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} onClick={() => setMinRating(minRating === r ? "" : r)} style={{
                      flex: 1, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
                      fontSize: 14, fontWeight: 700,
                      background: minRating !== "" && r <= Number(minRating) ? "#F59E0B" : dm ? "#374151" : "#F3F4F6",
                      color: minRating !== "" && r <= Number(minRating) ? "#fff" : dm_sub,
                      transition: "all 0.15s",
                    }}>★</button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: dm_sub, display: "block", marginBottom: 6, letterSpacing: "0.05em" }}>
                  TRIER PAR
                </label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="filter-input"
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="relevant">Pertinence</option>
                  <option value="rating">Mieux notés</option>
                  {activeTab === "services" && <option value="price_asc">Prix croissant</option>}
                  {activeTab === "services" && <option value="price_desc">Prix décroissant</option>}
                </select>
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 4, marginBottom: 20,
              background: dm ? "#1F2937" : "#fff",
              border: `1px solid ${dm_border}`,
              borderRadius: 12, padding: 4, width: "fit-content",
            }}>
              {(["services", "experts"] as Tab[]).map(tab => (
                <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{
                  padding: "8px 22px", borderRadius: 9, border: "none",
                  cursor: "pointer", fontSize: 14, fontWeight: 600,
                  background: activeTab === tab ? "#B91C1C" : "transparent",
                  color: activeTab === tab ? "#fff" : dm_sub,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}>
                  {tab === "services" ? "🛠 Services" : "👤 Experts"}
                </button>
              ))}
            </div>

            {/* Result count */}
            <p style={{ fontSize: 13, color: dm_sub, marginBottom: 18 }}>
              {loading ? "Chargement..." : (
                <>
                  <strong style={{ color: dm_text }}>{resultCount}</strong> résultat{resultCount > 1 ? "s" : ""}
                  {query && <> pour "<strong style={{ color: "#B91C1C" }}>{query}</strong>"</>}
                </>
              )}
            </p>

            {/* Spinner */}
            {loading && (
              <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                <div style={{
                  width: 36, height: 36, border: "3px solid #B91C1C",
                  borderTopColor: "transparent", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
              </div>
            )}

            {/* ── Services Grid ── */}
            {!loading && activeTab === "services" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
                {services.length === 0
                  ? <EmptyState dm={dm} label="Aucun service trouvé" />
                  : services
                      .filter(s => minRating === "" || (s.averageRating || 0) >= Number(minRating))
                      .map(s => (
                  <div key={s.id} className="browse-card"
                    onClick={() => navigate(`/services/${s.id}`)}
                    style={{
                      background: dm_card, border: `1px solid ${dm_border}`,
                      borderRadius: 16, overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div style={{ height: 155, overflow: "hidden", background: dm ? "#374151" : "#F3F4F6" }}>
                      <img
                        src={
                          getImageUrl(s.photoUrls?.[0] ?? s.imageUrl ?? null) ??
                          "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80"
                        }
                        alt={s.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.currentTarget.src = "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80"; }}
                      />
                    </div>
                    <div style={{ padding: "14px 16px 16px" }}>
                      {s.categoryName && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 8px",
                          borderRadius: 20, background: dm ? "#374151" : "#FEF2F2",
                          color: dm ? "#FCA5A5" : "#B91C1C",
                          display: "inline-block", marginBottom: 6,
                        }}>
                          {s.categoryName}
                        </span>
                      )}
                      <h3 style={{
                        margin: "4px 0", fontSize: 14, fontWeight: 700, color: dm_text,
                        lineHeight: "1.35", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {s.title}
                      </h3>
                      {s.provider && (
                        <p style={{ fontSize: 12, color: dm_sub, margin: "4px 0 8px" }}>
                          par {s.provider.fullName}{s.provider.city && ` · ${s.provider.city}`}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
                        {stars(s.averageRating || 0)}
                        <span style={{ fontSize: 12, color: dm_sub }}>({s.totalRatings || 0})</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#B91C1C" }}>
                          {s.price} TND
                          <span style={{ fontSize: 11, fontWeight: 400, color: dm_sub }}>
                            {" "}/{s.priceType === "HOURLY" ? "h" : s.priceType === "QUOTE" ? "devis" : "fixe"}
                          </span>
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 8,
                          background: s.isAvailable ? dm ? "#052e16" : "#f0fdf4" : dm ? "#1F2937" : "#F3F4F6",
                          color: s.isAvailable ? "#16a34a" : dm_sub,
                        }}>
                          {s.isAvailable ? "Disponible" : "Occupé"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Experts Grid ── */}
            {!loading && activeTab === "experts" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20 }}>
                {experts.length === 0
                  ? <EmptyState dm={dm} label="Aucun expert trouvé" />
                  : experts.map(expert => (
                  <div key={expert.id} className="browse-card"
                    style={{
                      background: dm_card, border: `1px solid ${dm_border}`,
                      borderRadius: 16, padding: "20px 18px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
                    }}
                  >
                    <div style={{
                      width: 70, height: 70, borderRadius: "50%",
                      background: "#B91C1C", overflow: "hidden",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, fontWeight: 700, color: "#fff",
                      marginBottom: 12, flexShrink: 0,
                      border: `3px solid ${dm ? "#374151" : "#FEF2F2"}`,
                    }}>
                      {expert.profilePhoto
                        ? <img src={getImageUrl(expert.profilePhoto) ?? ''} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        : `${expert.firstName?.[0] || ""}${expert.lastName?.[0] || ""}`}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: dm_text }}>{expert.fullName}</span>
                      {expert.verified && <span title="Vérifié" style={{ fontSize: 13 }}>✅</span>}
                    </div>

                    {expert.specialty && (
                      <p style={{ fontSize: 12, color: "#B91C1C", fontWeight: 600, margin: "0 0 4px" }}>
                        {expert.specialty}
                      </p>
                    )}
                    {expert.city && (
                      <p style={{ fontSize: 12, color: dm_sub, margin: "0 0 8px" }}>📍 {expert.city}</p>
                    )}
                    {expert.experienceYears !== undefined && expert.experienceYears > 0 && (
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 20,
                        background: dm ? "#1E3A5F" : "#EFF6FF",
                        color: dm ? "#93C5FD" : "#1D4ED8",
                        fontWeight: 600, marginBottom: 12,
                      }}>
                        {expert.experienceYears} ans d'expérience
                      </span>
                    )}

                    <button className="msg-btn"
                      onClick={() => navigate(`/messages/${expert.id}`, {
                        state: { providerName: expert.fullName, providerPhoto: expert.profilePhoto }
                      })}
                      style={{
                        marginTop: "auto", width: "100%",
                        padding: "9px 0", borderRadius: 10, border: "none",
                        background: "#B91C1C", color: "#fff",
                        fontWeight: 700, fontSize: 13, cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      💬 Contacter
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyState({ dm, label }: { dm: boolean; label: string }) {
  return (
    <div style={{
      gridColumn: "1 / -1", padding: "60px 0",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
    }}>
      <span style={{ fontSize: 48 }}>🔍</span>
      <p style={{ color: dm ? "#9CA3AF" : "#6B7280", fontSize: 15, margin: 0 }}>{label}</p>
    </div>
  );
}