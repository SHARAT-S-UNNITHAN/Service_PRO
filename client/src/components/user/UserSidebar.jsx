// src/components/user/UserSidebar.jsx
import { UserCircle, Calendar, LogOut, Bell } from "lucide-react";

export default function UserSidebar({ activeSection, setActiveSection, onLogout, otpCount = 0 }) {
  const navItems = [
    { key: "profile",  label: "Profile",           icon: UserCircle },
    { key: "bookings", label: "My Bookings",        icon: Calendar   },
    { key: "otp",      label: "OTP Notifications",  icon: Bell       },
  ];

  return (
    <div className="hidden md:block w-72 bg-white border-r border-gray-200 min-h-screen sticky top-0">
      <div className="p-8 border-b">
        <h2 className="text-2xl font-bold text-gray-900">Customer</h2>
      </div>

      <nav className="mt-6 px-4 space-y-1">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${
              activeSection === key
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Icon size={24} />
            <span className="flex-1 text-left">{label}</span>
            {/* Badge for active OTPs */}
            {key === "otp" && otpCount > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {otpCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-8 w-72 px-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-4 text-red-600 hover:bg-red-50 rounded-2xl transition"
        >
          <LogOut size={22} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}