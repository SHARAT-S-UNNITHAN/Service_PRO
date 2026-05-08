// src/components/admin/ComplaintsSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  FileText,
  X,
  User
} from "lucide-react";
import { generatePDFReport } from "../../utils/pdfGenerator";
import ConfirmationModal from "../shared/ConfirmationModal";
import Toast from "../shared/Toast";

const API = "http://localhost:4000";

export default function ComplaintsSection() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Warning Modal States
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [sendingWarning, setSendingWarning] = useState(false);

  // New UI State
  const [modal, setModal] = useState({ isOpen: false, action: null });
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data || []);
      setFilteredComplaints(res.data || []);
    } catch (err) {
      setToast({ isVisible: true, message: "Failed to load complaints", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Search & Filter
  useEffect(() => {
    let result = [...complaints];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((c) =>
        (c.subject || "").toLowerCase().includes(term) ||
        (c.complaint_text || "").toLowerCase().includes(term) ||
        (c.provider_name || "").toLowerCase().includes(term) ||
        (c.customer_name || "").toLowerCase().includes(term)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((c) => c.status === filterStatus);
    }

    setFilteredComplaints(result);
  }, [complaints, searchTerm, filterStatus]);

  const handleDelete = (complaintId) => {
    setModal({
      isOpen: true,
      action: async () => {
        setActionLoading((prev) => ({ ...prev, [complaintId]: true }));
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API}/admin/complaints/${complaintId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await fetchComplaints();
          setToast({ isVisible: true, message: "Complaint deleted successfully!", type: "success" });
        } catch (err) {
          setToast({ isVisible: true, message: err.response?.data?.error || "Failed to delete complaint", type: "error" });
        } finally {
          setActionLoading((prev) => ({ ...prev, [complaintId]: false }));
          setModal({ isOpen: false, action: null });
        }
      }
    });
  };

  const openWarningModal = (complaint) => {
    setSelectedComplaint(complaint);
    setWarningMessage("");
    setShowWarningModal(true);
  };

  const closeModals = () => {
    setShowWarningModal(false);
    setSelectedComplaint(null);
    setWarningMessage("");
  };

  const sendWarningToProvider = async () => {
    if (!warningMessage.trim()) {
      setToast({ isVisible: true, message: "Please write a warning message", type: "error" });
      return;
    }

    setSendingWarning(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/admin/complaints/${selectedComplaint.id}/warning`,
        { message: warningMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setToast({ isVisible: true, message: "Warning sent successfully!", type: "success" });
      await fetchComplaints();
      closeModals();
    } catch (err) {
      setToast({ isVisible: true, message: err.response?.data?.error || "Failed to send warning", type: "error" });
    } finally {
      setSendingWarning(false);
    }
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Subject", dataKey: "subject" },
      { header: "Provider", dataKey: "provider_name" },
      { header: "Customer", dataKey: "customer_name" },
      { header: "Severity", dataKey: "severity" },
      { header: "Status", dataKey: "status" },
      { header: "Date", dataKey: "created_at" },
      { header: "Complaint Details", dataKey: "complaint_text" }
    ];

    const data = filteredComplaints.map(c => ({
      subject: c.subject,
      provider_name: c.provider_name || "N/A",
      customer_name: c.customer_name || "N/A",
      severity: (c.severity || "MEDIUM").toUpperCase(),
      status: c.status.replace("_", " ").toUpperCase(),
      created_at: new Date(c.created_at).toLocaleDateString("en-IN"),
      complaint_text: c.complaint_text
    }));

    generatePDFReport({
      title: "Provider Complaints Report",
      columns: columns,
      data: data,
      filename: "complaints_report",
      stats: {
        "Total Complaints": complaints.length,
        "Filtered": filteredComplaints.length,
        "Critical": complaints.filter(c => c.severity === 'critical').length
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "under_review": return "bg-blue-100 text-blue-700";
      case "resolved": return "bg-green-100 text-green-700";
      case "dismissed": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock size={16} />;
      case "under_review": return <AlertTriangle size={16} />;
      case "resolved": return <CheckCircle size={16} />;
      default: return null;
    }
  };

  // ✅ FIXED: Show Warn button only if status allows AND no warning sent yet
  const canSendWarning = (complaint) => {
    return (
      (complaint.status === "pending" || complaint.status === "under_review") &&
      !complaint.admin_notes // If admin_notes exists → warning was already sent
    );
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
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-3 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 text-sm placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-2xl px-4 py-2 min-w-[200px]">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent py-2 focus:outline-none text-gray-700 text-sm w-full"
          >
            <option value="all">All Complaints</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Provider Complaints{" "}
            <span className="text-gray-400 font-normal">({filteredComplaints.length})</span>
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-xs font-medium shadow-sm"
            >
              <FileText size={14} className="text-indigo-600" />
              Export PDF
            </button>
            <button
              onClick={fetchComplaints}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="py-16 text-center text-gray-500">No complaints found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Complaint</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredComplaints.map((c) => {
                  const isLoading = actionLoading[c.id];
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">{c.subject}</div>
                        <div className="text-xs text-gray-500 line-clamp-2 mt-1">{c.complaint_text}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-700">{c.provider_name || "—"}</td>
                      <td className="px-5 py-4 text-gray-700">{c.customer_name || "—"}</td>

                      <td className="px-5 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          c.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          c.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          c.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {c.severity?.toUpperCase() || "MEDIUM"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(c.status)}`}>
                          {getStatusIcon(c.status)}
                          <span className="capitalize">{c.status.replace("_", " ")}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString('en-IN')}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-wrap gap-2 justify-end">
                          {/* Warn Button - Only show if no warning sent yet */}
                          {canSendWarning(c) && (
                            <button
                              onClick={() => openWarningModal(c)}
                              className="px-4 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 rounded-xl transition flex items-center gap-1"
                            >
                              <Send size={15} />
                              Warn
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={isLoading}
                            className="px-4 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-1 transition disabled:opacity-60"
                          >
                            <Trash2 size={15} />
                            {isLoading ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Warning Modal */}
      {showWarningModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 bg-amber-600 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle size={24} />
                Issue Warning
              </h3>
              <button onClick={closeModals} className="text-white/80 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                  <User className="text-amber-600" size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient Provider</p>
                  <p className="text-base font-bold text-gray-900">{selectedComplaint.provider_name}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Warning Message</label>
                <textarea
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="Write the official warning details here..."
                  className="w-full h-40 p-5 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-amber-500/30 transition-all outline-none text-sm font-medium resize-none shadow-inner"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={closeModals}
                  className="flex-1 py-4 border border-gray-100 text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={sendWarningToProvider}
                  disabled={sendingWarning || !warningMessage.trim()}
                  className="flex-1 py-4 bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sendingWarning ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {sendingWarning ? "Sending..." : "Issue Warning"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, action: null })}
        onConfirm={modal.action}
        title="Delete Complaint"
        message="Are you sure you want to delete this complaint? This action is permanent and cannot be undone."
        confirmText="Delete Now"
        type="danger"
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

// ✅ Improved Helper: Hide Warn button if admin_notes already exists
const canSendWarning = (complaint) => {
  return (
    (complaint.status === "pending" || complaint.status === "under_review") &&
    !complaint.admin_notes // If admin_notes exists → warning was already sent
  );
};