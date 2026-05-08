// src/components/admin/CustomersSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search, Filter, Trash2, RefreshCw, User,
  X, Phone, MapPin, Calendar, BookOpen, Star, FileText,
  Edit3, Save, Mail
} from "lucide-react";
import { generatePDFReport } from "../../utils/pdfGenerator";
import ConfirmationModal from "../shared/ConfirmationModal";
import Toast from "../shared/Toast";

const API = "http://localhost:4000";

// ── Customer Profile Modal ──────────────────────────────────
function CustomerProfileModal({ customer, onClose, token }) {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API}/admin/customers/${customer.user_id}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data || []);
      } catch (err) {
        console.error("Failed to fetch customer bookings:", err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [customer.user_id, token]);

  const statusColor = {
    pending:   "bg-yellow-100 text-yellow-700",
    accepted:  "bg-blue-100   text-blue-700",
    completed: "bg-green-100  text-green-700",
    rejected:  "bg-red-100    text-red-700",
    cancelled: "bg-gray-100   text-gray-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-gray-900">Customer Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
              <User size={28} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{customer.full_name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{customer.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Customer ID: #{customer.id}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Phone size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(customer.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{customer.address}</p>
              {customer.landmark && (
                <p className="text-xs text-gray-500 mt-1">Landmark: {customer.landmark}</p>
              )}
            </div>
          </div>

          {/* Bookings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} className="text-gray-500" />
              <h4 className="text-sm font-semibold text-gray-900">Booking History</h4>
            </div>

            {loadingBookings ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {bookings.map((b) => (
                  <div key={b.id} className="flex items-start justify-between gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{b.service_description}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {b.provider_name} • {new Date(b.scheduled_date).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full capitalize shrink-0 ${statusColor[b.status] || "bg-gray-100 text-gray-600"}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function CustomersSection() {
  const [customers, setCustomers]                 = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [actionLoading, setActionLoading]         = useState({});
  const [searchTerm, setSearchTerm]               = useState("");
  const [selectedCustomer, setSelectedCustomer]   = useState(null);
  const [editingCustomer, setEditingCustomer]     = useState(null);
  const [editForm, setEditForm]                   = useState({ full_name: "", email: "", phone: "" });
  const token = localStorage.getItem("token");

  // New UI State
  const [modal, setModal] = useState({ isOpen: false, id: null });
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
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

  useEffect(() => {
    if (!searchTerm) { setFilteredCustomers(customers); return; }
    const term = searchTerm.toLowerCase();
    setFilteredCustomers(customers.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term) ||
        c.address?.toLowerCase().includes(term)
    ));
  }, [customers, searchTerm]);

  const handleDelete = (customerId) => {
    setModal({
      isOpen: true,
      id: customerId,
      title: "Delete Customer Account",
      message: "Are you sure you want to permanently delete this customer? All their booking history will be removed.",
      confirmText: "Delete Now",
      type: "danger",
      action: async () => {
        setActionLoading((prev) => ({ ...prev, [customerId]: true }));
        try {
          await axios.delete(`${API}/admin/customers/${customerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await fetchCustomers();
          setToast({ isVisible: true, message: "Customer deleted successfully!", type: "success" });
        } catch (err) {
          setToast({ isVisible: true, message: err.response?.data?.error || "Failed to delete customer", type: "error" });
        } finally {
          setActionLoading((prev) => ({ ...prev, [customerId]: false }));
          setModal({ isOpen: false, id: null });
        }
      }
    });
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setActionLoading((prev) => ({ ...prev, [editingCustomer.id]: true }));
    try {
      await axios.patch(
        `${API}/admin/customers/${editingCustomer.id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCustomer(null);
      await fetchCustomers();
      setToast({ isVisible: true, message: "Customer updated successfully!", type: "success" });
    } catch (err) {
      setToast({ isVisible: true, message: err.response?.data?.error || "Failed to update customer", type: "error" });
    } finally {
      setActionLoading((prev) => ({ ...prev, [editingCustomer.id]: false }));
    }
  };

  const openEditModal = (c) => {
    setEditingCustomer(c);
    setEditForm({
      full_name: c.full_name || "",
      email: c.email || "",
      phone: c.phone || ""
    });
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Name", dataKey: "full_name" },
      { header: "Email", dataKey: "email" },
      { header: "Phone", dataKey: "phone" },
      { header: "Address", dataKey: "address" },
      { header: "Joined On", dataKey: "created_at" }
    ];

    const data = filteredCustomers.map(c => ({
      full_name: c.full_name,
      email: c.email,
      phone: c.phone,
      address: c.address + (c.landmark ? ` (Landmark: ${c.landmark})` : ""),
      created_at: new Date(c.created_at).toLocaleDateString("en-IN")
    }));

    generatePDFReport({
      title: "Registered Customers List",
      columns: columns,
      data: data,
      filename: "customers_report",
      stats: {
        "Total Customers": customers.length,
        "Filtered Results": filteredCustomers.length
      }
    });
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin h-7 w-7 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-0">

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, email, phone or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 text-sm placeholder-gray-400"
        />
      </div>

      {/* Table container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            All Customers <span className="text-gray-400 font-normal">({filteredCustomers.length})</span>
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-xs font-medium shadow-sm"
            >
              <FileText size={14} className="text-indigo-600" />
              Export PDF
            </button>
            <button onClick={fetchCustomers} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">No customers found.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Customer","Contact","Address","Joined On","Actions"].map((h) => (
                      <th key={h} className={`px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                            <User size={18} className="text-blue-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{c.full_name}</div>
                            <div className="text-xs text-gray-500">ID: #{c.id}</div>
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs">
                        {c.email}<br /><span className="text-gray-500">{c.phone}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs">
                        {c.address}
                        {c.landmark && <div className="text-gray-500 mt-1">Landmark: {c.landmark}</div>}
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 rounded-xl transition"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={actionLoading[c.id]}
                            className="px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-1 transition disabled:opacity-60"
                          >
                            <Trash2 size={13} />
                            {actionLoading[c.id] ? "Deleting..." : "Delete"}
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            className="px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 rounded-xl flex items-center gap-1 transition"
                          >
                            <Edit3 size={13} />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filteredCustomers.map((c) => (
                <div key={c.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{c.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone size={12} /> {c.phone}
                  </div>
                  <div className="flex items-start gap-1 text-xs text-gray-500">
                    <MapPin size={12} className="shrink-0 mt-0.5" /> {c.address}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="flex-1 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-xl transition"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={actionLoading[c.id]}
                      className="flex-1 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-xl flex items-center justify-center gap-1 transition disabled:opacity-60"
                    >
                      <Trash2 size={13} /> {actionLoading[c.id] ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      onClick={() => openEditModal(c)}
                      className="flex-1 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          token={token}
        />
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 bg-indigo-600 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit3 size={20} />
                Edit Customer
              </h3>
              <button onClick={() => setEditingCustomer(null)} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateCustomer} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500/30 transition-all outline-none text-sm font-medium"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500/30 transition-all outline-none text-sm font-medium"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500/30 transition-all outline-none text-sm font-medium"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="flex-1 px-6 py-3 border border-gray-100 text-gray-500 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading[editingCustomer.id]}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {actionLoading[editingCustomer.id] ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, id: null })}
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
    </div>
  );
}