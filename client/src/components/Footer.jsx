// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faFacebookF, faInstagram, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone, faClock } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
  return (
    <footer className="bg-[#00171f] text-gray-300 pt-16 pb-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

        {/* Brand */}
        <div>
          <Link to="/" className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5 inline-block hover:opacity-90 transition">
            ZERV
          </Link>
          <p className="text-gray-400 mb-6 leading-relaxed text-base">
            Connecting people with trusted local professionals. Fast, transparent, and reliable home & personal services across Kerala.
          </p>
          <div className="flex gap-4">
            {[
              { icon: faTwitter,   label: "Twitter"   },
              { icon: faFacebookF, label: "Facebook"  },
              { icon: faInstagram, label: "Instagram" },
              { icon: faLinkedinIn,label: "LinkedIn"  },
            ].map(({ icon, label }) => (
              <a key={label} href="#" aria-label={label}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-[#003459] hover:text-white transition-all duration-300">
                <FontAwesomeIcon icon={icon} className="text-lg" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-5 text-lg">Quick Links</h3>
          <ul className="space-y-3 text-gray-400 text-base">
            <li><Link to="/"                  className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/search"            className="hover:text-white transition-colors">Browse Services</Link></li>
            <li><Link to="/provider/register" className="hover:text-white transition-colors">Become a Professional</Link></li>
            <li><Link to="/signup"            className="hover:text-white transition-colors">Create Account</Link></li>
            <li><Link to="/login"             className="hover:text-white transition-colors">Login</Link></li>
          </ul>
        </div>

        {/* Popular Services */}
        <div>
          <h3 className="text-white font-semibold mb-5 text-lg">Popular Services</h3>
          <ul className="space-y-3 text-gray-400 text-base">
            {["Cleaning","Plumbing","Electrical","AC Repair","Painting","Carpenter","Gardening","Car Service"].map((s) => (
              <li key={s}>
                <Link to={`/search?service=${encodeURIComponent(s)}`} className="hover:text-white transition-colors">{s}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support & Contact */}
        <div>
          <h3 className="text-white font-semibold mb-5 text-lg">Support</h3>
          <ul className="space-y-3 text-gray-400 mb-8 text-base">
            <li><Link to="/help"    className="hover:text-white transition-colors">Help Center</Link></li>
            <li><Link to="/faqs"    className="hover:text-white transition-colors">FAQs</Link></li>
            <li><Link to="/terms"   className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/safety"  className="hover:text-white transition-colors">Safety & Trust</Link></li>
          </ul>

          <h3 className="text-white font-semibold mb-5 text-lg">Get in Touch</h3>
          <div className="space-y-4 text-gray-400 text-base">
            <p>
              <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-[#003459]" />
              <a href="mailto:support@zerv.in" className="hover:text-white transition-colors">support@zerv.in</a>
            </p>
            <p>
              <FontAwesomeIcon icon={faPhone} className="mr-3 text-[#003459]" />
              <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
            </p>
            <p>
              <FontAwesomeIcon icon={faClock} className="mr-3 text-[#003459]" />
              Mon–Sat: 8:00 AM – 8:00 PM
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <span>© {new Date().getFullYear()} ZERV. All rights reserved.</span>
        <div className="flex gap-5">
          <Link to="/terms"   className="hover:text-gray-300 transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
          <Link to="/safety"  className="hover:text-gray-300 transition-colors">Safety</Link>
        </div>
      </div>
    </footer>
  );
}