// src/pages/Signup.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:4000";

export default function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    landmark: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const validateCurrentStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    }

    if (step === 2) {
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone number must be exactly 10 digits";
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!agreeTerms) newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep(step + 1);
      setServerError("");
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    setServerError("");
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    setServerError("");

    try {
      await axios.post(`${API}/signup`, {
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        landmark: formData.landmark.trim() || null,
      });

      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      const errMsg = err.response?.data?.error || "Signup failed. Please try again.";
      setServerError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Styles (same as ProvSignup)
  const label = "block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5";
  const inputBase = `
    w-full px-4 py-3.5 bg-white border border-gray-200 
    text-gray-900 placeholder:text-gray-400 text-sm
    focus:border-gray-400 focus:ring-0 focus:shadow-sm
    transition-all duration-200 rounded-lg
  `;
  const textareaBase = `${inputBase} resize-y min-h-[110px]`;
  const btn = `
    px-7 py-3 text-sm font-medium tracking-wide uppercase
    rounded-lg transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  const btnPrimary = `${btn} bg-neutral-900 text-white hover:bg-neutral-800 active:bg-black shadow-sm hover:shadow`;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className={label}>Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`${inputBase} ${errors.full_name ? "border-red-400" : ""}`}
                placeholder="Enter your full name"
              />
              {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
            </div>

            <div>
              <label className={label}>Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${inputBase} ${errors.email ? "border-red-400" : ""}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className={label}>Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${inputBase} ${errors.password ? "border-red-400" : ""}`}
                placeholder="Minimum 8 characters"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className={label}>Phone Number <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                className={`${inputBase} ${errors.phone ? "border-red-400" : ""}`}
                placeholder="10-digit mobile number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className={label}>Full Address <span className="text-red-500">*</span></label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`${textareaBase} ${errors.address ? "border-red-400" : ""}`}
                placeholder="House name, street, landmark, PIN code..."
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div>
              <label className={label}>Landmark (optional)</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className={inputBase}
                placeholder="Near bus stop, temple, school, etc."
              />
            </div>

            <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span>
                I agree to the{" "}
                <Link to="#" className="text-black underline hover:no-underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="#" className="text-black underline hover:no-underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.agreeTerms && <p className="text-sm text-red-600">{errors.agreeTerms}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .step-content {
          animation: fadeInUp 0.5s ease-out forwards;
        }
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
            <h1 className="text-3xl md:text-4xl font-light mb-5 tracking-wide">Create Your Account</h1>
            <p className="text-base md:text-lg opacity-90 max-w-md mx-auto">
              Join our trusted service network and find the best professionals near you.
            </p>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-10 lg:px-16 py-8 lg:py-12">
          <div className="w-full max-w-lg">
            {/* Progress */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl font-semibold text-neutral-900">{step}</div>
                <div className="text-xl text-neutral-400">/ {totalSteps}</div>
              </div>
              <h2 className="text-3xl font-light text-neutral-900">
                {step === 1 ? "Basic Information" : "Contact & Security"}
              </h2>
              <div className="w-12 h-0.5 bg-neutral-300 rounded mt-3"></div>
            </div>

            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl">
                {serverError}
              </div>
            )}

            <div className="step-content mb-10">{renderStep()}</div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className={`${btn} bg-gray-200 text-gray-800 hover:bg-gray-300`}
                >
                  ← Back
                </button>
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={`${btnPrimary} ml-auto`}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !agreeTerms}
                  className={`${btnPrimary} ml-auto flex items-center gap-2`}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              )}
            </div>

            <p className="text-center mt-8 text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-neutral-900 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}