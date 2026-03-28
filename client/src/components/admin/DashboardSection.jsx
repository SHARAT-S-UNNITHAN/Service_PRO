// src/components/admin/DashboardSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, 
  Clock, 
  ShieldCheck, 
  UserX,
  RefreshCw 
} from "lucide-react";

const API = "http://localhost:4000";

export default function DashboardSection() {
  const [stats, setStats] = useState({
    totalProviders: 0,
    pendingVerification: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentPending, setRecentPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/providers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const providers = res.data || [];

      const total = providers.length;
      const pending = providers.filter(p => p.is_verified === 0).length;
      const approved = providers.filter(p => p.is_verified === 1).length;
      const rejected = providers.filter(p => p.is_verified === -1).length;

      const pendingList = providers
        .filter(p => p.is_verified === 0)
        .sort((a, b) => new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at))
        .slice(0, 5);

      setStats({ totalProviders: total, pendingVerification: pending, approved, rejected });
      setRecentPending(pendingList);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (providerId) => {
    if (!window.confirm("Approve this provider?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API}/admin/providers/${providerId}/verify`,
        { is_verified: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Provider approved successfully!");
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve provider");
    }
  };

  const handleReject = async (providerId) => {
    if (!window.confirm("Reject this provider?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API}/admin/providers/${providerId}/verify`,
        { is_verified: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Provider rejected successfully!");
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reject provider");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-7 w-7 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header - Smaller */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 text-sm mt-1">Platform overview at a glance</p>
      </div>

      {/* Stats Cards - More Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium tracking-widest">TOTAL PROVIDERS</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProviders}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users size={22} className="text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium tracking-widest">PENDING</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingVerification}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={22} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium tracking-widest">APPROVED</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={22} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium tracking-widest">REJECTED</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserX size={22} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Pending Table - Compact */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Pending Approvals</h3>
            <p className="text-xs text-gray-500">Awaiting verification</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {recentPending.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No pending approvals at the moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Professions</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {recentPending.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {p.full_name || p.username}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {p.email}<br />
                      <span className="text-xs text-gray-500">{p.phone}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {p.district}, {p.region}
                    </td>
                    <td className="px-6 py-4">
                      {p.professions ? (
                        <div className="flex flex-wrap gap-1">
                          {p.professions.split(",").slice(0, 3).map((prof, i) => (
                            <span
                              key={i}
                              className="inline-block px-2.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-md font-medium"
                            >
                              {prof.trim()}
                            </span>
                          ))}
                          {p.professions.split(",").length > 3 && (
                            <span className="text-xs text-gray-400">+{p.professions.split(",").length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-xl transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition"
                        >
                          Reject
                        </button>
                      </div>
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