// src/components/Footer.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Brand icons (social media)
import {
  faTwitter,
  faFacebookF,
  faInstagram,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons';

// Solid icons (contact)
import {
  faEnvelope,
  faPhone,
  faClock,
} from '@fortawesome/free-solid-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-[#00171f] text-gray-300 pt-16 pb-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        
        {/* Brand & Description */}
        <div>
          <a
            href="/"
            className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5 inline-block hover:opacity-90 transition"
          >
            SmartService
          </a>
          <p className="text-gray-400 mb-6 leading-relaxed text-base">
            Connecting people with trusted local professionals. Fast, transparent, and reliable 
            home & personal services across India.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-[#003459] hover:text-white transition-all duration-300"
              aria-label="Twitter"
            >
              <FontAwesomeIcon icon={faTwitter} className="text-lg" />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-[#003459] hover:text-white transition-all duration-300"
              aria-label="Facebook"
            >
              <FontAwesomeIcon icon={faFacebookF} className="text-lg" />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-[#003459] hover:text-white transition-all duration-300"
              aria-label="Instagram"
            >
              <FontAwesomeIcon icon={faInstagram} className="text-lg" />
            </a>
            <a
              href="#"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-[#003459] hover:text-white transition-all duration-300"
              aria-label="LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedinIn} className="text-lg" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-5 text-lg">Quick Links</h3>
          <ul className="space-y-3 text-gray-400 text-base">
            <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Become a Professional</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
          </ul>
        </div>

        {/* Popular Services */}
        <div>
          <h3 className="text-white font-semibold mb-5 text-lg">Popular Services</h3>
          <ul className="space-y-3 text-gray-400 text-base">
            <li><a href="#" className="hover:text-white transition-colors">Home Cleaning</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Plumbing</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Electrical Repair</a></li>
            <li><a href="#" className="hover:text-white transition-colors">AC Installation & Repair</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Home Painting</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pest Control</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Appliance Repair</a></li>
          </ul>
        </div>

        {/* Support & Contact */}
        <div>
          <h3 className="text-white font-semibold mb-5 text-lg">Support</h3>
          <ul className="space-y-3 text-gray-400 mb-8 text-base">
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Safety & Trust</a></li>
          </ul>

          <h3 className="text-white font-semibold mb-5 text-lg">Get in Touch</h3>
          <div className="space-y-4 text-gray-400 text-base">
            <p>
              <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-[#003459]" />
              <a 
                href="mailto:support@smartservice.in" 
                className="hover:text-white transition-colors"
              >
                support@smartservice.in
              </a>
            </p>
            <p>
              <FontAwesomeIcon icon={faPhone} className="mr-3 text-[#003459]" />
              <a 
                href="tel:+919876543210" 
                className="hover:text-white transition-colors"
              >
                +91 98765 43210
              </a>
            </p>
            <p>
              <FontAwesomeIcon icon={faClock} className="mr-3 text-[#003459]" />
              Mon–Sat: 8:00 AM – 8:00 PM
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SmartService. All rights reserved.
      </div>
    </footer>
  );
}