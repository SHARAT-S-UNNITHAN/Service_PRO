// src/pages/Terms.jsx
export default function Terms() {
  const sections = [
    { title: "1. Acceptance of Terms", content: "By accessing or using ZERV, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform." },
    { title: "2. Use of the Platform", content: "ZERV provides a marketplace connecting customers with service professionals. We do not directly provide services ourselves. Users must be at least 18 years old to register and use the platform." },
    { title: "3. User Responsibilities", content: "Users are responsible for providing accurate information during registration and booking. Any misuse of the platform, including fraudulent bookings or false reviews, may result in account termination." },
    { title: "4. Provider Responsibilities", content: "Service providers must provide accurate information about their qualifications and experience. Providers are responsible for the quality of their work and must maintain professional conduct at all times." },
    { title: "5. Payments", content: "Payments are made directly between customers and service providers. ZERV currently does not process payments. Always confirm pricing before a booking is accepted." },
    { title: "6. OTP Verification", content: "The OTP-based work completion system protects customers. Only share your OTP after you are fully satisfied with the completed work. Once shared, the booking is marked complete and cannot be reversed." },
    { title: "7. Prohibited Activities", content: "Users may not use ZERV to post false information, harass other users, circumvent the booking system, or engage in any illegal activity. Violations will result in immediate account termination." },
    { title: "8. Intellectual Property", content: "All content on ZERV including logos, text, and design is the property of ZERV. You may not reproduce or distribute any content without written permission." },
    { title: "9. Limitation of Liability", content: "ZERV acts as a marketplace and is not liable for the quality of services provided by professionals. We do not guarantee uninterrupted access to the platform." },
    { title: "10. Termination", content: "ZERV reserves the right to suspend or terminate accounts that violate these terms, receive multiple verified complaints, or engage in fraudulent activity." },
    { title: "11. Changes to Terms", content: "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes your acceptance of the revised terms." },
    { title: "12. Governing Law", content: "These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Kerala." },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00171F] py-14 px-6 text-center text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Terms of Service</h1>
        <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 space-y-7">
          <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-[#003459] pl-4">
            Please read these terms carefully before using ZERV. By using our platform, you confirm that you have read, understood, and agree to these Terms of Service.
          </p>
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-sm font-bold text-[#00171F] mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Questions? Email us at <a href="mailto:support@zerv.in" className="text-[#003459] hover:underline">support@zerv.in</a>
        </p>
      </div>
    </div>
  );
}