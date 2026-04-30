// src/pages/Safety.jsx
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const PILLARS = [
  { emoji: "🛡️", title: "Verified Professionals Only",   content: "Every provider on ZERV goes through an admin verification process. We check their identity, review their submitted documents, and approve them only if they meet our quality and safety standards. Unverified providers never appear in search results." },
  { emoji: "🔑", title: "OTP Work Completion",            content: "Our unique OTP system gives you complete control. When a provider wants to mark a job as complete, a 6-digit code is sent exclusively to your email and dashboard. Share this code with the provider only when you are fully satisfied with the work. Without your OTP, the job cannot be marked complete." },
  { emoji: "⭐", title: "Ratings & Reviews",              content: "After every completed job, customers can rate and review their provider from 1–5 stars and leave written feedback. This transparent review system keeps providers accountable and helps future customers make informed decisions." },
  { emoji: "🚨", title: "Complaint System",               content: "If something goes wrong, submit a complaint from your dashboard selecting a severity level. Our admin team reviews all complaints and can issue warnings, temporarily suspend, or permanently remove provider accounts based on findings." },
  { emoji: "👤", title: "Transparent Provider Profiles",  content: "Each provider has a public profile showing their full name, location, service specializations, verification badge, and customer ratings. You always know exactly who is coming to your home before you book." },
  { emoji: "🔒", title: "Data Protection",                content: "Your personal data is never shared with third parties for marketing or advertising. We use bcrypt password hashing, JWT authentication, and secure HTTPS connections to protect your account and personal information." },
  { emoji: "📧", title: "Instant Email Notifications",    content: "Both customers and providers receive immediate email notifications for every booking action. You are always informed about the status of your booking in real time." },
  { emoji: "⚙️", title: "Admin Oversight",                content: "Our admin team actively monitors platform activity, reviews complaints, manages provider verifications, and can take immediate action when safety or quality issues are reported." },
];

const TIPS = [
  "Always verify the provider's identity when they arrive at your home.",
  "Check their ZERV profile and ratings before booking.",
  "Do not share your OTP until the work is completed to your satisfaction.",
  "Never pay extra charges not discussed before the booking.",
  "Report any suspicious behavior immediately through the complaint system.",
  "Ensure the provider is the same person shown in the ZERV profile.",
];

export default function Safety() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#00171F] to-[#003459] py-16 px-6 text-center text-white">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={32} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Safety & Trust</h1>
        <p className="text-gray-300 max-w-xl mx-auto text-sm leading-relaxed">
          At ZERV, your safety is not an afterthought — it's built into every feature of our platform. Here's how we protect you.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-12">

        {/* Safety pillars */}
        <div>
          <h2 className="text-xl font-bold text-[#00171F] mb-6">How ZERV Keeps You Safe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PILLARS.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#003459]/30 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{p.emoji}</div>
                <h3 className="font-semibold text-[#00171F] mb-2 text-sm">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety tips */}
        <div className="bg-[#00171F] rounded-2xl p-8 text-white">
          <h2 className="text-lg font-bold mb-5">Safety Tips for Customers</h2>
          <ul className="space-y-3">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">{i + 1}</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Report section */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-bold text-red-800 mb-2">Report a Safety Concern</h2>
          <p className="text-sm text-red-700 mb-5 max-w-md mx-auto">
            If you encounter unsafe behavior, an impersonator, or any serious issue, report it immediately through your dashboard or contact us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full text-sm hover:bg-red-700 transition">
              Report via Dashboard
            </Link>
            <a href="mailto:support@zerv.in" className="px-6 py-3 bg-white border border-red-300 text-red-700 font-semibold rounded-full text-sm hover:bg-red-50 transition">
              Email support@zerv.in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}