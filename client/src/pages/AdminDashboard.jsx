// src/pages/AdminDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import DashboardSection from "../components/admin/DashboardSection";
import ProvidersSection from "../components/admin/ProvidersSection";
import CustomersSection from "../components/admin/CustomersSection";
import ComplaintsSection from "../components/admin/ComplaintsSection";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />;

      case "providers":
        return <ProvidersSection />;

      case "customers":
        return <CustomersSection />;

      case "complaints":
        return <ComplaintsSection />;

      case "users":
        return (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 text-5xl">
              👥
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Users Management</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Advanced user management features are coming soon.
            </p>
          </div>
        );

      case "reports":
        return (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="mx-auto w-24 h-24 bg-violet-100 rounded-3xl flex items-center justify-center mb-6 text-5xl">
              📈
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Reports & Analytics</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Advanced reporting and insights are coming soon.
            </p>
          </div>
        );

      case "settings":
        return (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="mx-auto w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center mb-6 text-5xl">
              ⚙️
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">System Settings</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Platform configuration options will be available here.
            </p>
          </div>
        );

      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}