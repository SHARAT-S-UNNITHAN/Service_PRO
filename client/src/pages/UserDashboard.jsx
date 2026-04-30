// src/pages/UserDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import UserSidebar   from "../components/user/UserSidebar";
import ProfileInfo   from "../components/user/ProfileInfo";
import MyBookings    from "../components/user/MyBookings";
import OtpNotifications from "../components/user/OtpNotifications";

const API = "http://localhost:4000";

export default function UserDashboard() {
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("profile");
  const [otpBadgeCount, setOtpBadgeCount] = useState(0);

  // ── Profile state ──
  const [profile,     setProfile]     = useState(null);
  const [profileLoad, setProfileLoad] = useState(true);
  const [editMode,    setEditMode]    = useState(false);
  const [formData,    setFormData]    = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError,   setSaveError]   = useState("");

  // ── Bookings state ──
  const [bookings,     setBookings]     = useState([]);
  const [bookingsLoad, setBookingsLoad] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ── Fetch profile ──
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoad(true);
      const res = await axios.get(`${API}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setProfileLoad(false);
    }
  }, [token]);

  // ── Fetch bookings ──
  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoad(true);
      const res = await axios.get(`${API}/user/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data || []);
    } catch (err) {
      console.error("Bookings fetch error:", err);
    } finally {
      setBookingsLoad(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
    fetchBookings();
  }, [fetchProfile, fetchBookings]);

  // ── Profile save ──
  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError("");
    try {
      await axios.put(`${API}/user/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(formData);
      setEditMode(false);
    } catch (err) {
      setSaveError(err.response?.data?.error || "Failed to save changes");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Mobile bottom nav ──
  const MobileNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex">
      {[
        { key: "profile",  label: "Profile",    emoji: "👤" },
        { key: "bookings", label: "Bookings",   emoji: "📋" },
        { key: "otp",      label: "OTP",        emoji: "🔑" },
      ].map(({ key, label, emoji }) => (
        <button
          key={key}
          onClick={() => setActiveSection(key)}
          className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors relative ${
            activeSection === key ? "text-indigo-600" : "text-gray-500"
          }`}
        >
          <span className="text-xl mb-0.5">{emoji}</span>
          {label}
          {key === "otp" && otpBadgeCount > 0 && (
            <span className="absolute top-2 right-1/4 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {otpBadgeCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <UserSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
        otpCount={otpBadgeCount}
      />

      {/* Main content */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">

          {/* ── Profile ── */}
          {activeSection === "profile" && (
            profileLoad ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : (
              <ProfileInfo
                profile={profile}
                editMode={editMode}
                formData={formData}
                saveError={saveError}
                saveLoading={saveLoading}
                onInputChange={handleInputChange}
                onSave={handleSave}
                onCancel={() => { setEditMode(false); setFormData(profile); setSaveError(""); }}
                onEdit={() => setEditMode(true)}
              />
            )
          )}

          {/* ── Bookings ── */}
          {activeSection === "bookings" && (
            bookingsLoad ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : (
              <MyBookings bookings={bookings} token={token} />
            )
          )}

          {/* ── OTP Notifications ── */}
          {activeSection === "otp" && (
            <OtpNotifications
              token={token}
              onActiveCountChange={setOtpBadgeCount}
            />
          )}

        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}