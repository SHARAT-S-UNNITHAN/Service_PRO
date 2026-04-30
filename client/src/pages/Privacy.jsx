// src/pages/Privacy.jsx
export default function Privacy() {
  const sections = [
    { title: "Information We Collect", content: "We collect information you provide during registration such as name, email, phone number, and address. We also collect booking details, reviews, and usage data to improve our services." },
    { title: "How We Use Your Information", content: "Your information is used to facilitate bookings, send notifications, verify providers, process complaints, and improve platform performance. We do not sell your personal data to third parties." },
    { title: "Email Notifications", content: "By registering on ZERV, you consent to receiving transactional emails such as booking confirmations, OTP codes for work completion, and important account updates." },
    { title: "Data Security", content: "We implement industry-standard security measures. Passwords are hashed using bcrypt and are never stored in plain text. Authentication tokens are signed with a secure secret key. No online platform can guarantee absolute security." },
    { title: "Data Retention", content: "We retain your data for as long as your account is active. You may request account deletion by contacting us. Deleted accounts have their personal data removed within 30 days." },
    { title: "Cookies & Local Storage", content: "ZERV uses localStorage for session management (JWT token and role). We do not use third-party tracking cookies or advertising trackers." },
    { title: "Third-Party Services", content: "We use Gmail/SMTP via Nodemailer for email delivery. Email content may be processed by Google's servers in accordance with their privacy policy. We do not share your data with any other third parties." },
    { title: "Children's Privacy", content: "ZERV is not intended for users under 18 years of age. We do not knowingly collect personal information from minors." },
    { title: "Your Rights", content: "You have the right to access, correct, or delete your personal data. You may update your profile information directly from your dashboard. For data deletion requests, contact support@zerv.in." },
    { title: "Changes to This Policy", content: "We may update this Privacy Policy from time to time. We will notify users of significant changes via email or a notice on our platform." },
    { title: "Contact Us", content: "For privacy-related questions, data deletion requests, or concerns, please contact our team at support@zerv.in." },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00171F] py-14 px-6 text-center text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-gray-400 text-sm">Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 space-y-7">
          <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-[#003459] pl-4">
            At ZERV, we take your privacy seriously. This policy explains what data we collect, how we use it, and how we protect it.
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