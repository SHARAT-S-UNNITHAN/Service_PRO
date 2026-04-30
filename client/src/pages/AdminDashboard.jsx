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

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear(); navigate("/login");
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":  return <DashboardSection onSectionChange={setActiveSection} />;
      case "analytics":  return <AdminAnalytics />;
      case "providers":  return <ProvidersSection />;
      case "customers":  return <CustomersSection />;
      case "complaints": return <ComplaintsSection />;
      case "helpcenter": return <HelpCenterSection />;
      default:           return <DashboardSection onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-24 md:pb-10">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}