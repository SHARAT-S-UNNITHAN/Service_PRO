// src/components/admin/DashboardSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users, Clock, ShieldCheck, UserX,
  RefreshCw, BookOpen, IndianRupee, AlertTriangle, BarChart2,
  UserCheck, X
} from "lucide-react";
import ConfirmationModal from "../shared/ConfirmationModal";
import Toast from "../shared/Toast";

const API = "http://localhost:4000";

export default function DashboardSection({ onSectionChange }) {
  const [providerStats, setProviderStats] = useState({ total:0, pending:0, approved:0, rejected:0 });
  const [extraStats,    setExtraStats]    = useState(null);
  const [recentPending, setRecentPending] = useState([]);
  const [loading,       setLoading]       = useState(true);

  // New UI State
  const [modal, setModal] = useState({ isOpen: false, id: null, type: "success", title: "", message: "", action: null });
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [provRes, ovRes] = await Promise.all([
        axios.get(`${API}/admin/providers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/admin/overview`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      ]);

      const providers = provRes.data || [];
      setProviderStats({
        total:   providers.length,
        pending: providers.filter(p => p.is_verified === 0).length,
        approved:providers.filter(p => p.is_verified === 1).length,
        rejected:providers.filter(p => p.is_verified === -1).length,
      });
      setRecentPending(
        providers.filter(p => p.is_verified === 0)
          .sort((a,b) => new Date(b.created_at||b.updated_at) - new Date(a.created_at||a.updated_at))
          .slice(0, 5)
      );
      // Use the fixed overview totals from API
      if (ovRes?.data?.totals) setExtraStats(ovRes.data.totals);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id) => {
    setModal({
      isOpen: true,
      id,
      type: "success",
      title: "Approve Provider",
      message: "Are you sure you want to approve this provider? They will be able to start accepting service bookings immediately.",
      confirmText: "Approve Now",
      action: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.patch(`${API}/admin/providers/${id}/verify`, { is_verified: true }, { headers: { Authorization: `Bearer ${token}` } });
          setToast({ isVisible: true, message: "Provider approved successfully!", type: "success" });
          fetchDashboardData();
        } catch (err) {
          setToast({ isVisible: true, message: "Failed to approve provider", type: "error" });
        } finally {
          setModal({ isOpen: false, id: null });
        }
      }
    });
  };

  const handleReject = (id) => {
    setModal({
      isOpen: true,
      id,
      type: "danger",
      title: "Reject Provider",
      message: "Are you sure you want to reject this application? This provider will not be able to offer services on the platform.",
      confirmText: "Reject Now",
      action: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.patch(`${API}/admin/providers/${id}/verify`, { is_verified: false }, { headers: { Authorization: `Bearer ${token}` } });
          setToast({ isVisible: true, message: "Provider application rejected", type: "info" });
          fetchDashboardData();
        } catch (err) {
          setToast({ isVisible: true, message: "Failed to reject provider", type: "error" });
        } finally {
          setModal({ isOpen: false, id: null });
        }
      }
    });
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin h-7 w-7 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <ConfirmationModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.action}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        type={modal.type}
      />

      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...toast, isVisible: false }))}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Platform overview at a glance</p>
        </div>
        {onSectionChange && (
          <button onClick={() => onSectionChange("analytics")}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">
            <BarChart2 size={16} /> Full Analytics
          </button>
        )}
      </div>

      {/* Provider verification stats — from providers table (correct) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"TOTAL PROVIDERS", value: providerStats.total,    icon: Users,       bg:"bg-indigo-100", color:"text-indigo-600" },
          { label:"PENDING",         value: providerStats.pending,   icon: Clock,       bg:"bg-yellow-100", color:"text-yellow-600", valColor:"text-yellow-600" },
          { label:"APPROVED",        value: providerStats.approved,  icon: ShieldCheck, bg:"bg-green-100",  color:"text-green-600",  valColor:"text-green-600"  },
          { label:"REJECTED",        value: providerStats.rejected,  icon: UserX,       bg:"bg-red-100",    color:"text-red-600",    valColor:"text-red-600"    },
        ].map(({ label, value, icon: Icon, bg, color, valColor }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium tracking-widest">{label}</p>
                <p className={`text-3xl font-bold mt-2 ${valColor || "text-gray-900"}`}>{value}</p>
              </div>
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={22} className={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform-wide stats — from fixed /api/admin/overview (correct counts) */}
      {extraStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:"REGISTERED USERS",    value: extraStats.total_users,         icon: UserCheck,     bg:"bg-purple-100", color:"text-purple-600" },
            { label:"TOTAL BOOKINGS",      value: extraStats.total_bookings,      icon: BookOpen,      bg:"bg-blue-100",   color:"text-blue-600"   },
            { label:"PLATFORM REVENUE",    value: `₹${Number(extraStats.total_revenue||0).toLocaleString("en-IN")}`, icon: IndianRupee, bg:"bg-green-100", color:"text-green-600" },
            { label:"OPEN COMPLAINTS",     value: extraStats.open_complaints,     icon: AlertTriangle, bg:"bg-red-100",    color:"text-red-600"    },
          ].map(({ label, value, icon: Icon, bg, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium tracking-widest">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={22} className={color} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending approvals table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Pending Approvals</h3>
            <p className="text-xs text-gray-500">Awaiting verification</p>
          </div>
          <button onClick={fetchDashboardData}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {recentPending.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No pending approvals.</div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Provider","Contact","Location","Professions","Actions"].map(h => (
                      <th key={h} className={`px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h==="Actions"?"text-right":"text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {recentPending.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{p.full_name||p.username}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {p.email}<br/><span className="text-xs text-gray-500">{p.phone}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.district}, {p.region}</td>
                      <td className="px-6 py-4">
                        {p.professions ? (
                          <div className="flex flex-wrap gap-1">
                            {p.professions.split(",").slice(0,3).map((pr,i) => (
                              <span key={i} className="px-2.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-md font-medium">{pr.trim()}</span>
                            ))}
                          </div>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleApprove(p.id)}
                            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-xl transition">Approve</button>
                          <button onClick={() => handleReject(p.id)}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition">Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-gray-100">
              {recentPending.map(p => (
                <div key={p.id} className="p-4 space-y-2">
                  <p className="font-semibold text-sm text-gray-900">{p.full_name||p.username}</p>
                  <p className="text-xs text-gray-500">{p.email} • {p.district}</p>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleApprove(p.id)} className="flex-1 py-2 bg-green-600 text-white text-xs font-medium rounded-xl">Approve</button>
                    <button onClick={() => handleReject(p.id)}  className="flex-1 py-2 bg-red-600 text-white text-xs font-medium rounded-xl">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}