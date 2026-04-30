// src/pages/HelpCenter.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ChevronDown, ChevronUp, ArrowRight, Search } from "lucide-react";

const FAQS = [
  {
    category: "General",
    items: [
      { q: "What is ZERV?", a: "ZERV is a platform that connects customers with verified local service professionals across Kerala. Book plumbing, electrical, cleaning, carpentry, and more — all in one place." },
      { q: "Is ZERV available across all of Kerala?", a: "Yes. ZERV currently covers all 14 districts of Kerala including Thiruvananthapuram, Ernakulam, Kozhikode, Thrissur, Palakkad, and more." },
      { q: "Is the service free to use for customers?", a: "Yes. Browsing and booking services on ZERV is completely free for customers. There are no hidden charges for using the platform." },
    ],
  },
  {
    category: "Bookings",
    items: [
      { q: "How do I book a service?", a: "Search for the service you need on the home page, browse verified providers in your area, select a provider, fill in your booking details including service description, date, and address, then submit. The provider will receive an email notification instantly." },
      { q: "How does work completion verification work?", a: "When a provider marks a job as complete, a 6-digit OTP is sent to your registered email and also appears in your dashboard under OTP Notifications. Share this OTP with the provider only after you are satisfied with the work." },
      { q: "What if I'm not satisfied with the service?", a: "After a booking is completed, you can submit a complaint from your dashboard. Our admin team will review it and take appropriate action." },
    ],
  },
  {
    category: "Providers",
    items: [
      { q: "How do providers get verified?", a: "Providers register with their details, ID proof, and optional license documents. Admin reviews each application and approves providers who meet our standards. Only verified providers appear in search results." },
      { q: "How are providers rated?", a: "Providers receive ratings and reviews from customers after each completed booking. Our scoring also considers response time, review sentiment, and number of completed jobs." },
    ],
  },
  {
    category: "Account & Security",
    items: [
      { q: "How is my data stored?", a: "All your data is stored securely. Passwords are hashed using bcrypt and are never stored in plain text. Authentication uses JWT tokens." },
      { q: "How do I update my profile?", a: "Log in and go to your dashboard. Click on the Profile section where you can update your name, phone number, and address." },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${open ? "border-[#003459]/30 bg-[#003459]/5" : "border-gray-100 bg-white"}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left gap-4">
        <span className="text-sm font-medium text-[#00171F]">{q}</span>
        {open ? <ChevronUp size={18} className="text-[#003459] shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>
      {open && <div className="px-6 pb-5"><p className="text-sm text-gray-600 leading-relaxed">{a}</p></div>}
    </div>
  );
}

export default function HelpCenter() {
  const [search, setSearch] = useState("");

  const filtered = FAQS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((s) => s.items.length > 0);

  const quickLinks = [
    { label: "FAQs",             href: "/faqs",           desc: "Common questions answered" },
    { label: "Terms of Service", href: "/terms",          desc: "Our platform rules and policies" },
    { label: "Privacy Policy",   href: "/privacy",        desc: "How we handle your data" },
    { label: "Safety & Trust",   href: "/safety",         desc: "How we keep you safe" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#00171F] text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <HelpCircle size={28} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-gray-400 mb-8">Find answers to common questions about ZERV</p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search help articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 outline-none focus:border-white/40 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Quick links */}
        {!search && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {quickLinks.map((l) => (
              <Link key={l.href} to={l.href}
                className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-[#003459]/30 hover:shadow-md transition-all group">
                <div className="font-semibold text-sm text-[#00171F] group-hover:text-[#003459] mb-1">{l.label}</div>
                <div className="text-xs text-gray-500">{l.desc}</div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-[#003459] mt-3 transition-colors" />
              </Link>
            ))}
          </div>
        )}

        {/* FAQs */}
        <h2 className="text-xl font-bold text-[#00171F] mb-6">{search ? `Results for "${search}"` : "Frequently Asked Questions"}</h2>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No results found. Try a different search term.</div>
        ) : (
          <div className="space-y-8">
            {filtered.map((section) => (
              <div key={section.category}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((item) => <FaqItem key={item.q} q={item.q} a={item.a} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still need help */}
        <div className="mt-12 bg-[#00171F] rounded-2xl p-8 text-center text-white">
          <h3 className="text-lg font-bold mb-2">Still need help?</h3>
          <p className="text-gray-400 text-sm mb-4">Contact our support team and we'll get back to you as soon as possible.</p>
          <a href="mailto:support@zerv.in" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#00171F] font-semibold rounded-full text-sm hover:bg-gray-100 transition">
            Email support@zerv.in
          </a>
        </div>
      </div>
    </div>
  );
}