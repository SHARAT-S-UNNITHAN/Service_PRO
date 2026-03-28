// src/components/provider/DocumentsSection.jsx
export default function DocumentsSection({ profile, API }) {
  const documents = [
    {
      key: 'profile_photo',
      label: 'Profile Photo',
      description: 'Your personal profile picture used in the app',
    },
    {
      key: 'id_proof',
      label: 'ID Proof',
      description: 'Government-issued identification document',
    },
    {
      key: 'license_doc',
      label: 'License / Certificate',
      description: 'Professional license or relevant certification',
    },
  ];

  const hasAnyDocument = documents.some((doc) => profile[doc.key]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">
          Uploaded Documents
        </h2>
        <p className="text-gray-600 mt-1 text-sm">
          These are the verification documents you submitted during registration
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {!hasAnyDocument ? (
          <div className="py-16 text-center text-gray-500">
            <p className="text-lg font-medium">No documents uploaded</p>
            <p className="mt-2 max-w-md mx-auto">
              You haven't uploaded any verification documents yet. 
              These are usually required for account approval.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const filePath = profile[doc.key];

              if (!filePath) {
                return (
                  <div
                    key={doc.key}
                    className="border border-gray-200 rounded-lg p-5 bg-gray-50 text-center"
                  >
                    <div className="text-gray-400 mb-3">
                      <svg
                        className="w-10 h-10 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-800">{doc.label}</h4>
                    <p className="text-sm text-gray-500 mt-1">Not uploaded</p>
                  </div>
                );
              }

              return (
                <div
                  key={doc.key}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <div className="p-5 bg-gray-50 border-b">
                    <h4 className="font-medium text-gray-800">{doc.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  </div>

                  <div className="p-5 flex flex-col items-center gap-3">
                    <a
                      href={`${API}${filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      View Document
                    </a>

                    <p className="text-xs text-gray-500">
                      Uploaded during registration
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional info / help text */}
        <div className="mt-10 pt-6 border-t">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
            <h4 className="font-medium text-blue-800 mb-2">
              Document Guidelines
            </h4>
            <ul className="text-sm text-blue-700 space-y-1.5 list-disc pl-5">
              <li>Make sure documents are clear, readable, and not expired</li>
              <li>Supported formats: JPG, PNG, PDF</li>
              <li>Maximum file size: 5MB per document</li>
              <li>To update or replace documents, contact support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}