import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../api/auth";

export function RegisterView() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectFrom = (location.state as { from?: { pathname?: string } })?.from?.pathname;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"CLIENT" | "PROVIDER">("CLIENT");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ email, password, firstName, lastName, role });
      navigate(redirectFrom || "/", { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 409) {
        setError("An account with this email already exists. Please sign in.");
      } else {
        setError(msg || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-red-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-800 rounded-full opacity-40 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <span className="text-white text-2xl font-extrabold tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            ServFast
          </span>
        </div>

        <div className="relative z-10">
          <h2 className="text-white text-4xl font-extrabold leading-tight mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
            Start your journey today
          </h2>
          <p className="text-red-100 text-base leading-relaxed mb-10">
            Join thousands of professionals and clients already using ServFast to get work done faster and smarter.
          </p>

          {/* Role explainer */}
          <div className="space-y-4">
            <div className="bg-white bg-opacity-10 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <div className="text-white font-bold text-sm mb-1">Join as a Client</div>
                <div className="text-red-200 text-xs">Find and hire top professionals for any project, fast and securely.</div>
              </div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">🛠️</span>
              <div>
                <div className="text-white font-bold text-sm mb-1">Join as a Provider</div>
                <div className="text-red-200 text-xs">Showcase your skills, grow your client base, and earn more.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-white bg-opacity-10 rounded-2xl p-6 border-l-4 border-white">
          <p className="text-red-100 text-sm italic leading-relaxed mb-4">
            "Signing up took 2 minutes. I had my first client within 3 days."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-sm">S</div>
            <div>
              <div className="text-white text-sm font-semibold">Sofia Müller</div>
              <div className="text-red-200 text-xs">Freelance Designer</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">

          <div className="lg:hidden mb-8 text-center">
            <span className="text-red-700 text-2xl font-extrabold" style={{ fontFamily: "'Sora', sans-serif" }}>ServFast</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Create your account</h1>
            <p className="text-gray-400 text-sm">Join ServFast — it's free</p>
          </div>

          {redirectFrom && (
            <div className="mb-5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 font-medium flex items-center gap-2">
              <span>ℹ️</span> Sign up to continue to {redirectFrom}
            </div>
          )}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {(["CLIENT", "PROVIDER"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                      role === r
                        ? "border-red-700 bg-red-50 text-red-700"
                        : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    {r === "CLIENT" ? "🔍 Hire talent" : "🛠️ Offer services"}
                  </button>
                ))}
              </div>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm outline-none transition-all focus:border-red-700 focus:bg-red-50 bg-gray-50 placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm outline-none transition-all focus:border-red-700 focus:bg-red-50 bg-gray-50 placeholder-gray-300"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm outline-none transition-all focus:border-red-700 focus:bg-red-50 bg-gray-50 placeholder-gray-300"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm outline-none transition-all focus:border-red-700 focus:bg-red-50 bg-gray-50 placeholder-gray-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm outline-none transition-all focus:border-red-700 focus:bg-red-50 bg-gray-50 placeholder-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-bold py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2 mt-2"
              style={{ boxShadow: "0 4px 14px rgba(192,0,27,0.35)" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account...
                </>
              ) : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate('/login')}
              className="text-red-700 font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}