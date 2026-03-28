// src/components/admin/AdminSidebar.jsx
import {
  LayoutDashboard,
  Users,
  UserCheck,
  AlertTriangle,
  LogOut,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { 
    id: "dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard 
  },
  { 
    id: "providers", 
    label: "Service Providers", 
    icon: Users 
  },
  { 
    id: "customers", 
    label: "Customers", 
    icon: UserCheck 
  },
  { 
    id: "complaints", 
    label: "Complaints", 
    icon: AlertTriangle 
  },
];

export default function AdminSidebar({ 
  activeSection, 
  onSectionChange, 
  onLogout 
}) {
  return (
    <div className="hidden md:flex w-72 bg-white border-r border-gray-100 h-screen flex-col sticky top-0 overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-8 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Admin Panel</h2>
            <p className="text-xs text-gray-500 tracking-widest mt-0.5">CONTROL CENTER</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all group ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon 
                  size={20} 
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? "text-indigo-600" : "group-hover:text-gray-900"
                  }`} 
                />
                <span className="text-[15px]">{item.label}</span>
                
                {isActive && (
                  <ChevronRight size={18} className="ml-auto text-indigo-600" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100 mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}