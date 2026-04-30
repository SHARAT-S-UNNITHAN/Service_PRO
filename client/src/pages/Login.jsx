// src/pages/Login.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = 'http://localhost:4000';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE}/login`, {
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      const redirectMap = {
        user: '/',
        provider: '/provider/dashboard',
        admin: '/admin/dashboard'
      };

      const destination = redirectMap[data.role] || '/';
      navigate(destination);

    } catch (err) {
      const serverData = err.response?.data || {};
      const status = err.response?.status;

      if (status === 403) {
        if (serverData.error === "account_rejected") {
          setError("Your provider application has been rejected by admin. Please contact support.");
        } else if (serverData.error === "account_pending") {
          setError("Your provider account is pending admin approval. You will be notified once verified.");
        } else if (serverData.error === "account_disabled") {
          setError("Your provider account has been disabled. Please contact support.");
        } else {
          setError(serverData.message || "Access denied. Please contact support.");
        }
      } else {
        setError(serverData.error || "Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Styles (consistent with ProvSignup & Signup)
  const label = "block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5";
  const inputBase = `
    w-full px-4 py-3.5 bg-white border border-gray-200 
    text-gray-900 placeholder:text-gray-400 text-sm
    focus:border-gray-400 focus:ring-0 focus:shadow-sm
    transition-all duration-200 rounded-lg
  `;
  const btn = `
    px-7 py-3 text-sm font-medium tracking-wide uppercase
    rounded-lg transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  const btnPrimary = `${btn} bg-neutral-900 text-white hover:bg-neutral-800 active:bg-black shadow-sm hover:shadow`;

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .step-content { animation: fadeInUp 0.5s ease-out forwards; }
      `}</style>

      <div className="min-h-screen bg-gray-50/40 flex flex-col lg:flex-row">
        {/* Left Decorative Panel */}
        <div
          className="hidden lg:flex lg:w-5/12 bg-cover bg-center items-center justify-center relative overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1581092160560-1c1e428e9d65?auto=format&fit=crop&q=80&w=2070')",
          }}
        >
          <div className="text-white text-center px-8 md:px-12">
            <h1 className="text-3xl md:text-4xl font-light mb-5 tracking-wide">Welcome Back</h1>
            <p className="text-base md:text-lg opacity-90 max-w-md mx-auto">
              Sign in to access your account and connect with trusted service providers.
            </p>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-10 lg:px-16 py-8 lg:py-12">
          <div className="w-full max-w-lg">
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl font-semibold text-neutral-900">Sign In</div>
              </div>
              <h2 className="text-3xl font-light text-neutral-900">Login to your account</h2>
              <div className="w-12 h-0.5 bg-neutral-300 rounded mt-3"></div>
            </div>

            {error && (
              <div className={`mb-6 p-4 rounded-xl text-sm border ${
                error.toLowerCase().includes('rejected') || error.toLowerCase().includes('disabled')
                  ? 'bg-red-50 border-red-300 text-red-800'
                  : error.toLowerCase().includes('pending')
                    ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                    : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <div className="step-content">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={label}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputBase}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className={label}>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={inputBase}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`${btnPrimary} w-full flex items-center justify-center gap-2 mt-4`}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>

            {/* Links Section */}
            <div className="mt-8 text-sm text-gray-600 space-y-3">
              <div className="flex justify-between">
                <Link to="/forgot-password" className="hover:text-neutral-900 transition">
                  Forgot password?
                </Link>
              </div>

              <div className="text-center">
                Don't have an account?{" "}
                <Link to="/signup" className="text-neutral-900 font-medium hover:underline">
                  Sign up as Customer
                </Link>
              </div>

              {/* New: Provider Signup Link */}
              <div className="text-center">
                Want to offer services?{" "}
                <Link to="/provider/register" className="text-neutral-900 font-medium hover:underline">
                  Sign up as Provider
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}