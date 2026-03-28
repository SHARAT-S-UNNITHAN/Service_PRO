// src/components/admin/CustomersSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Trash2,
  RefreshCw,
  User,
} from "lucide-react";

const API = "http://localhost:4000";

export default function CustomersSection() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // Future filter if needed

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data || []);
      setFilteredCustomers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      alert("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // Search Logic
  useEffect(() => {
    let result = [...customers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.phone?.includes(term) ||
          c.address?.toLowerCase().includes(term)
      );
    }

    setFilteredCustomers(result);
  }, [customers, searchTerm]);

  const handleDelete = async (customerId) => {
    if (!window.confirm("Are you sure you want to DELETE this customer?\nThis action cannot be undone.")) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [customerId]: true }));

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/admin/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchCustomers();
      alert("✅ Customer deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete customer");
    } finally {
      setActionLoading((prev) => ({ ...prev, [customerId]: false }));
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
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customers by name, email, phone or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 text-sm placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-2xl px-4 py-2 min-w-[180px]">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent py-2 focus:outline-none text-gray-700 text-sm w-full"
          >
            <option value="all">All Customers</option>
            {/* You can add more filters later (e.g., recent, old) */}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            All Customers{" "}
            <span className="text-gray-400 font-normal">({filteredCustomers.length})</span>
          </h2>
          <button
            onClick={fetchCustomers}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined On</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((c) => {
                  const isDeleting = actionLoading[c.id];
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{c.full_name}</div>
                            <div className="text-xs text-gray-500">ID: #{c.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600 text-xs">
                        {c.email}
                        <br />
                        <span className="text-gray-500">{c.phone}</span>
                      </td>

                      <td className="px-5 py-4 text-gray-600 text-xs">
                        {c.address}
                        {c.landmark && (
                          <div className="text-gray-500 mt-1">Landmark: {c.landmark}</div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-600 text-xs whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={isDeleting}
                          className="px-4 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-1.5 transition disabled:opacity-60"
                        >
                          <Trash2 size={15} />
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}