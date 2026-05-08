import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Megaphone, Send, Users, UserCheck, 
  Globe, AlertCircle, CheckCircle2, History,
  Trash2, Calendar, Clock, ArrowRight
} from "lucide-react";
import ConfirmationModal from "../shared/ConfirmationModal";
import Toast from "../shared/Toast";

const API = "http://localhost:4000";

export default function AnnouncementsSection() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // New UI State
  const [modal, setModal] = useState({ isOpen: false, id: null });
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to fetch announcement history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/admin/announcements`, 
        { title: title.trim(), message: message.trim(), target_role: targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setToast({ isVisible: true, message: "Announcement broadcasted successfully!", type: "success" });
      setTitle("");
      setMessage("");
      fetchHistory();
    } catch (err) {
      setToast({ 
        isVisible: true, 
        message: err.response?.data?.error || "Failed to send announcement", 
        type: "error" 
      });
    } finally {
      setSending(false);
    }
  };

  const confirmDelete = (id) => {
    setModal({ isOpen: true, id });
  };

  const handleDelete = async () => {
    const id = modal.id;
    if (!id) return;
    
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/admin/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(prev => prev.filter(a => a.id !== id));
      setToast({ isVisible: true, message: "Announcement deleted successfully", type: "success" });
    } catch (err) {
      setToast({ isVisible: true, message: "Failed to delete announcement", type: "error" });
    } finally {
      setDeletingId(null);
      setModal({ isOpen: false, id: null });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Megaphone size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Broadcast Center</h2>
        <p className="text-gray-500">Reach your entire platform with high-priority announcements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Composer */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
             {/* Decorative background element */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] -mr-16 -mt-16 z-0"></div>
             
             <form onSubmit={handleSend} className="space-y-8 relative z-10">
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Recipient Group</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'all', label: 'Everyone', icon: Globe },
                    { id: 'user', label: 'Customers', icon: Users },
                    { id: 'provider', label: 'Providers', icon: UserCheck },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setTargetRole(role.id)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 ${
                        targetRole === role.id 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100" 
                          : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-white"
                      }`}
                    >
                      <role.icon size={24} />
                      <span className="text-[10px] font-black uppercase tracking-wider text-center">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Headline</label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter announcement title..."
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Message Detail</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What would you like to broadcast today?..."
                    className="w-full px-6 py-5 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-medium h-48 resize-none"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 shadow-xl shadow-indigo-200 flex items-center justify-center gap-3"
              >
                {sending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Broadcasting...</span>
                  </div>
                ) : (
                  <>
                    <Send size={20} />
                    Send Broadcast
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: History & Tips */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col h-full max-h-[700px]">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <History size={18} className="text-indigo-600" />
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Broadcast History</h3>
              </div>
              <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-gray-500 border border-gray-100">
                {history.length} Total
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <div className="w-8 h-8 border-2 border-gray-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span className="text-xs font-medium uppercase tracking-widest">Loading history...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4 text-center px-10">
                  <Megaphone size={40} className="opacity-20" />
                  <p className="text-xs font-medium leading-relaxed">No announcements sent yet. Your history will appear here.</p>
                </div>
              ) : (
                history.map((ann) => (
                  <div key={ann.id} className="group bg-white hover:bg-gray-50 border border-gray-100 rounded-3xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-50">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            ann.target_role === 'all' ? 'bg-indigo-100 text-indigo-700' :
                            ann.target_role === 'provider' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {ann.target_role === 'all' ? 'Everyone' : ann.target_role}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                            <Clock size={10} />
                            {new Date(ann.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm truncate">{ann.title}</h4>
                      </div>
                      <button 
                        onClick={() => confirmDelete(ann.id)}
                        disabled={deletingId === ann.id}
                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                      >
                        {deletingId === ann.id ? (
                           <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                      {ann.message}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest cursor-pointer hover:gap-3 transition-all">
                        View Details <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
             <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                Broadcast Tips
             </h3>
             <div className="space-y-4">
                {[
                  "Urgent updates should start with 'ACTION REQUIRED' in the headline.",
                  "Provider broadcasts are great for announcing new policy changes.",
                  "Broadcasts are pushed to user dashboards in real-time."
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                      <span className="text-[10px] font-black">{i+1}</span>
                    </div>
                    <p className="text-xs font-medium text-indigo-100 leading-relaxed">{tip}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this broadcast? This action will remove it from all user dashboards and cannot be undone."
        confirmText="Delete Now"
        type="danger"
      />

      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
