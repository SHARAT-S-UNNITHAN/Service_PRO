// src/pages/ProvDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, UserCircle, Calendar, FileText, Star, BarChart2 } from "lucide-react";

import Sidebar            from "../components/provider/Sidebar";
import DashboardOverview  from "../components/provider/DashboardOverview";
import ProfileSection     from "../components/provider/ProfileSection";
import BookingsSection    from "../components/provider/BookingsSection";
import DocumentsSection   from "../components/provider/DocumentsSection";
import ReviewsSection     from "../components/provider/ReviewsSection";
import NotificationsSection from "../components/provider/NotificationsSection";
import AnalyticsSection   from "../components/provider/AnalyticsSection";
import AnnouncementBanner from "../components/shared/AnnouncementBanner";

const API_BASE = "http://localhost:4000";

export default function ProvDashboard() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("dashboard");
  const [profile,   setProfile]   = useState(null);
  const [bookings,  setBookings]  = useState([]);
  const [stats,     setStats]     = useState({ total:0, pending:0, accepted:0, completed:0, rejected:0, recent:[] });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchData = async () => {
      try {
        const [profileRes, bookingsRes] = await Promise.all([
          axios.get(`${API_BASE}/provider/profile`,  { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/provider/bookings`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const allBookings = bookingsRes.data || [];
        setProfile(profileRes.data);
        setBookings(allBookings);
        buildStats(allBookings);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear(); navigate("/login");
        } else {
          setError("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, token]);

  const buildStats = (data) => {
    setStats({
      total:     data.length,
      pending:   data.filter((b) => b.status === "pending").length,
      accepted:  data.filter((b) => b.status === "accepted").length,
      completed: data.filter((b) => b.status === "completed").length,
      rejected:  data.filter((b) => b.status === "rejected").length,
      recent:    [...data].sort((a,b) => new Date(b.created_at||b.scheduled_date) - new Date(a.created_at||a.scheduled_date)).slice(0,6),
    });
  };

  const refreshBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/provider/bookings`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data || []);
      buildStats(res.data || []);
    } catch (err) { console.error("Refresh failed:", err); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex items-center gap-3 text-indigo-600">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
        <span>Loading dashboard...</span>
      </div>
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error || "No profile data found"}</p>
        <button onClick={() => { localStorage.clear(); navigate("/login"); }}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition">
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="flex-1 flex flex-col min-h-screen">
        <AnnouncementBanner />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

            {activeSection === "dashboard" && (
              <DashboardOverview stats={stats} onViewAll={() => setActiveSection("bookings")} onOpenNotifications={() => setActiveSection("notifications")} />
            )}
            {activeSection === "profile" && (
              <ProfileSection profile={profile} token={token} API={API_BASE} />
            )}
            {activeSection === "bookings" && (
              <BookingsSection bookings={bookings} onActionSuccess={refreshBookings} token={token} API={API_BASE} />
            )}
            {activeSection === "documents" && (
              <DocumentsSection profile={profile} API={API_BASE} />
            )}
            {activeSection === "reviews" && (
              <ReviewsSection token={token} API={API_BASE} />
            )}
            {activeSection === "notifications" && (
              <NotificationsSection token={token} />
            )}
            {activeSection === "analytics" && (
              <AnalyticsSection />
            )}

          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
          <div className="h-16 grid grid-cols-6 items-center">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Home"     },
              { id: "profile",   icon: UserCircle,      label: "Profile"  },
              { id: "bookings",  icon: Calendar,        label: "Bookings" },
              { id: "reviews",   icon: Star,            label: "Reviews"  },
              { id: "analytics", icon: BarChart2,       label: "Stats"    },
              { id: "documents", icon: FileText,        label: "Docs"     },
            ].map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  className={`flex flex-col items-center justify-center h-full transition-all duration-200 ${
                    isActive ? "text-indigo-600 scale-105" : "text-gray-500 hover:text-indigo-600"
                  }`}>
                  <item.icon size={20} />
                  <span className="text-[9px] mt-1 font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}