import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { enterpriseApi, Enterprise } from "../api/EnterpriseAPI";

const FEATURES = [
  { icon: "🏢", title: "Dedicated Account Manager",  desc: "A single point of contact who knows your business inside out and coordinates all your service needs." },
  { icon: "⚡", title: "Priority Matching",           desc: "Get matched with top-rated experts in under 2 hours. No waiting, no searching — we do it for you." },
  { icon: "📊", title: "Analytics Dashboard",         desc: "Track spending, service history, provider ratings and team usage from one centralized dashboard." },
  { icon: "🔒", title: "Compliance & Security",       desc: "Enterprise-grade contracts, NDAs, insurance coverage and GDPR-compliant data handling included." },
  { icon: "💳", title: "Unified Billing",             desc: "One monthly invoice for all services. Custom payment terms and purchase order support available." },
  { icon: "🌍", title: "Multi-location Support",      desc: "Need services across multiple cities or countries? We coordinate providers at every location." },
];

const STATS = [
  { value: "2,400+", label: "Enterprise clients" },
  { value: "98%",    label: "Satisfaction rate"  },
  { value: "<2h",    label: "Average match time" },
  { value: "50+",    label: "Service categories" },
];

// ── Skeleton pendant le chargement ──
function SkeletonCard({ dm }: { dm: boolean }) {
  const bg = dm ? "#374151" : "#F3F4F6";
  return (
    <div style={{ borderRadius: 20, overflow: "hidden", background: dm ? "#1F2937" : "#fff", border: `1px solid ${dm ? "#374151" : "#E5E7EB"}`, animation: "pulse 1.5s ease-in-out infinite" }}>
      <div style={{ height: 180, background: bg }} />
      <div style={{ padding: 20 }}>
        <div style={{ height: 16, width: "60%", background: bg, borderRadius: 8, marginBottom: 10 }} />
        <div style={{ height: 12, width: "40%", background: bg, borderRadius: 8, marginBottom: 8 }} />
        <div style={{ height: 12, width: "90%", background: bg, borderRadius: 8 }} />
      </div>
    </div>
  );
}

// ── Card entreprise ──
function EnterpriseCard({ enterprise, dm }: { enterprise: Enterprise; dm: boolean }) {
  const [hovered, setHovered] = useState(false);
  const text   = dm ? "#F9FAFB" : "#111827";
  const muted  = dm ? "#9CA3AF" : "#6B7280";
  const redL   = dm ? "#DC2626" : "#B91C1C";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => enterprise.websiteUrl && window.open(enterprise.websiteUrl, "_blank")}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        background: dm ? "#1F2937" : "#fff",
        border: `1px solid ${dm ? "#374151" : "#E5E7EB"}`,
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.12)" : "none",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease",
        cursor: enterprise.websiteUrl ? "pointer" : "default",
      }}
    >
      {/* Image bannière */}
      <div style={{ position: "relative", height: 180, overflow: "hidden", background: dm ? "#374151" : "#F3F4F6" }}>
        {enterprise.imageUrl ? (
          <img
            src={enterprise.imageUrl}
            alt={enterprise.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.05)" : "scale(1)", transition: "transform 0.4s ease" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 48, opacity: 0.3 }}>🏢</span>
          </div>
        )}
        {/* Badge secteur */}
        {enterprise.sector && (
          <span style={{ position: "absolute", top: 12, left: 12, padding: "4px 12px", borderRadius: 9999, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 12, fontWeight: 600, backdropFilter: "blur(4px)" }}>
            {enterprise.sector}
          </span>
        )}
      </div>

      {/* Contenu */}
      <div style={{ padding: "20px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          {enterprise.logoUrl && (
            <img src={enterprise.logoUrl} alt={`${enterprise.name} logo`} style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
          )}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: text, fontFamily: "'Sora', sans-serif" }}>
              {enterprise.name}
            </h3>
            <p style={{ fontSize: 12, color: muted, margin: "2px 0 0" }}>
              {enterprise.city && `📍 ${enterprise.city}`}
              {enterprise.employeeCount && <span style={{ marginLeft: 10 }}>👥 {enterprise.employeeCount} employés</span>}
            </p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: muted, lineHeight: 1.6, margin: "0 0 16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {enterprise.description}
        </p>

        {enterprise.websiteUrl && (
          <span style={{ fontSize: 13, color: redL, fontWeight: 600 }}>Visiter le site →</span>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  PAGE PRINCIPALE
// ══════════════════════════════════════════
export default function EnterprisePage() {
  const { darkMode: dm } = useTheme();
  const navigate = useNavigate();

  const [enterprises, setEnterprises]   = useState<Enterprise[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState("Tous");
  const [cityFilter, setCityFilter] = useState("Tous");

  const bg    = dm ? "#111827" : "#ffffff";
  const bg2   = dm ? "#1F2937" : "#F9FAFB";
  const text  = dm ? "#F9FAFB" : "#111827";
  const muted = dm ? "#9CA3AF" : "#6B7280";
  const border= dm ? "#374151" : "#E5E7EB";
  const redL  = dm ? "#DC2626" : "#B91C1C";

  // ── Fetch API ──
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await enterpriseApi.getAll();
        setEnterprises(data);
      } catch {
        setError("Impossible de charger les entreprises. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sectors  = ["Tous", ...Array.from(new Set(enterprises.map(e => e.sector).filter(Boolean)))];
  const cities   = ["Tous", ...Array.from(new Set(enterprises.map(e => e.city).filter(Boolean)))];
  
  const filtered = enterprises.filter(e => {
    const matchesSector = sectorFilter === "Tous" || e.sector === sectorFilter;
    const matchesCity   = cityFilter === "Tous" || e.city === cityFilter;
    return matchesSector && matchesCity;
  });

  return (
    <div style={{ background: bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: text }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      <Navbar />

      {/* ── HERO ── */}
      <section style={{ padding: "96px 64px 80px", textAlign: "center", background: dm ? "linear-gradient(135deg,#111827 0%,#1a0a0a 100%)" : "linear-gradient(135deg,#fff 0%,#FEF2F2 100%)", borderBottom: `1px solid ${border}` }}>
        <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 9999, background: dm ? "#450A0A" : "#FEF2F2", color: redL, fontSize: 13, fontWeight: 700, marginBottom: 20, letterSpacing: "0.04em" }}>
          ENTERPRISE SOLUTIONS
        </span>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(36px,5vw,60px)", fontWeight: 800, lineHeight: 1.12, maxWidth: 760, margin: "0 auto 20px" }}>
          Scale Your Business with <br /><span style={{ color: redL }}>Trusted Experts</span>
        </h1>
        <p style={{ fontSize: 18, color: muted, maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          ServFast Enterprise gives your team unlimited access to vetted professionals, priority scheduling, and a dedicated support team.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/register")} style={{ padding: "14px 32px", borderRadius: 12, border: "none", cursor: "pointer", background: redL, color: "#fff", fontSize: 16, fontWeight: 700, boxShadow: "0 4px 16px rgba(185,28,28,0.35)" }}>
            Get Started Free
          </button>
          <button onClick={() => document.getElementById("contact-sales")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "14px 32px", borderRadius: 12, border: `1.5px solid ${border}`, cursor: "pointer", background: "transparent", color: text, fontSize: 16, fontWeight: 600 }}>
            Contact Sales
          </button>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: redL, padding: "48px 64px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }}>
        {STATS.map(({ value, label }) => (
          <div key={label}>
            <p style={{ fontSize: 40, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'Sora',sans-serif" }}>{value}</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: "4px 0 0" }}>{label}</p>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "80px 64px", background: bg }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 36, fontWeight: 800, margin: "0 0 12px" }}>Everything your team needs</h2>
          <p style={{ fontSize: 16, color: muted, maxWidth: 500, margin: "0 auto" }}>Built for teams that need reliability, speed, and control at scale.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} style={{ background: dm ? "#1F2937" : "#fff", border: `1px solid ${border}`, borderRadius: 16, padding: "28px 28px 32px", transition: "box-shadow 0.2s,transform 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <span style={{ fontSize: 32, display: "block", marginBottom: 16 }}>{icon}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: text }}>{title}</h3>
              <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
           ENTREPRISES DYNAMIQUES DEPUIS LA BDD
         ══════════════════════════════════════ */}
      <section style={{ padding: "80px 64px", background: bg2 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 36, fontWeight: 800, margin: "0 0 12px" }}>
            Nos entreprises partenaires
          </h2>
          <p style={{ fontSize: 16, color: muted }}>
            Des entreprises de confiance qui font appel à ServFast au quotidien.
          </p>
        </div>

        {/* Filtres secteur et ville */}
        {!loading && enterprises.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", marginBottom: 40 }}>
            {/* Secteur */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {sectors.map(sector => (
                <button
                  key={sector}
                  onClick={() => setSectorFilter(sector)}
                  style={{ padding: "7px 18px", borderRadius: 9999, border: `1.5px solid ${sectorFilter === sector ? redL : border}`, cursor: "pointer", background: sectorFilter === sector ? redL : "transparent", color: sectorFilter === sector ? "#fff" : muted, fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}
                >
                  {sector}
                </button>
              ))}
            </div>

            {/* Ville */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: muted }}>Filtrer par Ville :</span>
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: `1.5px solid ${border}`,
                  background: dm ? "#1F2937" : "#fff",
                  color: text,
                  fontSize: 13,
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} dm={dm} />)}
          </div>
        )}

        {/* Erreur */}
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
            <p style={{ color: muted, fontSize: 16 }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", background: redL, color: "#fff", fontWeight: 600 }}>
              Réessayer
            </button>
          </div>
        )}

        {/* Vide */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🏢</p>
            <p style={{ color: muted, fontSize: 16 }}>Aucune entreprise trouvée pour ce secteur.</p>
          </div>
        )}

        {/* Grille */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
              {filtered.map(e => <EnterpriseCard key={e.id} enterprise={e} dm={dm} />)}
            </div>
            <p style={{ textAlign: "center", color: muted, fontSize: 13, marginTop: 32 }}>
              {filtered.length} entreprise{filtered.length > 1 ? "s" : ""} partenaire{filtered.length > 1 ? "s" : ""}
            </p>
          </>
        )}
      </section>

      {/* ── CONTACT SALES ── */}
      <section id="contact-sales" style={{ padding: "80px 64px", textAlign: "center", background: bg, borderTop: `1px solid ${border}` }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 36, fontWeight: 800, margin: "0 0 16px" }}>
          Ready to scale with ServFast?
        </h2>
        <p style={{ fontSize: 16, color: muted, maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Notre équipe vous contactera sous 24h pour discuter de vos besoins et construire un plan sur mesure.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", maxWidth: 520, margin: "0 auto" }}>
          <input type="text"  placeholder="Votre nom complet"      style={{ flex: 1, minWidth: 200, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${border}`, background: dm ? "#1F2937" : "#fff", color: text, fontSize: 14, outline: "none" }} />
          <input type="email" placeholder="Email professionnel"    style={{ flex: 1, minWidth: 200, padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${border}`, background: dm ? "#1F2937" : "#fff", color: text, fontSize: 14, outline: "none" }} />
          <button style={{ padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", background: redL, color: "#fff", fontSize: 15, fontWeight: 700, boxShadow: "0 4px 16px rgba(185,28,28,0.3)", whiteSpace: "nowrap" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
            Contacter l'équipe →
          </button>
        </div>
      </section>
    </div>
  );
}