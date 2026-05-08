// src/components/admin/AdminSidebar.jsx
import {
  LayoutDashboard, Users, UserCheck, AlertTriangle,
  LogOut, ChevronRight, HelpCircle, BarChart2, Brain, 
  Star, Zap, Tag, Shield, Megaphone
} from "lucide-react";

const menuItems = [
  { id: "dashboard",   label: "Dashboard",        icon: LayoutDashboard },
  { id: "analytics",   label: "Analytics",         icon: BarChart2       },
  { id: "providers",   label: "Service Providers", icon: Users           },
  { id: "customers",   label: "Customers",         icon: UserCheck       },
  { id: "categories",  label: "Categories",        icon: Tag             },
  { id: "reviews",     label: "Reviews",           icon: Star            },
  { id: "complaints",  label: "Complaints",        icon: AlertTriangle   },
  { id: "announcements", label: "Announcements",   icon: Megaphone       },
  { id: "audit-logs",  label: "Audit Logs",        icon: Shield          },
  { id: "ml-training", label: "ML Training",       icon: Brain           },
  { id: "ml-insights", label: "ML Insights",       icon: Zap             },
  { id: "helpcenter",  label: "Help Center",       icon: HelpCircle      },
];

export default function AdminSidebar({ activeSection, onSectionChange, onLogout }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex w-72 bg-white border-r border-gray-100 h-screen flex-col sticky top-0 overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">ZERV Admin</h2>
              <p className="text-xs text-gray-500 tracking-widest mt-0.5">CONTROL CENTER</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <button key={id} onClick={() => onSectionChange(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all group ${
                    isActive ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}>
                  <Icon size={20} className={`flex-shrink-0 ${isActive ? "text-indigo-600" : "group-hover:text-gray-900"}`} />
                  <span className="text-[15px]">{label}</span>
                  {isActive && <ChevronRight size={18} className="ml-auto text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-medium">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
        <div className="h-16 grid grid-cols-6 items-center">
          {menuItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button key={id} onClick={() => onSectionChange(id)}
                className={`flex flex-col items-center justify-center h-full transition-all ${
                  isActive ? "text-indigo-600 scale-105" : "text-gray-500 hover:text-indigo-600"
                }`}>
                <Icon size={19} />
                <span className="text-[8px] mt-1 font-medium">{label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}