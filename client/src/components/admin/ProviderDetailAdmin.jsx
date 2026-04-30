// src/components/admin/ProviderDetailAdmin.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail 
} from "lucide-react";

const API = "http://localhost:4000";

export default function ProviderDetailAdmin() {
  const { id: providerId } = useParams();   // 'id' matches the route :id
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch provider when component mounts or providerId changes
  useEffect(() => {
    if (!providerId || providerId === "undefined") {
      alert("Invalid provider link");
      navigate("/admin/dashboard");
      return;
    }

    fetchProviderDetails();
  }, [providerId, navigate]);

  const fetchProviderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/admin/providers/${providerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProvider(res.data);
    } catch (err) {
      console.error("Failed to fetch provider details:", err);

      if (err.response?.status === 404) {
        alert("Provider not found");
      } else if (err.response?.status === 400) {
        alert("Invalid Provider ID");
      } else {
        alert("Failed to load provider details. Please try again.");
      }

      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status) => {
    const actionText = status === 1 ? "Approve" : status === -1 ? "Reject" : "Reset to Pending";
    
    if (!window.confirm(`Are you sure you want to ${actionText.toLowerCase()} this provider?`)) 
      return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(
        `${API}/admin/providers/${providerId}/verify`,
        { is_verified: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Provider ${actionText.toLowerCase()}d successfully!`);
      await fetchProviderDetails(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.error || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!provider) return;

    const newStatus = provider.is_active === 1 ? 0 : 1;
    const actionText = newStatus === 1 ? "enable" : "disable";

    if (!window.confirm(`Are you sure you want to ${actionText} this provider?`)) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(
        `${API}/admin/providers/${providerId}/toggle-active`,
        { is_active: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Provider ${actionText}d successfully!`);
      await fetchProviderDetails();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Not Found State
  if (!provider) {
    return (
      <div className="text-center py-20 text-red-500 text-lg">
        Provider not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Admin Dashboard</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Photo */}
          <div className="w-32 h-32 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0">
            {provider.profile_photo_url ? (
              <img
                src={provider.profile_photo_url}
                alt={provider.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-5xl">
                👤
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {provider.full_name || provider.username}
            </h1>
            <p className="text-gray-500 mt-1">Provider ID: #{provider.id}</p>

            <div className="flex flex-wrap gap-3 mt-4">
              {/* Verification Status */}
              <div className={`px-5 py-1.5 rounded-2xl text-sm font-medium ${
                provider.is_verified === 1 ? "bg-green-100 text-green-700" :
                provider.is_verified === -1 ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>
                {provider.is_verified === 1 ? "✅ Approved" :
                 provider.is_verified === -1 ? "❌ Rejected" : "⏳ Pending Approval"}
              </div>

              {/* Active Status */}
              <div className={`px-5 py-1.5 rounded-2xl text-sm font-medium ${
                provider.is_active === 1 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
              }`}>
                {provider.is_active === 1 ? "Active" : "Disabled"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
            <Mail size={20} /> Contact Information
          </h3>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Mail className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium break-all">{provider.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="font-medium">{provider.phone || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
            <MapPin size={20} /> Location
          </h3>
          <div className="space-y-5 text-sm">
            <div>
              <p className="text-gray-500">District</p>
              <p className="font-medium">{provider.district || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Region</p>
              <p className="font-medium">{provider.region || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Full Address</p>
              <p className="font-medium">{provider.address || "—"}</p>
            </div>
          </div>
        </div>

        {/* Professions */}
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="font-semibold text-lg mb-5">Professions / Services</h3>
          {provider.professions ? (
            <div className="flex flex-wrap gap-3">
              {provider.professions.split(",").map((prof, i) => (
                <span
                  key={i}
                  className="px-5 py-2 bg-blue-100 text-blue-700 rounded-2xl text-sm font-medium"
                >
                  {prof.trim()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No professions listed</p>
          )}
        </div>

        {/* Description */}
        {provider.description && (
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 md:col-span-2">
            <h3 className="font-semibold text-lg mb-4">About the Provider</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {provider.description}
            </p>
          </div>
        )}

        {/* Documents */}
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="font-semibold text-lg mb-5">Verification Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {provider.id_proof_url ? (
              <a
                href={provider.id_proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 border border-gray-200 rounded-2xl hover:border-blue-400 transition-all hover:shadow-sm"
              >
                <p className="font-medium">ID Proof</p>
                <p className="text-blue-600 text-sm mt-1">View Document →</p>
              </a>
            ) : (
              <div className="p-5 border border-dashed border-gray-300 rounded-2xl text-gray-400 text-center">
                No ID Proof uploaded
              </div>
            )}

            {provider.license_url ? (
              <a
                href={provider.license_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 border border-gray-200 rounded-2xl hover:border-blue-400 transition-all hover:shadow-sm"
              >
                <p className="font-medium">License / Certificate</p>
                <p className="text-blue-600 text-sm mt-1">View Document →</p>
              </a>
            ) : (
              <div className="p-5 border border-dashed border-gray-300 rounded-2xl text-gray-400 text-center">
                No License uploaded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 pt-8 border-t border-gray-100">
        {provider.is_verified !== 1 && (
          <button
            onClick={() => handleVerify(1)}
            disabled={actionLoading}
            className="flex-1 md:flex-none px-10 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-2xl font-semibold transition"
          >
            Approve Provider
          </button>
        )}

        {provider.is_verified !== -1 && (
          <button
            onClick={() => handleVerify(-1)}
            disabled={actionLoading}
            className="flex-1 md:flex-none px-10 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-2xl font-semibold transition"
          >
            Reject Provider
          </button>
        )}

        <button
          onClick={handleToggleActive}
          disabled={actionLoading}
          className="flex-1 md:flex-none px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-semibold transition"
        >
          {provider.is_active === 1 ? "Disable Account" : "Enable Account"}
        </button>
      </div>
    </div>
  );
}