// src/components/admin/HelpCenterSection.jsx
import { useState } from "react";
import {
  HelpCircle, FileText, Shield, ShieldCheck,
  ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";

// ── FAQ Data ────────────────────────────────────────────────
const FAQS = [
  {
    category: "General",
    items: [
      {
        q: "What is SmartService?",
        a: "SmartService is a platform that connects customers with verified local service professionals across Kerala. Users can browse, book, and review service providers for plumbing, electrical, cleaning, carpentry, and more.",
      },
      {
        q: "Is SmartService available across all of Kerala?",
        a: "Yes. SmartService currently covers all 14 districts of Kerala including Thiruvananthapuram, Ernakulam, Kozhikode, Thrissur, Palakkad, and more.",
      },
      {
        q: "Is the service free to use for customers?",
        a: "Yes. Browsing and booking services on SmartService is completely free for customers. There are no hidden charges for using the platform.",
      },
    ],
  },
  {
    category: "Bookings",
    items: [
      {
        q: "How do I book a service?",
        a: "Search for the service you need on the home page, browse verified providers in your area, select a provider, fill in your booking details including service description, date, and address, then submit. The provider will receive an email notification.",
      },
      {
        q: "Can I cancel a booking?",
        a: "You can contact your provider directly to discuss cancellations. Future updates will include an in-app cancellation feature.",
      },
      {
        q: "How does work completion verification work?",
        a: "When a provider marks a job as complete, a 6-digit OTP is sent to your registered email. You also see this OTP in your dashboard under OTP Notifications. Share this OTP with the provider only after you are satisfied with the work.",
      },
      {
        q: "What if I'm not satisfied with the service?",
        a: "After a booking is completed, you can submit a complaint from your dashboard. Our admin team will review it and take appropriate action against the provider.",
      },
    ],
  },
  {
    category: "Providers",
    items: [
      {
        q: "How do providers get verified?",
        a: "Providers register with their details, ID proof, and optional license documents. Admin reviews each application and approves providers who meet our standards. Only verified providers appear in search results.",
      },
      {
        q: "How are providers rated?",
        a: "Providers receive ratings and reviews from customers after each completed booking. Our ML-style scoring also considers response time, review sentiment, and number of completed jobs.",
      },
      {
        q: "Can a provider be removed from the platform?",
        a: "Yes. Admins can disable or delete provider accounts based on complaints, poor performance, or policy violations.",
      },
    ],
  },
  {
    category: "Account & Security",
    items: [
      {
        q: "How is my data stored?",
        a: "All your data is stored securely in our database. Passwords are hashed using bcrypt and are never stored in plain text. Authentication uses JWT tokens.",
      },
      {
        q: "How do I update my profile?",
        a: "Log in and go to your dashboard. Click on the Profile section where you can update your name, phone number, and address.",
      },
      {
        q: "What should I do if I forget my password?",
        a: "Password reset functionality is coming soon. For now, please contact the admin team for assistance.",
      },
    ],
  },
];

// ── Terms of Service content ─────────────────────────────────
const TERMS = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing or using SmartService, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.",
  },
  {
    title: "2. Use of the Platform",
    content: "SmartService provides a marketplace connecting customers with service professionals. We do not directly provide services ourselves. Users must be at least 18 years old to register and use the platform.",
  },
  {
    title: "3. User Responsibilities",
    content: "Users are responsible for providing accurate information during registration and booking. Any misuse of the platform, including fraudulent bookings or false reviews, may result in account termination.",
  },
  {
    title: "4. Provider Responsibilities",
    content: "Service providers must provide accurate information about their qualifications and experience. Providers are responsible for the quality of their work and must maintain professional conduct at all times.",
  },
  {
    title: "5. Payments",
    content: "Payments are made directly between customers and service providers. SmartService currently does not process payments. Always confirm pricing before a booking is accepted.",
  },
  {
    title: "6. OTP Verification",
    content: "The OTP-based work completion system is in place to protect customers. Customers should only share the OTP after they are fully satisfied with the completed work. Once shared, the booking is marked complete and cannot be reversed.",
  },
  {
    title: "7. Termination",
    content: "SmartService reserves the right to suspend or terminate accounts that violate these terms, receive multiple verified complaints, or engage in fraudulent activity.",
  },
  {
    title: "8. Changes to Terms",
    content: "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes your acceptance of the revised terms.",
  },
];

// ── Privacy Policy content ────────────────────────────────────
const PRIVACY = [
  {
    title: "Information We Collect",
    content: "We collect information you provide during registration such as name, email, phone number, and address. We also collect booking details and usage data to improve our services.",
  },
  {
    title: "How We Use Your Information",
    content: "Your information is used to facilitate bookings, send notifications, verify providers, process complaints, and improve platform performance. We do not sell your personal data to third parties.",
  },
  {
    title: "Email Notifications",
    content: "By registering on SmartService, you consent to receiving transactional emails such as booking confirmations, OTP codes, and important account updates.",
  },
  {
    title: "Data Security",
    content: "We implement industry-standard security measures. Passwords are hashed using bcrypt. Authentication tokens are signed with a secure secret. However, no online platform can guarantee absolute security.",
  },
  {
    title: "Data Retention",
    content: "We retain your data for as long as your account is active. You may request account deletion by contacting the admin. Deleted accounts have their personal data removed within 30 days.",
  },
  {
    title: "Cookies",
    content: "SmartService uses localStorage for session management. We do not use third-party tracking cookies.",
  },
  {
    title: "Third-Party Services",
    content: "We use Gmail/SMTP via Nodemailer for email delivery. Email content may be processed by Google's servers in accordance with their privacy policy.",
  },
  {
    title: "Contact",
    content: "For privacy-related questions or data deletion requests, please contact the admin team through the platform.",
  },
];

// ── Safety & Trust content ─────────────────────────────────
const SAFETY = [
  {
    icon: "🛡️",
    title: "Verified Professionals Only",
    content: "Every provider on SmartService goes through an admin verification process. We check their identity, review their documents, and approve them only if they meet our standards.",
  },
  {
    icon: "🔑",
    title: "OTP Work Completion",
    content: "Our unique OTP system ensures you control when a booking is marked complete. A 6-digit code is sent only to you — share it with the provider only when you're satisfied with the work.",
  },
  {
    icon: "⭐",
    title: "Ratings & Reviews",
    content: "After every completed job, customers can rate and review their provider. This keeps providers accountable and helps future customers make informed decisions.",
  },
  {
    icon: "🚨",
    title: "Complaint System",
    content: "If something goes wrong, you can submit a complaint directly from your dashboard. Our admin team reviews all complaints and takes action including warnings, suspension, or deletion of provider accounts.",
  },
  {
    icon: "👤",
    title: "Profile Transparency",
    content: "Each provider has a public profile showing their name, location, professions, verification status, and ratings. You always know who is coming to your home.",
  },
  {
    icon: "🔒",
    title: "Data Protection",
    content: "Your personal data is never shared with third parties for marketing. We use secure password hashing and JWT authentication to protect your account.",
  },
];

// ── FAQ Accordion item ────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${open ? "border-indigo-200 bg-indigo-50/30" : "border-gray-100 bg-white"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
      >
        <span className="text-sm font-medium text-gray-900">{q}</span>
        {open
          ? <ChevronUp size={18} className="text-indigo-600 shrink-0" />
          : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ── Tab button ─────────────────────────────────────────────
function TabBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────
export default function HelpCenterSection() {
  const [activeTab, setActiveTab] = useState("faq");

  const tabs = [
    { id: "faq",     label: "FAQs",             icon: HelpCircle  },
    { id: "terms",   label: "Terms of Service",  icon: FileText    },
    { id: "privacy", label: "Privacy Policy",    icon: Shield      },
    { id: "safety",  label: "Safety & Trust",    icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <HelpCircle size={20} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Help Center</h2>
        </div>
        <p className="text-sm text-gray-500 ml-13">
          Platform documentation, policies, and safety information for SmartService.
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((t) => (
          <TabBtn key={t.id} icon={t.icon} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />
        ))}
      </div>

      {/* ── FAQs ── */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          {FAQS.map((section) => (
            <div key={section.category} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{section.category}</h3>
              </div>
              <div className="p-4 space-y-2">
                {section.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Terms of Service ── */}
      {activeTab === "terms" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              <h3 className="text-base font-semibold text-gray-900">Terms of Service</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
          </div>
          <div className="p-6 space-y-5">
            {TERMS.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{section.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Privacy Policy ── */}
      {activeTab === "privacy" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-indigo-600" />
              <h3 className="text-base font-semibold text-gray-900">Privacy Policy</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
          </div>
          <div className="p-6 space-y-5">
            {PRIVACY.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{section.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Safety & Trust ── */}
      {activeTab === "safety" && (
        <div className="space-y-4">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck size={24} />
              <h3 className="text-lg font-semibold">Your Safety is Our Priority</h3>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed">
              SmartService is built with multiple layers of safety to protect both customers and service providers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAFETY.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 transition-colors">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>

          {/* Report abuse box */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-red-800 mb-1">Report Abuse or Safety Concern</h4>
              <p className="text-xs text-red-700">If you encounter unsafe behaviour or a serious issue, please submit a complaint from your dashboard immediately.</p>
            </div>
            <span className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl shrink-0">
              Go to Complaints
            </span>
          </div>
        </div>
      )}
    </div>
  );
}