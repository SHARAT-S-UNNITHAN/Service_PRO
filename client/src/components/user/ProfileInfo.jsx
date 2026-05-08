// src/components/user/ProfileInfo.jsx
import { Pencil, Save, X } from "lucide-react";

export default function ProfileInfo({
  profile,
  editMode,
  formData,
  saveError,
  saveLoading,
  onInputChange,
  onSave,
  onCancel,
  onEdit
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">
            {editMode ? (
              <input
                name="full_name"
                value={formData.full_name || ""}
                onChange={onInputChange}
                className="bg-transparent border-b-2 border-gray-300 focus:border-indigo-600 outline-none text-3xl font-semibold w-full"
              />
            ) : (
              profile?.full_name || "User"
            )}
          </h2>
          <p className="text-gray-600 mt-2 text-lg">{profile?.email}</p>
        </div>

        {!editMode && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl transition active:scale-95"
          >
            <Pencil size={18} />
            Edit Profile
          </button>
        )}
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Full Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name || ""}
                  onChange={onInputChange}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-lg"
                />
              ) : (
                <p className="text-xl font-medium text-gray-900">{profile?.full_name || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Email Address</label>
              {editMode ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={onInputChange}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-lg"
                />
              ) : (
                <p className="text-xl font-medium text-gray-900">{profile?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Phone Number</label>
              {editMode ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={onInputChange}
                  maxLength={10}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-600 text-lg"
                />
              ) : (
                <p className="text-xl font-medium text-gray-900">{profile?.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Address Information</h3>
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Full Address</label>
              {editMode ? (
                <textarea
                  name="address"
                  value={formData.address || ""}
                  onChange={onInputChange}
                  rows={3}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-600 resize-y min-h-[100px]"
                />
              ) : (
                <p className="text-lg text-gray-900 leading-relaxed">{profile?.address || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Landmark (Optional)</label>
              {editMode ? (
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark || ""}
                  onChange={onInputChange}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-600"
                />
              ) : (
                <p className="text-lg text-gray-900">{profile?.landmark || "No landmark added"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {editMode && (
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 rounded-2xl hover:bg-gray-50 font-medium transition"
          >
            <X size={20} />
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saveLoading}
            className={`flex items-center justify-center gap-2 px-10 py-4 bg-black text-white rounded-2xl font-medium transition active:scale-95 ${
              saveLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-900'
            }`}
          >
            <Save size={20} />
            {saveLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}