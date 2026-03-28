// src/pages/ProvSignup.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:4000";

export default function ProvSignup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    address: "",
    district: "",
    region: "",
    description: "",
    professions: [], // ← array of selected services
  });

  const [currentProfession, setCurrentProfession] = useState("");

  // File states
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [license, setLicense] = useState(null);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const professionOptions = [
    "Plumber",
    "Electrician",
    "Carpenter",
    "AC Technician / Refrigeration",
    "Home Painter",
    "Pest Control Specialist",
    "Appliance Repair",
    "Handyman",
    "Mason / Tile Work",
    "Welder",
    "Deep Cleaning",
    "Beautician",
    "Massage",
    "Laundry Services",
    "Home Tutor",
    "Packers & Movers",
    "Other",
  ];

  const keralaDistricts = [
    "Thiruvananthapuram",
    "Kollam",
    "Pathanamthitta",
    "Alappuzha",
    "Kottayam",
    "Idukki",
    "Ernakulam",
    "Thrissur",
    "Palakkad",
    "Malappuram",
    "Kozhikode",
    "Wayanad",
    "Kannur",
    "Kasaragod",
  ];

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const addProfession = () => {
    if (!currentProfession) return;
    if (form.professions.includes(currentProfession)) return;

    setForm((prev) => ({
      ...prev,
      professions: [...prev.professions, currentProfession],
    }));
    setCurrentProfession("");
  };

  const removeProfession = (profession) => {
    setForm((prev) => ({
      ...prev,
      professions: prev.professions.filter((p) => p !== profession),
    }));
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!form.username.trim()) return "Username is required";
      if (!form.fullName.trim()) return "Full name is required";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "Valid email is required";
      if (!/^\d{10}$/.test(form.phone)) return "Phone must be 10 digits";
      if (form.password.length < 8) return "Password must be at least 8 characters";
      if (form.password !== form.confirmPassword) return "Passwords do not match";
    }
    if (step === 2) {
      if (!form.district) return "District is required";
      if (!form.region.trim()) return "Region / locality is required";
      if (!form.address.trim()) return "Address is required";
    }
    if (step === 3) {
      if (form.professions.length === 0) return "Please select at least one service";
    }
    if (step === 4) {
      if (!agreeTerms) return "You must agree to the terms and conditions";
    }
    return "";
  };

  const nextStep = () => {
    const err = validateCurrentStep();
    if (err) return setError(err);
    if (step < totalSteps) setStep(step + 1);
    setError("");
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    setError("");
  };

  const handleSubmit = async () => {
    const err = validateCurrentStep();
    if (err) return setError(err);

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      // Text fields
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("fullName", form.fullName);
      formData.append("phone", form.phone);
      formData.append("district", form.district);
      formData.append("region", form.region);
      formData.append("address", form.address);
      formData.append("description", form.description.trim());

      // Professions as JSON string
      formData.append("professions", JSON.stringify(form.professions));

      // Files
      if (profilePhoto) formData.append("profilePhoto", profilePhoto);
      if (idProof) formData.append("idProof", idProof);
      if (license) formData.append("license", license);

      const response = await axios.post(`${API}/provider/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Provider account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      const serverError = err.response?.data?.error || "Failed to create account";
      setError(serverError);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Styles ──────────────────────────────────────────────────────────────────
  const label = "block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5";
  const inputBase = `
    w-full px-4 py-3.5 bg-white border border-gray-200 
    text-gray-900 placeholder:text-gray-400 text-sm
    focus:border-gray-400 focus:ring-0 focus:shadow-sm
    transition-all duration-200 rounded-lg
  `;
  const textareaBase = `${inputBase} resize-y min-h-[110px]`;
  const selectBase = `
    w-full px-4 py-3.5 bg-white border border-gray-200 text-sm
    focus:border-gray-400 focus:ring-0 appearance-none
    rounded-lg cursor-pointer transition-all
  `;
  const tag = `
    inline-flex items-center gap-1.5 px-3.5 py-1.5 
    bg-gray-100 text-gray-800 text-xs font-medium
    rounded-lg
  `;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { name: "username", label: "Username", type: "text" },
              { name: "fullName", label: "Full Name", type: "text" },
              { name: "email", label: "Email", type: "email" },
              { name: "phone", label: "Phone", type: "tel", placeholder: "10-digit number" },
              { name: "password", label: "Password", type: "password" },
              { name: "confirmPassword", label: "Confirm Password", type: "password" },
            ].map((f) => (
              <div key={f.name}>
                <label className={label}>{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder || ""}
                  className={inputBase}
                  autoComplete={f.name.includes("password") ? "new-password" : undefined}
                />
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={label}>District</label>
                <div className="relative">
                  <select name="district" value={form.district} onChange={handleChange} className={selectBase}>
                    <option value="">Select district</option>
                    {keralaDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</span>
                </div>
              </div>

              <div>
                <label className={label}>Region / Locality</label>
                <input
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="e.g. Kollam town, Anchal, etc."
                  className={inputBase}
                />
              </div>
            </div>

            <div>
              <label className={label}>Full Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="House name, street, landmark, PIN code"
                className={textareaBase}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-7">
            <div>
              <label className={label}>Services You Provide (select all that apply)</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select
                    value={currentProfession}
                    onChange={(e) => setCurrentProfession(e.target.value)}
                    className={selectBase}
                  >
                    <option value="">Choose a service</option>
                    {professionOptions
                      .filter((p) => !form.professions.includes(p))
                      .map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</span>
                </div>
                <button
                  type="button"
                  onClick={addProfession}
                  disabled={!currentProfession}
                  className={`${btn} ${
                    currentProfession
                      ? "bg-neutral-800 text-white hover:bg-neutral-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  Add
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 min-h-[44px]">
                {form.professions.length === 0 ? (
                  <span className="text-sm text-gray-400 italic">No services selected yet</span>
                ) : (
                  form.professions.map((p) => (
                    <div key={p} className={`${tag} animate-pop`}>
                      {p}
                      <button
                        onClick={() => removeProfession(p)}
                        className="ml-1 text-gray-500 hover:text-gray-800 text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className={label}>About You / Experience</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Years of experience, special skills, certifications..."
                className={textareaBase}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Verification Documents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">

                {/* Profile Photo */}
                <label className="border border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => setProfilePhoto(e.target.files[0] || null)}
                    className="hidden"
                  />
                  <div className="text-3xl mb-3 text-gray-400">+</div>
                  <p className="text-sm font-medium text-gray-700">Profile Photo</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG • max 5 MB</p>
                  {profilePhoto && (
                    <p className="text-xs text-green-600 mt-2 truncate max-w-[180px] mx-auto">
                      {profilePhoto.name}
                    </p>
                  )}
                </label>

                {/* ID Proof */}
                <label className="border border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => setIdProof(e.target.files[0] || null)}
                    className="hidden"
                  />
                  <div className="text-3xl mb-3 text-gray-400">+</div>
                  <p className="text-sm font-medium text-gray-700">ID Proof (Aadhaar / Voter)</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF • max 5 MB</p>
                  {idProof && (
                    <p className="text-xs text-green-600 mt-2 truncate max-w-[180px] mx-auto">
                      {idProof.name}
                    </p>
                  )}
                </label>

                {/* License (optional) */}
                <label className="border border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => setLicense(e.target.files[0] || null)}
                    className="hidden"
                  />
                  <div className="text-3xl mb-3 text-gray-400">+</div>
                  <p className="text-sm font-medium text-gray-700">License (optional)</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF • max 5 MB</p>
                  {license && (
                    <p className="text-xs text-green-600 mt-2 truncate max-w-[180px] mx-auto">
                      {license.name}
                    </p>
                  )}
                </label>
              </div>
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
        @keyframes pop {
          0%   { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.3s ease-out;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50/40 flex flex-col lg:flex-row">
        {/* Left decorative panel */}
        <div
          className="hidden lg:flex lg:w-5/12 bg-cover bg-center items-center justify-center relative overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1581092160560-1c1e428e9d65?auto=format&fit=crop&q=80&w=2070')",
          }}
        >
          <div className="text-white text-center px-8 md:px-12">
            <h1 className="text-3xl md:text-4xl font-light mb-5 tracking-wide">Join Our Service Network</h1>
            <p className="text-base md:text-lg opacity-90 max-w-md mx-auto">
              Help people in Kerala find trusted professionals — become one today.
            </p>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-10 lg:px-16 py-8 lg:py-12">
          <div className="w-full max-w-3xl">
            {/* Progress + title */}
            <div className="mb-8 lg:mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl font-semibold text-neutral-900">{step}</div>
                <div className="text-xl text-neutral-400">/ {totalSteps}</div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-light text-neutral-900 mb-1.5">
                {step === 1 ? "Let’s get started" :
                 step === 2 ? "Where do you work?" :
                 step === 3 ? "What services do you offer?" :
                 "Final step – verification"}
              </h2>
              <div className="w-12 h-0.5 bg-neutral-300 rounded"></div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl">
                {error}
              </div>
            )}

            <div className="step-content mb-10 lg:mb-12">{renderStep()}</div>

            {/* Navigation buttons */}
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
                  className={`${btnPrimary} ${step === 1 ? "w-full sm:w-auto" : "ml-auto"}`}
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
                      Processing...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              )}
            </div>

            <p className="text-center mt-8 lg:mt-10 text-sm text-gray-500">
              Already registered?{" "}
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