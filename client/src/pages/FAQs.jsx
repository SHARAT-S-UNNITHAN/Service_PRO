// src/pages/FAQs.jsx
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const ALL_FAQS = [
  { category: "General",   q: "What is ZERV?",                          a: "ZERV is a platform that connects customers with verified local service professionals across Kerala. Book plumbing, electrical, cleaning, carpentry, and more — all in one place." },
  { category: "General",   q: "Is ZERV available across all of Kerala?", a: "Yes. ZERV currently covers all 14 districts of Kerala including Thiruvananthapuram, Ernakulam, Kozhikode, Thrissur, Palakkad, Kannur, and more." },
  { category: "General",   q: "Is the service free for customers?",      a: "Yes. Browsing and booking services on ZERV is completely free for customers. There are no hidden platform charges." },
  { category: "Bookings",  q: "How do I book a service?",                a: "Search for the service you need, browse verified providers in your area, select one, fill in your booking details, and submit. The provider gets an instant email notification." },
  { category: "Bookings",  q: "How does OTP work completion verification work?", a: "When a provider marks a job complete, a 6-digit OTP is sent to your email and appears in your dashboard. Share it with the provider only when you are fully satisfied." },
  { category: "Bookings",  q: "What if I'm not satisfied?",              a: "Submit a complaint from your dashboard after a completed booking. Our admin team will review and take action." },
  { category: "Bookings",  q: "Can I cancel a booking?",                 a: "Contact your provider directly. An in-app cancellation feature is coming in a future update." },
  { category: "Providers", q: "How do providers get verified?",          a: "Providers submit their details, ID proof, and documents. Admin reviews and approves only those who meet our standards. Only verified providers appear in search." },
  { category: "Providers", q: "How are providers rated?",                a: "Customers rate providers after each completed booking. Our scoring also factors in response time and review quality." },
  { category: "Providers", q: "Can a provider be removed?",              a: "Yes. Admins can disable or delete provider accounts based on complaints or policy violations." },
  { category: "Account",   q: "How is my password stored?",              a: "Passwords are hashed using bcrypt and are never stored in plain text. We use JWT tokens for secure authentication." },
  { category: "Account",   q: "How do I update my profile?",             a: "Log in, go to your dashboard, and click the Profile section to update your name, phone, and address." },
  { category: "Account",   q: "I forgot my password. What do I do?",     a: "Password reset is coming soon. For now, contact our support team at support@zerv.in for assistance." },
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

export default function FAQs() {
  const categories = [...new Set(ALL_FAQS.map((f) => f.category))];
  const [active, setActive] = useState("All");

  const shown = active === "All" ? ALL_FAQS : ALL_FAQS.filter((f) => f.category === active);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00171F] py-14 px-6 text-center text-white">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-400 text-sm">Everything you need to know about ZERV</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["All", ...categories].map((cat) => (
            <button key={cat} onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active === cat ? "bg-[#00171F] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#003459]"}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {shown.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm mb-3">Didn't find your answer?</p>
          <Link to="/help" className="text-[#003459] font-semibold text-sm hover:underline">Visit Help Center →</Link>
        </div>
      </div>
    </div>
  );
}