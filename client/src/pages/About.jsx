// src/pages/About.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faRocket,
  faHandshake,
  faHeart,
  faStar,
  faUsers,
  faCheckCircle,
  faArrowRight,
  faChartLine,
  faShieldAlt,
  faClock,
  faGlobe,
  faAward,
  faQuoteLeft,
  faLightbulb,
  faTree,
  faHandHoldingHeart,
  faBullhorn,
  faGraduationCap,
  faTrophy,
  faMedal,
  faUserCheck,
  faMoneyBillWave,
  faHeadset,
  faMobileAlt,
  faCodeBranch,
  faCrown,
  faInfinity,
  faCertificate,
  faPlay,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../hooks/useTheme";

/* ─────────────────────────────────────────
   Animated Counter Component
───────────────────────────────────────── */
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────────────────
   Timeline Item Component
───────────────────────────────────────── */
function TimelineItem({ year, title, description, icon, isLast }) {
  return (
    <div className="relative pl-8 pb-8 last:pb-0 group">
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-[#003459] to-[#00171F] dark:from-blue-500 dark:to-blue-800 opacity-30" />
      )}
      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#003459] dark:bg-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
        <FontAwesomeIcon icon={icon} className="text-white text-xs" />
      </div>
      <div className="bg-white dark:bg-[#00253a] rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 ml-2 border border-gray-100 dark:border-white/5">
        <span className="text-sm font-bold text-[#003459] dark:text-blue-400">{year}</span>
        <h3 className="text-lg font-bold text-[#00171F] dark:text-white mt-1 mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Team Member Card
───────────────────────────────────────── */
function TeamMember({ name, role, image, bio, socials }) {
  return (
    <div className="group relative bg-white dark:bg-[#00253a] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#00171F] to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500 z-10" />
        <img
          src={image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=003459&color=fff&size=200`}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
          <div className="flex gap-2 justify-center">
            {socials?.map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#003459] hover:bg-[#003459] hover:text-white transition-all duration-300"
              >
                <FontAwesomeIcon icon={social.icon} size="sm" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="p-5 text-center">
        <h3 className="text-lg font-bold text-[#00171F] dark:text-white mb-1">{name}</h3>
        <p className="text-sm text-[#003459] dark:text-blue-400 font-medium mb-2">{role}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{bio}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Value Proposition Card
───────────────────────────────────────── */
function ValueCard({ icon, title, description, delay }) {
  return (
    <div
      className="group bg-white dark:bg-[#00253a] rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-white/5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 bg-gradient-to-br from-[#003459]/10 to-[#00171F]/5 dark:from-blue-500/20 dark:to-blue-800/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <FontAwesomeIcon icon={icon} className="text-2xl text-[#003459] dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-bold text-[#00171F] dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main About Component
───────────────────────────────────────── */
export default function About() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeVideo, setActiveVideo] = useState(false);
  const videoRef = useRef(null);

  // Mission statement ref for parallax effect
  const missionRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (missionRef.current) {
        const rect = missionRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
        setMousePosition({ x, y });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#00171F] overflow-hidden font-sans selection:bg-[#003459]/20 selection:text-[#00171F] dark:selection:text-white pt-20 transition-colors duration-300">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#003459]/5 to-transparent dark:from-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-[#00171F]/5 to-transparent dark:from-blue-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#003459]/5 to-[#00171F]/5 dark:from-blue-500/5 dark:to-blue-900/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 py-16 md:py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#003459]/10 dark:bg-blue-500/20 mb-6 animate-fade-in-up">
            <FontAwesomeIcon icon={faBuilding} className="text-[#003459] dark:text-blue-400 text-xs" />
            <span className="text-xs font-semibold text-[#003459] dark:text-blue-400">Our Story</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-[#00171F] dark:text-white mb-6 animate-fade-in-up leading-tight">
            Revolutionizing the
            <br />
            <span className="bg-gradient-to-r from-[#00171F] via-[#003459] to-[#00171F] dark:from-blue-300 dark:via-blue-100 dark:to-blue-300 bg-clip-text text-transparent">
              service industry
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 animate-fade-in-up leading-relaxed" style={{ animationDelay: "100ms" }}>
            We're on a mission to connect millions with trusted local professionals, 
            making quality service accessible, transparent, and hassle-free for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <button
              onClick={() => navigate("/search")}
              className="px-8 py-3 bg-gradient-to-r from-[#00171F] to-[#003459] dark:from-blue-600 dark:to-blue-800 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              Find a Professional
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
            <button
              onClick={() => setActiveVideo(true)}
              className="px-8 py-3 bg-white dark:bg-[#00253a] border-2 border-[#003459]/30 dark:border-blue-500/30 text-[#003459] dark:text-blue-400 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faPlay} />
              Watch Our Story
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-12 bg-gray-50 dark:bg-[#001824] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 5000, suffix: "+", label: "Verified Professionals", icon: faUserCheck },
              { value: 50000, suffix: "+", label: "Jobs Completed", icon: faCheckCircle },
              { value: 98, suffix: "%", label: "Satisfaction Rate", icon: faHeart },
              { value: 120, suffix: "+", label: "Cities Covered", icon: faGlobe },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#003459]/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FontAwesomeIcon icon={stat.icon} className="text-[#003459] dark:text-blue-400 text-lg" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-[#003459] dark:text-blue-400 mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement with Parallax */}
      <section ref={missionRef} className="relative z-10 py-20 px-6 overflow-hidden">
        <div
          className="max-w-4xl mx-auto text-center relative"
          style={{
            transform: `perspective(1000px) rotateX(${mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * 0.05}deg)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#003459]/5 to-[#00171F]/5 dark:from-blue-500/5 dark:to-blue-900/5 rounded-3xl blur-2xl" />
          <div className="relative bg-white/80 dark:bg-[#00253a]/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200 dark:border-white/10">
            <FontAwesomeIcon icon={faQuoteLeft} className="text-4xl text-[#003459]/30 dark:text-blue-400/30 mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#00171F] dark:text-white mb-6">
              Our Mission
            </h2>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              To empower every individual and business with instant access to trusted, 
              vetted professionals, while creating meaningful opportunities for skilled 
              workers to thrive in the digital economy.
            </p>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[#003459] dark:text-blue-400">
              <FontAwesomeIcon icon={faInfinity} />
              <span>Making excellence accessible, always.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="relative z-10 py-16 bg-gray-50 dark:bg-[#001824]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#00171F] dark:text-white mb-4">
              What Drives Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Core principles that guide everything we do at SmartService
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: faShieldAlt, title: "Trust & Safety", desc: "Every professional undergoes rigorous verification and background checks." },
              { icon: faClock, title: "Speed & Efficiency", desc: "Connect with qualified pros in under 60 seconds, 24/7." },
              { icon: faMoneyBillWave, title: "Fair Pricing", desc: "Transparent, upfront quotes with no hidden fees or surprises." },
              { icon: faHeadset, title: "24/7 Support", desc: "Dedicated customer support throughout your service journey." },
            ].map((value, idx) => (
              <ValueCard key={idx} {...value} delay={idx * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey Timeline */}
      <section className="relative z-10 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#00171F] dark:text-white mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Milestones that shaped SmartService into what it is today
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <TimelineItem
                year="2021"
                title="The Beginning"
                description="SmartService launched with a vision to transform local service discovery, starting with 50 professionals in Bangalore."
                icon={faRocket}
              />
              <TimelineItem
                year="2022"
                title="Expansion Phase"
                description="Expanded to 5 major cities, onboarded 1,000+ professionals, and completed 10,000 jobs with 97% satisfaction."
                icon={faChartLine}
              />
              <TimelineItem
                year="2023"
                title="Tech Innovation"
                description="Launched AI-powered matching, real-time tracking, and secure payment system. Reached 50,000+ jobs milestone."
                icon={faMobileAlt}
              />
            </div>
            <div className="space-y-4">
              <TimelineItem
                year="2024"
                title="National Presence"
                description="Present in 120+ cities, 5,000+ verified professionals, and introduced premium features for businesses."
                icon={faGlobe}
              />
              <TimelineItem
                year="2025"
                title="Global Vision"
                description="Expanding to international markets, launching professional certification programs, and sustainability initiatives."
                icon={faCrown}
                isLast
              />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="relative z-10 py-16 bg-gradient-to-br from-[#00171F] to-[#003459] dark:from-[#001020] dark:to-[#003459] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact So Far</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Numbers that tell the story of positive change
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 15000, suffix: "+", label: "Active Professionals", icon: faUsers },
              { value: 120, suffix: "+", label: "Cities", icon: faGlobe },
              { value: 50000, suffix: "+", label: "Happy Customers", icon: faHeart },
              { value: 4.9, suffix: "/5", label: "Average Rating", icon: faStar },
            ].map((metric, idx) => (
              <div key={idx} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <FontAwesomeIcon icon={metric.icon} className="text-3xl mb-3 text-blue-200" />
                <div className="text-4xl font-extrabold mb-1">
                  <AnimatedCounter target={metric.value} suffix={metric.suffix} duration={1500} />
                </div>
                <div className="text-sm text-blue-100">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="relative z-10 py-16 bg-gray-50 dark:bg-[#001824]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#00171F] dark:text-white mb-4">
              Meet Our Leadership
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Passionate individuals driving innovation and excellence
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Arjun Mehta", role: "Founder & CEO", bio: "Former tech executive with 15+ years in marketplace platforms, passionate about empowering local businesses.", socials: [] },
              { name: "Priya Sharma", role: "CTO", bio: "AI and machine learning expert, leading our matching algorithm development and tech innovation.", socials: [] },
              { name: "Vikram Singh", role: "Head of Operations", bio: "Ensuring quality control and professional onboarding across all service categories.", socials: [] },
              { name: "Neha Gupta", role: "Customer Experience", bio: "Dedicated to delivering exceptional support and satisfaction for every customer.", socials: [] },
              { name: "Rahul Reddy", role: "Business Development", bio: "Expanding our network of professionals and forging strategic partnerships.", socials: [] },
              { name: "Anjali Nair", role: "Marketing Director", bio: "Building brand trust and connecting with communities nationwide.", socials: [] },
            ].map((member, idx) => (
              <TeamMember key={idx} {...member} />
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="relative z-10 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#00171F] dark:text-white mb-4">
              Awards & Recognition
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Industry acknowledgment for our innovation and impact
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { award: "Best Startup", year: "2023", org: "TechCrunch", icon: faTrophy, color: "text-yellow-500" },
              { award: "Innovation Award", year: "2024", org: "Forbes India", icon: faLightbulb, color: "text-blue-500" },
              { award: "Customer Choice", year: "2024", org: "Economic Times", icon: faMedal, color: "text-purple-500" },
              { award: "Trust Seal", year: "2024", org: "Consumer Forum", icon: faCertificate, color: "text-green-500" },
            ].map((award, idx) => (
              <div key={idx} className="bg-white dark:bg-[#00253a] rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-white/5">
                <FontAwesomeIcon icon={award.icon} className={`text-4xl ${award.color} mb-3`} />
                <h3 className="font-bold text-[#00171F] dark:text-white mb-1">{award.award}</h3>
                <p className="text-sm text-[#003459] dark:text-blue-400 font-medium">{award.year}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{award.org}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Commitment */}
      <section className="relative z-10 py-16 bg-gray-50 dark:bg-[#001824]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <FontAwesomeIcon icon={faTree} className="text-green-600 dark:text-green-400 text-xs" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-300">Sustainability</span>
              </div>
              <h2 className="text-3xl font-bold text-[#00171F] dark:text-white mb-4">
                Committed to a Better Future
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                We believe in responsible growth. SmartService is committed to carbon-neutral operations,
                supporting local communities, and creating sustainable livelihoods for millions of professionals.
              </p>
              <div className="space-y-3">
                {[
                  "100% carbon-neutral delivery tracking by 2026",
                  "Supporting skill development for 10,000+ professionals",
                  "Partnering with local communities for economic growth",
                ].map((initiative, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-0.5 text-sm" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{initiative}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/sustainability")}
                className="mt-8 px-6 py-2.5 bg-[#003459] dark:bg-blue-600 text-white rounded-full text-sm font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                Learn About Our Initiatives
              </button>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#003459] to-[#00171F] dark:from-blue-500 dark:to-blue-800 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative bg-white dark:bg-[#00253a] rounded-2xl p-8 text-center border border-gray-200 dark:border-white/10">
                <FontAwesomeIcon icon={faHandHoldingHeart} className="text-5xl text-[#003459] dark:text-blue-400 mb-4" />
                <div className="text-3xl font-bold text-[#003459] dark:text-blue-400 mb-2">
                  <AnimatedCounter target={10000} suffix="+" duration={2000} />
                </div>
                <p className="text-gray-600 dark:text-gray-400">Lives positively impacted through our community programs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={() => setActiveVideo(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-2xl"
            >
              ✕
            </button>
            <div className="relative pb-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="SmartService Story"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#00171F] to-[#003459] dark:from-[#001020] dark:to-[#003459] p-12 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10">
              <FontAwesomeIcon icon={faBullhorn} className="text-4xl text-white/80 mb-4" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Join Us in Our Mission
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                Whether you're a customer looking for quality service or a professional ready to grow your business, we're here for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/signup")}
                  className="px-8 py-3 bg-white text-[#00171F] rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  Get Started Today
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Contact Our Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animation Keyframes - Add to your global CSS or here via style tag */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}