// src/pages/ProviderDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  MapPin, Phone, Mail, BadgeCheck, X, CheckCircle,
  Calendar, Award, Shield, MessageCircle,
  ThumbsUp, Briefcase, LocateFixed, Sparkles, ChevronDown,
} from "lucide-react";

const API = "http://localhost:4000";

export default function ProviderDetail() {
  const { id } = useParams();

  const [provider,       setProvider]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [bookingForm,    setBookingForm]    = useState({
    profession:          "",   // ← NEW
    service_description: "",
    scheduled_date:      "",
    address:             "",
  });
  const [bookingErrors,  setBookingErrors]  = useState({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    axios.get(`${API}/providers/${id}`)
      .then(res => setProvider(res.data))
      .catch(err => setError(err.response?.data?.error || "Failed to load provider"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setIsModalOpen(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // When modal opens, pre-select first profession if only one exists
  const openModal = () => {
    const professions = provider?.professions || [];
    setBookingForm({
      profession:          professions.length === 1 ? professions[0] : "",
      service_description: "",
      scheduled_date:      "",
      address:             "",
    });
    setBookingErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
    if (bookingErrors[name]) setBookingErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!bookingForm.profession)              errors.profession          = "Please select the service type";
    if (!bookingForm.service_description.trim()) errors.service_description = "Please describe what you need";
    if (!bookingForm.scheduled_date)          errors.scheduled_date      = "Please select date & time";
    if (!bookingForm.address.trim())          errors.address             = "Service address is required";
    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setBookingLoading(true);
    try {
      await axios.post(`${API}/user/bookings`, {
        provider_id:         id,
        profession:          bookingForm.profession,          // ← NEW
        service_description: bookingForm.service_description.trim(),
        scheduled_date:      bookingForm.scheduled_date,
        address:             bookingForm.address.trim(),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setBookingSuccess(false);
        setBookingForm({ profession: "", service_description: "", scheduled_date: "", address: "" });
      }, 2000);
    } catch (err) {
      setBookingErrors({ server: err.response?.data?.error || "Failed to send request" });
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Loading / Error states ──────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-slate-600 font-medium">Loading profile...</p>
      </div>
    </div>
  );

  if (error || !provider) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-slate-900">Unable to load profile</h2>
        <p className="text-slate-600 mt-2 mb-6">{error || "Provider not found"}</p>
        <Link to="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition">
          ← Back to Search
        </Link>
      </div>
    </div>
  );

  const displayName  = provider.full_name || provider.username || "Service Provider";
  const professions  = provider.professions || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── Left column ─────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-10">

            {/* Profile header */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="h-40 bg-white" />
              <div className="px-8 -mt-20 pb-10 relative">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 bg-slate-100 rounded-3xl shadow-xl border-4 border-white flex items-center justify-center text-5xl font-bold text-slate-700">
                      {getInitials(displayName)}
                    </div>
                    {provider.is_verified === 1 && (
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-white">
                        <BadgeCheck size={22} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="text-center sm:text-left mt-6 sm:mt-0 flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                      <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{displayName}</h1>
                      {provider.is_verified === 1 && (
                        <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-2xl flex items-center gap-1">
                          <BadgeCheck size={16} /> Verified Professional
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-slate-600">
                      <MapPin size={20} />
                      <span className="text-lg">{provider.district}, {provider.region}</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="mt-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase size={24} className="text-slate-800" />
                    <h3 className="text-xl font-semibold text-slate-900">Services Offered</h3>
                  </div>
                  {professions.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {professions.map((service, idx) => (
                        <button key={idx} onClick={openModal}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-900 hover:text-white transition-colors text-slate-700 font-medium rounded-2xl text-sm border border-slate-200 group">
                          {service.trim()}
                          <span className="ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Book →</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No services listed yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            {provider.description && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-5">
                  <Sparkles size={26} className="text-slate-800" />
                  <h2 className="text-2xl font-semibold text-slate-900">About</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-[15.5px] whitespace-pre-line">
                  {provider.description}
                </p>
              </div>
            )}
          </div>

          {/* ── Right column ────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-8">

            {/* Get in Touch */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-2xl font-semibold text-slate-900 mb-7">Get in Touch</h3>
              <div className="space-y-7">
                {provider.phone && (
                  <a href={`tel:${provider.phone}`} className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-slate-200 transition">
                      <Phone size={22} className="text-slate-700" />
                    </div>
                    <div>
                      <p className="uppercase text-xs tracking-widest text-slate-500 font-medium">Phone</p>
                      <p className="text-slate-900 font-medium text-lg mt-0.5">{provider.phone}</p>
                    </div>
                  </a>
                )}
                {provider.email && (
                  <a href={`mailto:${provider.email}`} className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-slate-200 transition">
                      <Mail size={22} className="text-slate-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="uppercase text-xs tracking-widest text-slate-500 font-medium">Email</p>
                      <p className="text-slate-900 font-medium text-lg mt-0.5 truncate">{provider.email}</p>
                    </div>
                  </a>
                )}
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <LocateFixed size={22} className="text-slate-700" />
                  </div>
                  <div>
                    <p className="uppercase text-xs tracking-widest text-slate-500 font-medium">Location</p>
                    <p className="text-slate-900 font-medium text-lg mt-0.5">{provider.district}, {provider.region}</p>
                    {provider.address && <p className="text-sm text-slate-600 mt-1">{provider.address}</p>}
                  </div>
                </div>
              </div>

              <button onClick={openModal}
                className="mt-10 w-full py-4 bg-slate-900 hover:bg-slate-950 active:scale-[0.985] transition-all text-white font-semibold rounded-2xl flex items-center justify-center gap-3 text-lg shadow-lg shadow-slate-900/20">
                <MessageCircle size={24} /> Book Service Now
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">Free consultation • Fast response</p>
            </div>

            {/* Trust & Safety */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900 text-xl mb-6">Why Choose This Provider?</h3>
              <div className="space-y-6">
                {[
                  { icon: Shield,   bg: "bg-emerald-100", color: "text-emerald-600", title: "Secure & Reliable",     sub: "All payments are protected"    },
                  { icon: ThumbsUp, bg: "bg-blue-100",    color: "text-blue-600",    title: "Quality Guaranteed",    sub: "Satisfaction or refund"         },
                  { icon: Award,    bg: "bg-purple-100",  color: "text-purple-600",  title: "Background Verified",   sub: "Trusted professionals only"    },
                ].map(({ icon: Icon, bg, color, title, sub }) => (
                  <div key={title} className="flex gap-4">
                    <div className={`w-10 h-10 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className={color} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{title}</p>
                      <p className="text-sm text-slate-600">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Booking Modal ─────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col">

            {/* Modal header */}
            <div className="px-6 py-5 border-b flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-semibold">Request Service</h2>
                <p className="text-sm text-slate-500">with {displayName}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={26} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {bookingSuccess ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-slate-900">Request Sent!</h3>
                  <p className="text-slate-600 mt-3">The provider will respond shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-5">

                  {/* ── Service type dropdown (NEW) ── */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    {professions.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">No services listed by this provider.</p>
                    ) : professions.length === 1 ? (
                      // Single profession — show as a read-only pill
                      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
                        <span className="text-slate-800 font-medium">{professions[0]}</span>
                        <span className="ml-auto text-xs text-slate-400">Auto-selected</span>
                      </div>
                    ) : (
                      // Multiple professions — show dropdown
                      <div className="relative">
                        <select
                          name="profession"
                          value={bookingForm.profession}
                          onChange={handleInputChange}
                          className={`w-full appearance-none px-5 py-4 border rounded-2xl focus:outline-none focus:border-slate-900 bg-white text-slate-800 ${
                            bookingErrors.profession ? "border-red-400" : "border-slate-200"
                          }`}
                        >
                          <option value="">— Select the service you need —</option>
                          {professions.map((p, i) => (
                            <option key={i} value={p}>{p}</option>
                          ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                      </div>
                    )}
                    {bookingErrors.profession && (
                      <p className="text-red-600 text-sm mt-1">{bookingErrors.profession}</p>
                    )}
                  </div>

                  {/* Service description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Describe the work <span className="text-red-500">*</span>
                      {bookingForm.profession && (
                        <span className="ml-2 text-xs font-normal text-slate-400">
                          for {bookingForm.profession}
                        </span>
                      )}
                    </label>
                    <textarea
                      name="service_description"
                      value={bookingForm.service_description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-slate-900 resize-y min-h-[100px] ${
                        bookingErrors.service_description ? "border-red-400" : "border-slate-200"
                      }`}
                      placeholder={
                        bookingForm.profession
                          ? `Describe the ${bookingForm.profession} work you need...`
                          : "Describe what you need help with..."
                      }
                    />
                    {bookingErrors.service_description && (
                      <p className="text-red-600 text-sm mt-1">{bookingErrors.service_description}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Preferred Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduled_date"
                      value={bookingForm.scheduled_date}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-slate-900 ${
                        bookingErrors.scheduled_date ? "border-red-400" : "border-slate-200"
                      }`}
                    />
                    {bookingErrors.scheduled_date && (
                      <p className="text-red-600 text-sm mt-1">{bookingErrors.scheduled_date}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Service Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={bookingForm.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-slate-900 resize-y ${
                        bookingErrors.address ? "border-red-400" : "border-slate-200"
                      }`}
                      placeholder="Full address with landmark and PIN code"
                    />
                    {bookingErrors.address && (
                      <p className="text-red-600 text-sm mt-1">{bookingErrors.address}</p>
                    )}
                  </div>

                  {bookingErrors.server && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm">
                      {bookingErrors.server}
                    </div>
                  )}

                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 border border-slate-300 rounded-2xl font-medium hover:bg-slate-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={bookingLoading}
                      className="flex-1 py-4 bg-slate-900 text-white font-semibold rounded-2xl hover:bg-slate-950 disabled:bg-slate-400 transition">
                      {bookingLoading ? "Sending..." : "Send Request"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}