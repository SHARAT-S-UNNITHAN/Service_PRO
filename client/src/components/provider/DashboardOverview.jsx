// src/components/provider/DashboardOverview.jsx
import {
  ListChecks,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  ChevronRight,
  LogOut,
  Bell,                // ← New: Notification icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardOverview({ 
  stats, 
  onViewAll,
  onOpenNotifications   // ← New prop to open notifications section
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  const statCards = [
    { title: "Total Bookings", value: stats.total, icon: <ListChecks size={24} />, color: "indigo" },
    { title: "Pending", value: stats.pending, icon: <Clock size={24} />, color: "yellow" },
    { title: "Accepted", value: stats.accepted, icon: <CheckCircle size={24} />, color: "green" },
    { title: "Rejected", value: stats.rejected, icon: <XCircle size={24} />, color: "red" },
    { title: "Completed", value: stats.completed, icon: <IndianRupee size={24} />, color: "blue" },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header with Notification + Mobile Logout */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Quick summary of your service activity
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell Icon - Top Right */}
          <button
            onClick={onOpenNotifications}
            className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-95 relative"
            title="Notifications"
          >
            <Bell size={24} strokeWidth={2} />
            {/* Optional badge (you can pass unread count later) */}
            {/* <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">3</span> */}
          </button>

          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="md:hidden flex items-center justify-center w-10 h-10 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all active:scale-95"
            title="Logout"
          >
            <LogOut size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${
                card.color === "indigo" ? "bg-indigo-50 text-indigo-600" :
                card.color === "yellow" ? "bg-yellow-50 text-yellow-600" :
                card.color === "green" ? "bg-green-50 text-green-600" :
                card.color === "red" ? "bg-red-50 text-red-600" :
                "bg-blue-50 text-blue-600"
              }`}
            >
              {card.icon}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {card.title}
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-4 sm:px-6 sm:py-5 border-b bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Recent Bookings
          </h2>
          <button
            onClick={onViewAll}
            className="text-indigo-600 hover:text-indigo-800 text-sm sm:text-base font-medium flex items-center gap-1 transition-colors"
          >
            View All
            <ChevronRight size={16} />
          </button>
        </div>

        {stats.recent.length === 0 ? (
          <div className="py-10 sm:py-16 px-4 text-center text-gray-500">
            <p className="text-base sm:text-lg font-medium">No recent bookings yet</p>
            <p className="mt-2 text-sm sm:text-base">
              New requests will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sm:px-6">
                    Customer
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sm:px-6 hidden sm:table-cell">
                    Service
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sm:px-6">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sm:px-6">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {stats.recent.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-3 py-4 sm:px-6 text-sm font-medium text-gray-900">
                      {booking.customer_name || "—"}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 hidden sm:table-cell max-w-xs truncate">
                      {booking.service_description || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 sm:px-6">
                      {new Date(booking.scheduled_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 sm:px-6">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}