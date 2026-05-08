// src/components/provider/ProfileSection.jsx
import { useState } from 'react';
import axios from 'axios';
import { Pencil } from 'lucide-react';  // ← add this import

export default function ProfileSection({ profile, token, API }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveError(null);
  };

  const handleSave = async () => {
    if (
      !formData.full_name?.trim() ||
      !formData.phone?.trim() ||
      !formData.district?.trim() ||
      !formData.region?.trim() ||
      !formData.address?.trim()
    ) {
      setSaveError('Please fill all required fields');
      return;
    }

    setSaveLoading(true);
    try {
      await axios.put(
        `${API}/provider/profile`,
        {
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          district: formData.district.trim(),
          region: formData.region.trim(),
          address: formData.address.trim(),
          description: (formData.description || '').trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setEditMode(false);
    setSaveError(null);
  };

  const canEdit = profile.is_verified === 1;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Card – now includes services too */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-6 sm:px-8 sm:py-8 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 sm:gap-6">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {editMode ? (
                      <input
                        name="full_name"
                        value={formData.full_name || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-2xl font-bold"
                        placeholder="Your full name"
                      />
                    ) : (
                      profile.full_name || profile.username || 'Provider'
                    )}
                  </h1>
                  <p className="text-gray-600 mt-1.5 text-base">{profile.email}</p>
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={profile.is_verified} />

                  {!editMode && canEdit && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="p-2.5 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                      title="Edit Profile"
                    >
                      <Pencil size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Services / Professions – moved here */}
              {profile.professions?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Services / Professions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.professions.map((prof, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-indigo-100/70 text-indigo-800 rounded-full text-xs sm:text-sm font-medium"
                      >
                        {prof}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    To update professions, contact support or submit new application
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
          {saveError}
        </div>
      )}

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 lg:p-7">
          <h2 className="text-xl font-semibold text-gray-900 mb-5 pb-3 border-b">
            Personal Information
          </h2>

          <div className="space-y-5 sm:space-y-6">
            <InputField
              label="Phone Number"
              required
              editMode={editMode}
              value={formData.phone || ''}
              name="phone"
              onChange={handleChange}
              display={profile.phone}
              type="tel"
            />

            <InputField
              label="Email"
              editMode={editMode}
              value={formData.email || ''}
              name="email"
              onChange={handleChange}
              display={profile.email}
              type="email"
            />

            <InputField
              label="Username"
              editMode={false}
              display={profile.username}
            />
          </div>
        </div>

        {/* Location & About */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 lg:p-7">
          <h2 className="text-xl font-semibold text-gray-900 mb-5 pb-3 border-b">
            Location & About
          </h2>

          <div className="space-y-5 sm:space-y-6">
            <InputField
              label="District"
              required
              editMode={editMode}
              value={formData.district || ''}
              name="district"
              onChange={handleChange}
              display={profile.district}
            />

            <InputField
              label="Region"
              required
              editMode={editMode}
              value={formData.region || ''}
              name="region"
              onChange={handleChange}
              display={profile.region}
            />

            <InputField
              label="Address"
              required
              editMode={editMode}
              value={formData.address || ''}
              name="address"
              onChange={handleChange}
              display={profile.address}
              type="textarea"
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About / Description
              </label>
              {editMode ? (
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base resize-y min-h-[120px]"
                  placeholder="Describe your services, experience, specialties..."
                />
              ) : (
                <div className="text-gray-700 whitespace-pre-line text-sm sm:text-base leading-relaxed">
                  {profile.description || (
                    <span className="text-gray-400 italic">
                      No description added yet
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 lg:p-7">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">
          Uploaded Documents
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {['profile_photo', 'id_proof', 'license_doc'].map((key) => {
            const label = key
              .split('_')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

            const filePath = profile[key];

            return (
              <div
                key={key}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <h4 className="font-medium text-gray-800">{label}</h4>
                </div>
                <div className="p-5 flex flex-col items-center gap-3">
                  {filePath ? (
                    <a
                      href={`${API}${filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm text-sm sm:text-base"
                    >
                      View Document
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">Not uploaded</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save / Cancel – only in edit mode */}
      {editMode && (
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <button
            onClick={handleCancel}
            disabled={saveLoading}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className={`px-6 py-3 text-white rounded-lg font-medium transition min-w-[140px] ${
              saveLoading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
            }`}
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}

/* Reusable Input Field */
function InputField({
  label,
  required = false,
  editMode,
  value,
  name,
  onChange,
  display,
  type = 'text',
  rows,
}) {
  return (
    <div>
      <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${required ? 'after:content-["*"] after:text-red-500 after:ml-0.5' : ''}`}>
        {label}
      </label>

      {editMode ? (
        type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={rows || 4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base resize-y min-h-[100px]"
            required={required}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base transition"
            required={required}
          />
        )
      ) : (
        <div className="px-1 py-2.5 text-gray-900 font-medium text-sm sm:text-base">
          {display || '—'}
        </div>
      )}
    </div>
  );
}

/* Status Badge */
function StatusBadge({ status }) {
  const base = "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium";
  if (status === 1) return <span className={`${base} bg-green-100 text-green-800`}>Approved & Active</span>;
  if (status === -1) return <span className={`${base} bg-red-100 text-red-800`}>Rejected</span>;
  return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending Review</span>;
}