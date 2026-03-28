// src/components/provider/NotificationsSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Clock, AlertTriangle } from "lucide-react";

const API = "http://localhost:4000";

export default function NotificationsSection({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/provider/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-7 w-7 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-medium text-gray-900 flex items-center gap-3">
          <Bell className="text-amber-500" size={32} />
          Notifications & Warnings
        </h2>
        <p className="text-gray-500 mt-1">Messages sent by Admin</p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl py-20 text-center">
          <Bell size={64} className="mx-auto text-gray-200 mb-6" />
          <h3 className="text-xl font-medium text-gray-400">No notifications yet</h3>
          <p className="text-gray-500 mt-3 max-w-xs mx-auto">
            Any warnings or messages from the admin will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white border border-gray-200 rounded-3xl p-6 hover:border-gray-300 transition-all"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                    <AlertTriangle size={22} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900">
                      {notif.subject || "Warning from Admin"}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(notif.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                    {notif.message || notif.admin_notes}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={14} />
                    <span>Admin Warning</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}