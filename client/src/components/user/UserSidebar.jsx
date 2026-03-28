// src/components/user/UserSidebar.jsx
import { UserCircle, Calendar, LogOut } from "lucide-react";

export default function UserSidebar({ activeSection, setActiveSection, onLogout }) {
  return (
    <div className="hidden md:block w-72 bg-white border-r border-gray-200 min-h-screen sticky top-0">
      <div className="p-8 border-b">
        <h2 className="text-2xl font-bold text-gray-900">Customer</h2>
      </div>

      <nav className="mt-6 px-4 space-y-1">
        {/* Profile Link */}
        <button
          onClick={() => setActiveSection("profile")}
          className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${
            activeSection === "profile"
              ? "bg-indigo-50 text-indigo-700 font-medium"
              : "hover:bg-gray-50 text-gray-700"
          }`}
        >
          <UserCircle size={24} />
          <span>Profile</span>
        </button>

        {/* My Bookings Link */}
        <button
          onClick={() => setActiveSection("bookings")}
          className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${
            activeSection === "bookings"
              ? "bg-indigo-50 text-indigo-700 font-medium"
              : "hover:bg-gray-50 text-gray-700"
          }`}
        >
          <Calendar size={24} />
          <span>My Bookings</span>
        </button>
      </nav>

      {/* Logout at bottom */}
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