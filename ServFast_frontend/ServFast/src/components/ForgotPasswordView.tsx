import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";

export function ForgotPasswordView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 404) {
        setError("No account found with this email address.");
      } else {
        setError(msg || "Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-8 bg-transparent border-none cursor-pointer p-0 transition-colors"
        >
          ← Back to sign in
        </button>

        {/* Icon */}
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
          🔐
        </div>

        {sent ? (
          /* Success state */
          <div>
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
              ✅
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
              Check your email
            </h1>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              We've sent a password reset link to <span className="font-semibold text-gray-700">{email}</span>. 
              Check your inbox and follow the instructions.
            </p>
            <p className="text-xs text-gray-400 mb-8">
              Didn't receive it? Check spam, or{" "}
              <button
                onClick={() => setSent(false)}
                className="text-red-700 font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                try again
              </button>.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "0 4px 14px rgba(192,0,27,0.35)" }}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          /* Form state */
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
              Forgot your password?
            </h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              No worries. Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-700 hover:bg-red-800 disabled:bg-red-400 text-white font-bold py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
                style={{ boxShadow: "0 4px 14px rgba(192,0,27,0.35)" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending...
                  </>
                ) : "Send reset link"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}