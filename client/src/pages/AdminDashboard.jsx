// src/pages/AdminDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar      from "../components/admin/AdminSidebar";
import DashboardSection  from "../components/admin/DashboardSection";
import ProvidersSection  from "../components/admin/ProvidersSection";
import CustomersSection  from "../components/admin/CustomersSection";
import ComplaintsSection from "../components/admin/ComplaintsSection";
import HelpCenterSection from "../components/admin/HelpCenterSection";
import AdminAnalytics    from "../components/admin/AdminAnalytics";
import CSVTrainingPanel  from "../components/admin/CSVTrainingPanel";
import AllReviewsSection from "../components/admin/AllReviewsSection";
import MLInsightsSection from "../components/admin/MLInsightsSection";
import CategorySection from "../components/admin/CategorySection";
import AuditLogSection from "../components/admin/AuditLogSection";
import AnnouncementsSection from "../components/admin/AnnouncementsSection";
import ConfirmationModal from "../components/shared/ConfirmationModal";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); 
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":  return <DashboardSection onSectionChange={setActiveSection} />;
      case "analytics":  return <AdminAnalytics />;
      case "providers":  return <ProvidersSection />;
      case "customers":  return <CustomersSection />;
      case "categories": return <CategorySection />;
      case "reviews":    return <AllReviewsSection />;
      case "complaints": return <ComplaintsSection />;
      case "announcements": return <AnnouncementsSection />;
      case "audit-logs": return <AuditLogSection />;
      case "ml-training": return <CSVTrainingPanel />;
      case "ml-insights": return <MLInsightsSection />;
      case "helpcenter": return <HelpCenterSection />;
      default:           return <DashboardSection onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={() => setShowLogoutModal(true)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-24 md:pb-10">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <ConfirmationModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of the admin panel? You will need to sign in again to access these management tools."
        confirmText="Logout Now"
        type="warning"
      />
    </div>
  );
}