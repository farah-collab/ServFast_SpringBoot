import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../api/auth";

export function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectFrom = (location.state as { from?: { pathname?: string } })?.from?.pathname;
  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.login({ email, password });
      navigate(redirectFrom || "/", { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 401) {
        setError("Incorrect email or password. Please try again.");
      } else if (err.response?.status === 404) {
        setError("No account found with this email. Please sign up.");
      } else {
        setError(msg || "Login failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-1/2 bg-red-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-800 rounded-full opacity-40 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <span
            className="text-white text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            ServFast
          </span>
        </div>

        <div className="relative z-10">
          <h2
            className="text-white text-4xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Connect with the world's best professionals
          </h2>
          <p className="text-red-100 text-base leading-relaxed mb-10">
            Access thousands of verified experts in IT, Design, Legal, Health and more. Fast, secure, and reliable.
          </p>

          <div className="grid grid-cols-3 gap-6">
            {[
              { value: "12K+", label: "Professionals" },
              { value: "98%", label: "Satisfaction" },
              { value: "50K+", label: "Projects Done" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white bg-opacity-10 rounded-2xl p-4 text-center">
                <div className="text-white text-2xl font-extrabold mb-1">{stat.value}</div>
                <div className="text-red-200 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white bg-opacity-10 rounded-2xl p-6 border-l-4 border-white">
          <p className="text-red-100 text-sm italic leading-relaxed mb-4">
            "ServFast completely changed how we hire. We found our entire dev team in under a week."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-sm">A</div>
            <div>
              <div className="text-white text-sm font-semibold">Alex Morgan</div>
              <div className="text-red-200 text-xs">CTO at TechVentures</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">

          <div className="lg:hidden mb-8 text-center">
            <span className="text-red-700 text-2xl font-extrabold" style={{ fontFamily: "'Sora', sans-serif" }}>
              ServFast
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
              Welcome back
            </h1>
            <p className="text-gray-400 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Error Banner */}
          {isExpired && (
            <div className="mb-5 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 font-medium flex items-center gap-2">
              <span>⚠️</span> Session expired. Please sign in again.
            </div>
          )}
          {redirectFrom && !error && (
            <div className="mb-5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 font-medium flex items-center gap-2">
              <span>ℹ️</span> Sign in to continue to {redirectFrom}
            </div>
          )}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm outline-none transition-all duration-200 focus:border-red-700 focus:bg-red-50 bg-gray-50 placeholder-gray-300"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-red-700 font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm outline-none transition-all duration-200 focus:border-red-700 focus:bg-red-50 bg-gray-50 placeholder-gray-300 pr-12"
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

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 accent-red-700 cursor-pointer" />
              <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer">Remember me for 30 days</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
              style={{ boxShadow: "0 4px 14px rgba(192,0,27,0.35)" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : "Sign in to ServFast"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{" "}
            <button
              onClick={() => navigate('/register')}
              className="text-red-700 font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
            >
              Sign up for free
            </button>
          </p>

          <p className="text-center text-xs text-gray-300 mt-6">© 2024 ServFast Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}