// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Import icons for bottom nav
import { 
  UserCircle, 
  Calendar, 
  LogOut 
} from "lucide-react";

import UserSidebar from "../components/user/UserSidebar";
import ProfileInfo from "../components/user/ProfileInfo";
import MyBookings from "../components/user/MyBookings";

const API = "http://localhost:4000";

export default function Profile() {
  const [activeSection, setActiveSection] = useState("profile"); // "profile" or "bookings"

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Fetch Profile + Bookings
  useEffect(() => {
    if (!token || role !== "user") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, bookingsRes] = await Promise.all([
          axios.get(`${API}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/user/bookings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProfile(profileRes.data);
        setFormData(profileRes.data);
        setBookings(bookingsRes.data || []);
      } catch (err) {
        console.error("Profile fetch error:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear();
          navigate("/login");
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token, role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.phone || !formData.address) {
      setSaveError("Please fill all required fields");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setSaveError("Phone number must be exactly 10 digits");
      return;
    }

    setSaveLoading(true);
    setSaveError(null);

    try {
      await axios.put(
        `${API}/user/profile`,
        {
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          landmark: formData.landmark?.trim() || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile({ ...formData });
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setSaveError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setEditMode(false);
    setSaveError(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">{error}</h2>
          <button 
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <UserSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

            {activeSection === "profile" && (
              <ProfileInfo
                profile={profile}
                editMode={editMode}
                formData={formData}
                saveError={saveError}
                saveLoading={saveLoading}
                onInputChange={handleInputChange}
                onSave={handleSave}
                onCancel={handleCancel}
                onEdit={() => setEditMode(true)}
              />
            )}

            {activeSection === "bookings" && (
              <MyBookings 
                bookings={bookings} 
                token={token}           // ← Important: Pass token for review submission
              />
            )}

          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
          <div className="h-16 grid grid-cols-3 items-center">
            
            {/* Profile */}
            <button
              onClick={() => setActiveSection("profile")}
              className={`flex flex-col items-center justify-center transition ${
                activeSection === "profile" ? "text-indigo-600" : "text-gray-600"
              }`}
            >
              <UserCircle size={24} />
              <span className="text-[10px] mt-1 font-medium">Profile</span>
            </button>

            {/* My Bookings */}
            <button
              onClick={() => setActiveSection("bookings")}
              className={`flex flex-col items-center justify-center transition ${
                activeSection === "bookings" ? "text-indigo-600" : "text-gray-600"
              }`}
            >
              <Calendar size={24} />
              <span className="text-[10px] mt-1 font-medium">Bookings</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center text-red-600"
            >
              <LogOut size={24} />
              <span className="text-[10px] mt-1 font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}