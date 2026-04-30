// src/components/admin/ProvidersSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Trash2, RefreshCw, MapPin } from "lucide-react";

const API = "http://localhost:4000";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
  "Kottayam", "Idukki", "Ernakulam", "Thrissur",
  "Palakkad", "Malappuram", "Kozhikode", "Wayanad",
  "Kannur", "Kasaragod",
];

export default function ProvidersSection() {
  const [providers, setProviders]               = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [actionLoading, setActionLoading]       = useState({});
  const [searchTerm, setSearchTerm]             = useState("");
  const [filterStatus, setFilterStatus]         = useState("all");
  const [filterDistrict, setFilterDistrict]     = useState("all");
  const navigate = useNavigate();

  useEffect(() => { fetchProviders(); }, []);

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/providers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProviders(res.data || []);
      setFilteredProviders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch providers:", err);
      alert("Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  // Search + Status + District filter
  useEffect(() => {
    let result = [...providers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term) ||
          p.phone?.includes(term)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((p) => {
        if (filterStatus === "pending")  return p.is_verified === 0;
        if (filterStatus === "approved") return p.is_verified === 1;
        if (filterStatus === "rejected") return p.is_verified === -1;
        if (filterStatus === "active")   return p.is_active === 1;
        if (filterStatus === "disabled") return p.is_active === 0;
        return true;
      });
    }

    if (filterDistrict !== "all") {
      result = result.filter(
        (p) => p.district?.toLowerCase() === filterDistrict.toLowerCase()
      );
    }

    setFilteredProviders(result);
  }, [providers, searchTerm, filterStatus, filterDistrict]);

  const handleAction = async (providerId, action, payload = {}) => {
    const confirmMsg = {
      approve:      "Approve this provider?",
      reject:       "Reject this provider?",
      toggleActive: "Change this provider's status?",
      delete:       "PERMANENTLY DELETE this provider? (Cannot be undone)",
    }[action];
    if (!window.confirm(confirmMsg)) return;

    setActionLoading((prev) => ({ ...prev, [providerId]: action }));
    try {
      const token = localStorage.getItem("token");
      if (action === "approve" || action === "reject") {
        await axios.patch(
          `${API}/admin/providers/${providerId}/verify`,
          { is_verified: action === "approve" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (action === "toggleActive") {
        await axios.patch(
          `${API}/admin/providers/${providerId}/toggle-active`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (action === "delete") {
        await axios.delete(`${API}/admin/providers/${providerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      await fetchProviders();
      alert(`✅ ${action.charAt(0).toUpperCase() + action.slice(1)} successful!`);
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [providerId]: null }));
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin h-7 w-7 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">

      {/* Search + Filters row */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 text-sm placeholder-gray-400"
          />
        </div>

        {/* Status + District filters in a row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-2xl px-4 py-2 flex-1">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent py-1.5 focus:outline-none text-gray-700 text-sm w-full"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {/* District filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-2xl px-4 py-2 flex-1">
            <MapPin size={16} className="text-gray-400 shrink-0" />
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="bg-transparent py-1.5 focus:outline-none text-gray-700 text-sm w-full"
            >
              <option value="all">All Districts</option>
              {KERALA_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {(filterDistrict !== "all" || filterStatus !== "all") && (
          <div className="flex flex-wrap gap-2">
            {filterDistrict !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-medium">
                <MapPin size={11} /> {filterDistrict}
                <button onClick={() => setFilterDistrict("all")} className="ml-1 hover:text-indigo-900">✕</button>
              </span>
            )}
            {filterStatus !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-medium">
                <Filter size={11} /> {filterStatus}
                <button onClick={() => setFilterStatus("all")} className="ml-1 hover:text-indigo-900">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Service Providers{" "}
            <span className="text-gray-400 font-normal">({filteredProviders.length})</span>
          </h2>
          <button onClick={fetchProviders} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {filteredProviders.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">No providers found.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Provider","Contact","Location","Professions","Verification","Status","Actions"].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProviders.map((p) => {
                    const isLoading = actionLoading[p.id];
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <button
                            onClick={() => navigate(`/admin/provider/${p.id}`)}
                            className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors text-left"
                          >
                            {p.full_name || p.username}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-gray-600 text-xs">
                          {p.email}<br />
                          <span className="text-gray-500">{p.phone}</span>
                        </td>
                        <td className="px-5 py-4 text-gray-600 text-xs whitespace-nowrap">
                          {p.district}, {p.region}
                        </td>
                        <td className="px-5 py-4">
                          {p.professions ? (
                            <div className="flex flex-wrap gap-1">
                              {p.professions.split(",").slice(0, 2).map((prof, i) => (
                                <span key={i} className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-md">{prof.trim()}</span>
                              ))}
                              {p.professions.split(",").length > 2 && (
                                <span className="text-xs text-gray-400">+{p.professions.split(",").length - 2}</span>
                              )}
                            </div>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          {p.is_verified === 1 ? (
                            <span className="px-3 py-1 text-[10px] font-medium rounded-full bg-green-100 text-green-700">Approved</span>
                          ) : p.is_verified === -1 ? (
                            <span className="px-3 py-1 text-[10px] font-medium rounded-full bg-red-100 text-red-700">Rejected</span>
                          ) : (
                            <span className="px-3 py-1 text-[10px] font-medium rounded-full bg-yellow-100 text-yellow-700">Pending</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {p.is_active === 1 ? (
                            <span className="px-3 py-1 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700">Active</span>
                          ) : (
                            <span className="px-3 py-1 text-[10px] font-medium rounded-full bg-orange-100 text-orange-700">Disabled</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            {p.is_verified === 0 && (
                              <>
                                <button onClick={() => handleAction(p.id, "approve")} disabled={!!isLoading}
                                  className="px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 rounded-xl transition disabled:opacity-60">
                                  {isLoading === "approve" ? "..." : "Approve"}
                                </button>
                                <button onClick={() => handleAction(p.id, "reject")} disabled={!!isLoading}
                                  className="px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-xl transition disabled:opacity-60">
                                  {isLoading === "reject" ? "..." : "Reject"}
                                </button>
                              </>
                            )}
                            {p.is_verified === 1 && (
                              <button onClick={() => handleAction(p.id, "toggleActive", { is_active: p.is_active === 0 ? 1 : 0 })}
                                disabled={!!isLoading}
                                className="px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded-xl transition disabled:opacity-60">
                                {isLoading === "toggleActive" ? "..." : p.is_active === 0 ? "Enable" : "Disable"}
                              </button>
                            )}
                            <button onClick={() => handleAction(p.id, "delete")} disabled={!!isLoading}
                              className="px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-1 transition disabled:opacity-60">
                              <Trash2 size={13} />
                              {isLoading === "delete" ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredProviders.map((p) => {
                const isLoading = actionLoading[p.id];
                return (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button
                          onClick={() => navigate(`/admin/provider/${p.id}`)}
                          className="font-semibold text-gray-900 hover:text-blue-600 text-sm text-left"
                        >
                          {p.full_name || p.username}
                        </button>
                        <p className="text-xs text-gray-500 mt-0.5">{p.email}</p>
                        <p className="text-xs text-gray-500">{p.phone}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        {p.is_verified === 1 ? (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-100 text-green-700">Approved</span>
                        ) : p.is_verified === -1 ? (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-100 text-red-700">Rejected</span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-yellow-100 text-yellow-700">Pending</span>
                        )}
                        {p.is_active === 1 ? (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-orange-100 text-orange-700">Disabled</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} /> {p.district}, {p.region}
                    </div>
                    {p.professions && (
                      <div className="flex flex-wrap gap-1">
                        {p.professions.split(",").map((prof, i) => (
                          <span key={i} className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-md">{prof.trim()}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {p.is_verified === 0 && (
                        <>
                          <button onClick={() => handleAction(p.id, "approve")} disabled={!!isLoading}
                            className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-xl transition">
                            {isLoading === "approve" ? "..." : "Approve"}
                          </button>
                          <button onClick={() => handleAction(p.id, "reject")} disabled={!!isLoading}
                            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-xl transition">
                            {isLoading === "reject" ? "..." : "Reject"}
                          </button>
                        </>
                      )}
                      {p.is_verified === 1 && (
                        <button onClick={() => handleAction(p.id, "toggleActive", { is_active: p.is_active === 0 ? 1 : 0 })}
                          disabled={!!isLoading}
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-xl transition">
                          {isLoading === "toggleActive" ? "..." : p.is_active === 0 ? "Enable" : "Disable"}
                        </button>
                      )}
                      <button onClick={() => handleAction(p.id, "delete")} disabled={!!isLoading}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-xl flex items-center gap-1 transition">
                        <Trash2 size={13} /> {isLoading === "delete" ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}