import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, Trash2, Search, Tag, FileText, 
  RefreshCw, AlertCircle, CheckCircle2, X
} from "lucide-react";
import ConfirmationModal from "../shared/ConfirmationModal";
import Toast from "../shared/Toast";

const API = "http://localhost:4000";

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  // New UI State
  const [modal, setModal] = useState({ isOpen: false, id: null });
  const [toast, setToast] = useState({ isVisible: false, message: "", type: "success" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/api/admin/categories`, 
        { name: name.trim(), description: description.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setToast({ isVisible: true, message: "Category added successfully!", type: "success" });
      setName("");
      setDescription("");
      fetchCategories();
    } catch (err) {
      setToast({ isVisible: true, message: err.response?.data?.error || "Failed to add category", type: "error" });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (id) => {
    setModal({
      isOpen: true,
      id,
      action: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API}/api/admin/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setToast({ isVisible: true, message: "Category deleted successfully", type: "success" });
          fetchCategories();
        } catch (err) {
          setToast({ isVisible: true, message: "Failed to delete category", type: "error" });
        } finally {
          setModal({ isOpen: false, id: null });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Categories</h2>
          <p className="text-gray-500 text-sm mt-1">Manage the master list of professions available on ZERV</p>
        </div>
        <button 
          onClick={fetchCategories}
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-600" />
              Add New Category
            </h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Electrician, Plumber"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe this category..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm h-24 resize-none"
                />
              </div>


              <button 
                type="submit"
                disabled={adding || !name.trim()}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md shadow-indigo-100"
              >
                {adding ? "Adding..." : "Add Category"}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Available Categories ({categories.length})</span>
            </div>

            {loading ? (
              <div className="p-20 flex justify-center">
                <RefreshCw className="animate-spin text-gray-300" size={32} />
              </div>
            ) : categories.length === 0 ? (
              <div className="p-20 text-center text-gray-400 text-sm">No categories defined yet.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                        <Tag size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{cat.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{cat.description || "No description provided."}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, id: null })}
        onConfirm={modal.action}
        title="Delete Category"
        message="Are you sure you want to delete this category? Providers assigned to this profession may need a manual update afterward."
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
