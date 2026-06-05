import { useNavigate, Link, useLocation } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { notificationsApi, Notification } from "../../api/notifications";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authApi.getCurrentUser();
  const { darkMode, toggleDarkMode } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const loadNotifications = async () => {
      try {
        const list = await notificationsApi.getAll();
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.isRead).length);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    authApi.logout();
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const getInitials = () => {
    if (!user) return "?";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  const dm = darkMode;

  const navLinks = [
    { label: "Browse",     to: "/browse"     },
    { label: "Services",   to: "/services"   },
    { label: "Enterprise", to: "/enterprise" },
  ];

  const getDropdownItems = () => {
    const items = [
      { label: "👤  My Profile",  path: "/profile"  },
      { label: "💬  Messages",    path: "/messages" },
    ];
    if (user?.role === "PROVIDER") items.push({ label: "🛠️  Provider Dashboard", path: "/provider" });
    if (user?.role === "ADMIN")    items.push({ label: "⚙️  Admin Panel", path: "/admin" });
    return items;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .nav-link-item { transition: color 0.2s, transform 0.15s; }
        .nav-link-item:hover { transform: translateY(-1px); }
        .nav-search-bar {
          transition: box-shadow 0.2s, border-color 0.2s, width 0.3s;
        }
        .nav-search-bar.focused {
          box-shadow: 0 0 0 3px rgba(185,28,28,0.15);
        }
        .nav-btn-icon {
          transition: background 0.2s, transform 0.15s;
        }
        .nav-btn-icon:hover { transform: scale(1.08); }
        .nav-avatar-btn {
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .nav-avatar-btn:hover {
          box-shadow: 0 0 0 3px rgba(185,28,28,0.35);
          transform: scale(1.05);
        }
        .nav-dropdown-item {
          transition: background 0.15s, padding-left 0.15s;
        }
        .nav-dropdown-item:hover { padding-left: 20px !important; }
        .notif-item { transition: background 0.15s; }
        .join-btn { transition: background 0.2s, box-shadow 0.2s, transform 0.15s; }
        .join-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(185,28,28,0.4) !important; }
      `}</style>

      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: dm ? "1px solid #1F2937" : "1px solid #F3F4F6",
        boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
        background: dm ? "#111827" : "#ffffff",
        transition: "background 0.3s",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          height: 64,
          gap: 24,
        }}>

          {/* ── Logo ── */}
          <Link to="/" style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: dm ? "#F87171" : "#B91C1C",
            textDecoration: "none",
            letterSpacing: "-0.02em",
            flexShrink: 0,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            ServFast
          </Link>

          {/* ── Nav Links ── */}
          <div style={{ display: "flex", gap: 28, alignItems: "center", flexShrink: 0 }}>
            {navLinks.map(({ label, to }) => {
              const isActive = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className="nav-link-item"
                  style={{
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#B91C1C" : dm ? "#D1D5DB" : "#6B7280",
                    textDecoration: "none",
                    position: "relative",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#B91C1C"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = dm ? "#D1D5DB" : "#6B7280"; }}
                >
                  {label}
                  {isActive && (
                    <span style={{
                      position: "absolute",
                      bottom: -4,
                      left: 0,
                      right: 0,
                      height: 2,
                      borderRadius: 2,
                      background: "#B91C1C",
                    }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Search Bar (centre) ── */}
          <form
            onSubmit={handleSearch}
            style={{ flex: 1, maxWidth: 380, minWidth: 0 }}
          >
            <div
              className={`nav-search-bar${searchFocused ? " focused" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                border: searchFocused
                  ? "1.5px solid #B91C1C"
                  : dm ? "1.5px solid #374151" : "1.5px solid #E5E7EB",
                borderRadius: 12,
                background: dm ? "#1F2937" : "#F9FAFB",
                overflow: "hidden",
                height: 40,
              }}
            >
              <span style={{
                paddingLeft: 12,
                paddingRight: 6,
                color: dm ? "#6B7280" : "#9CA3AF",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search services, experts..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: dm ? "#F3F4F6" : "#111827",
                  padding: "0 8px 0 0",
                  minWidth: 0,
                }}
              />
              {searchQuery && (
                <button
                  type="submit"
                  style={{
                    height: "100%",
                    padding: "0 14px",
                    background: "#B91C1C",
                    border: "none",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#991B1B"}
                  onMouseLeave={e => e.currentTarget.style.background = "#B91C1C"}
                >
                  Go
                </button>
              )}
            </div>
          </form>

          {/* ── Right Side ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>

            {/* Dark mode toggle */}
            <button
              className="nav-btn-icon"
              onClick={toggleDarkMode}
              title={dm ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                width: 38, height: 38, borderRadius: 10, border: "none",
                cursor: "pointer", fontSize: 15, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: dm ? "#1F2937" : "#F3F4F6",
                color: dm ? "#FBBF24" : "#4B5563",
              }}
            >
              {dm ? "☀️" : "🌙"}
            </button>

            {/* Notifications */}
            {user && (
              <div style={{ position: "relative" }}>
                <button
                  className="nav-btn-icon"
                  onClick={() => { setShowNotifMenu(!showNotifMenu); setShowProfileMenu(false); }}
                  title="Notifications"
                  style={{
                    width: 38, height: 38, borderRadius: 10, border: "none",
                    cursor: "pointer", fontSize: 16, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: dm ? "#1F2937" : "#F3F4F6",
                    color: dm ? "#D1D5DB" : "#4B5563",
                    position: "relative",
                  }}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span style={{
                      position: "absolute", top: -3, right: -3,
                      background: "#EF4444", color: "#fff",
                      fontSize: 10, fontWeight: 700, borderRadius: "50%",
                      width: 17, height: 17, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      border: dm ? "2px solid #111827" : "2px solid #fff",
                    }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setShowNotifMenu(false)} />
                    <div style={{
                      position: "absolute", right: 0, top: "calc(100% + 8px)",
                      width: 320, maxHeight: 400, borderRadius: 16,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 200,
                      display: "flex", flexDirection: "column", overflow: "hidden",
                      border: dm ? "1px solid #374151" : "1px solid #E5E7EB",
                      background: dm ? "#1F2937" : "#fff",
                    }}>
                      <div style={{
                        padding: "12px 16px", display: "flex",
                        alignItems: "center", justifyContent: "space-between",
                        borderBottom: dm ? "1px solid #374151" : "1px solid #E5E7EB",
                      }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: dm ? "#fff" : "#111827" }}>
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllAsRead} style={{
                            background: "none", border: "none", color: "#EF4444",
                            fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0,
                          }}>
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div style={{ overflowY: "auto", flex: 1 }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: "24px 16px", textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: 13, color: dm ? "#9CA3AF" : "#6B7280" }}>
                              No notifications yet
                            </p>
                          </div>
                        ) : notifications.map(notif => {
                          const icon = notif.type === "PAYMENT" ? "💳" : notif.type === "BOOKING" ? "📅" : notif.type === "CONTACT" ? "💬" : "🔔";
                          return (
                            <div
                              key={notif.id}
                              className="notif-item"
                              onClick={() => handleMarkAsRead(notif.id)}
                              style={{
                                padding: "12px 16px", display: "flex", gap: 12,
                                cursor: "pointer",
                                borderBottom: dm ? "1px solid #374151" : "1px solid #F3F4F6",
                                background: !notif.isRead
                                  ? dm ? "rgba(239,68,68,0.08)" : "rgba(185,28,28,0.05)"
                                  : "transparent",
                              }}
                            >
                              <span style={{ fontSize: 18, alignSelf: "flex-start" }}>{icon}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  margin: "0 0 4px 0", fontSize: 12, lineHeight: "1.4",
                                  fontWeight: !notif.isRead ? 600 : 400,
                                  color: dm ? "#F3F4F6" : "#374151", wordBreak: "break-word",
                                }}>
                                  {notif.message}
                                </p>
                                <span style={{ fontSize: 10, color: "#9CA3AF" }}>
                                  {new Date(notif.createdAt).toLocaleDateString()} at{" "}
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              {!notif.isRead && (
                                <span style={{
                                  width: 6, height: 6, borderRadius: "50%",
                                  background: "#EF4444", alignSelf: "center",
                                }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Avatar / Auth buttons */}
            {user ? (
              <div style={{ position: "relative" }}>
                <button
                  className="nav-avatar-btn"
                  onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}
                  style={{
                    width: 38, height: 38, borderRadius: "50%", border: "none",
                    cursor: "pointer", background: dm ? "#DC2626" : "#B91C1C",
                    color: "#fff", fontWeight: 700, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                  }}
                  title="Your profile"
                >
                  {user.avatarUrl || user.profilePhoto ? (
                    <img
                      src={user.avatarUrl || user.profilePhoto}
                      alt="Profile"
                      style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : getInitials()}
                </button>

                {showProfileMenu && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setShowProfileMenu(false)} />
                    <div style={{
                      position: "absolute", right: 0, top: "calc(100% + 8px)",
                      width: 220, borderRadius: 16,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 200,
                      overflow: "hidden",
                      border: dm ? "1px solid #374151" : "1px solid #F3F4F6",
                      background: dm ? "#1F2937" : "#fff",
                    }}>
                      <div style={{
                        padding: "12px 16px",
                        borderBottom: dm ? "1px solid #374151" : "1px solid #F3F4F6",
                      }}>
                        <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: dm ? "#fff" : "#111827" }}>
                          {user.firstName} {user.lastName}
                        </p>
                        <p style={{
                          fontSize: 12, margin: "2px 0 6px",
                          color: dm ? "#9CA3AF" : "#6B7280",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {user.email}
                        </p>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 9999,
                          background: user.role === "PROVIDER" ? dm ? "#1E3A5F" : "#EFF6FF"
                            : user.role === "ADMIN" ? dm ? "#1F2937" : "#F3F4F6"
                            : dm ? "#450A0A" : "#FEF2F2",
                          color: user.role === "PROVIDER" ? dm ? "#93C5FD" : "#1D4ED8"
                            : user.role === "ADMIN" ? dm ? "#D1D5DB" : "#374151"
                            : dm ? "#FCA5A5" : "#B91C1C",
                        }}>
                          {user.role}
                        </span>
                      </div>

                      {getDropdownItems().map(({ label, path }) => (
                        <button
                          key={path}
                          className="nav-dropdown-item"
                          onClick={() => { navigate(path); setShowProfileMenu(false); }}
                          style={{
                            width: "100%", textAlign: "left", padding: "10px 16px",
                            fontSize: 14, border: "none", cursor: "pointer",
                            background: dm ? "#1F2937" : "#fff",
                            color: dm ? "#E5E7EB" : "#374151",
                          }}
                        >
                          {label}
                        </button>
                      ))}

                      <button
                        className="nav-dropdown-item"
                        onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                        style={{
                          width: "100%", textAlign: "left", padding: "10px 16px",
                          fontSize: 14, fontWeight: 600, border: "none",
                          borderTop: dm ? "1px solid #374151" : "1px solid #F3F4F6",
                          cursor: "pointer",
                          background: dm ? "#1F2937" : "#fff",
                          color: dm ? "#F87171" : "#B91C1C",
                        }}
                      >
                        🚪  Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    fontSize: 14, fontWeight: 500,
                    color: dm ? "#D1D5DB" : "#6B7280",
                    textDecoration: "none", transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#B91C1C"}
                  onMouseLeave={e => e.currentTarget.style.color = dm ? "#D1D5DB" : "#6B7280"}
                >
                  Sign In
                </Link>
                <button
                  className="join-btn"
                  onClick={() => navigate("/register")}
                  style={{
                    fontSize: 14, fontWeight: 700, padding: "8px 20px",
                    borderRadius: 10, border: "none", cursor: "pointer",
                    background: dm ? "#DC2626" : "#B91C1C",
                    color: "#fff", boxShadow: "0 3px 10px rgba(192,0,27,0.3)",
                  }}
                >
                  Join
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}