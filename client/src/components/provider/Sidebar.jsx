// src/components/provider/Sidebar.jsx
import { 
  LayoutDashboard, 
  UserCircle, 
  Calendar, 
  FileText, 
  Star,           // ← New for Reviews
  LogOut, 
  ChevronRight 
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'My Profile', icon: UserCircle },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'reviews', label: 'Reviews', icon: Star },           // ← New
  { id: 'documents', label: 'Documents', icon: FileText },
];

export default function Sidebar({ activeSection, onSectionChange }) {
  return (
    <div className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Provider</h2>
      </div>

      <nav className="mt-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} className="mr-3" />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={16} className="ml-auto" />}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-8 w-full px-3">
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to log out?")) {
              localStorage.clear();
              window.location.href = '/login';
            }
          }}
          className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}