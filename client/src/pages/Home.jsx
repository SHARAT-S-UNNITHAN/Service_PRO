// src/pages/Home.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faLocationDot,
  faArrowRight,
  faShieldHalved,
  faBoltLightning,
  faTag,
  faCircleCheck,
  faCalendarCheck,
  faCheck,
  faFileLines,
  faUserTie,
  faCouch,
  faCalendarPlus,
  faUserPlus,
  faSun,
  faMoon,
  faStar,
  faWrench,
  faHammer,
  faBroom,
  faCar,
  faLeaf,
  faPaintRoller,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../hooks/useTheme";

/* ─────────────────────────────────────────
   Animated number counter (scroll-triggered)
───────────────────────────────────────── */
function CountUp({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(start);
        }, 20);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────
   Data constants
───────────────────────────────────────── */
const HERO_CATEGORIES = [
  { label: "Plumbing",    icon: faWrench        },
  { label: "Electrical",  icon: faBoltLightning  },
  { label: "Cleaning",    icon: faBroom          },
  { label: "Car Service", icon: faCar            },
  { label: "Carpenter",   icon: faHammer         },
  { label: "Gardening",   icon: faLeaf           },
  { label: "Painting",    icon: faPaintRoller    },
  { label: "AC Repair",   icon: faFire           },
];

const EXPLORE_CATEGORIES = [
  { label: "Plumbing",    icon: faWrench,        bg: "bg-blue-50   dark:bg-blue-900/20",     accent: "bg-blue-500",    text: "text-blue-700   dark:text-blue-300",    count: "12+" },
  { label: "Electrical",  icon: faBoltLightning,  bg: "bg-yellow-50 dark:bg-yellow-900/20",   accent: "bg-yellow-400",  text: "text-yellow-700 dark:text-yellow-300",  count: "8+"  },
  { label: "Cleaning",    icon: faBroom,          bg: "bg-green-50  dark:bg-green-900/20",    accent: "bg-green-500",   text: "text-green-700  dark:text-green-300",   count: "15+" },
  { label: "Car Service", icon: faCar,            bg: "bg-pink-50   dark:bg-pink-900/20",     accent: "bg-pink-500",    text: "text-pink-700   dark:text-pink-300",    count: "6+"  },
  { label: "Carpenter",   icon: faHammer,         bg: "bg-orange-50 dark:bg-orange-900/20",   accent: "bg-orange-500",  text: "text-orange-700 dark:text-orange-300",  count: "9+"  },
  { label: "Gardening",   icon: faLeaf,           bg: "bg-emerald-50 dark:bg-emerald-900/20", accent: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300",count: "7+"  },
  { label: "Painting",    icon: faPaintRoller,    bg: "bg-purple-50 dark:bg-purple-900/20",   accent: "bg-purple-500",  text: "text-purple-700 dark:text-purple-300",  count: "5+"  },
  { label: "AC Repair",   icon: faFire,           bg: "bg-sky-50    dark:bg-sky-900/20",      accent: "bg-sky-500",     text: "text-sky-700    dark:text-sky-300",     count: "10+" },
];

const EXPLORE_FILTERS = [
  { key: "all",      label: "All professionals" },
  { key: "top",      label: "⭐ Top rated"       },
  { key: "verified", label: "✓ Verified only"   },
  { key: "fast",     label: "⚡ Quick response"  },
];

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [searchError, setSearchError]               = useState("");
  const [activeHeroCategory, setActiveHeroCategory] = useState(null);
  const [activeFilter, setActiveFilter]             = useState("all");
  const [activeExploreCategory, setActiveExploreCategory] = useState(null);
  const searchInputRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchError("");
    const formData = new FormData(e.target);
    const service  = formData.get("service")?.trim();
    const location = formData.get("location")?.trim() || "";
    if (!service) { setSearchError("Please enter the service you need (required)"); return; }
    const query = new URLSearchParams();
    query.set("service", service);
    if (location) query.set("location", location);
    navigate(`/search?${query.toString()}`);
  };

  const handleHeroCategoryClick = (label) => {
    setActiveHeroCategory(label);
    if (searchInputRef.current) searchInputRef.current.value = label;
    navigate(`/search?service=${encodeURIComponent(label)}`);
  };

  const handleExploreCategoryClick = (label) => {
    const next = activeExploreCategory === label ? null : label;
    setActiveExploreCategory(next);
    setActiveFilter("all");
    if (next) navigate(`/search?service=${encodeURIComponent(next)}`);
  };

  const handleExploreFilterClick = (key) => {
    setActiveFilter(key);
    setActiveExploreCategory(null);
    const params = new URLSearchParams();
    if (key === "top")      params.set("sort", "rating");
    if (key === "verified") params.set("verified", "true");
    if (key === "fast")     params.set("sort", "response");
    navigate(`/search?${params.toString()}`);
  };

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#00171F] overflow-hidden font-sans selection:bg-[#003459]/20 selection:text-[#00171F] dark:selection:text-white pt-20 transition-colors duration-300">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[40%] h-[50%] bg-gradient-to-br from-[#003459]/20 to-[#00171F]/10 dark:from-[#003459]/40 dark:to-[#00171F]/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/4 animate-blob" />
        <div className="absolute bottom-0 right-0 w-[45%] h-[60%] bg-gradient-to-tl from-[#00171F]/10 to-[#003459]/15 dark:from-[#003459]/30 dark:to-[#00171F]/40 rounded-full blur-3xl translate-x-1/4 translate-y-1/3 animate-blob" style={{ animationDelay: "4s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-gradient-to-br from-[#003459]/5 to-transparent dark:from-[#003459]/20 rounded-full blur-2xl animate-blob" style={{ animationDelay: "2s" }} />
      </div>

      {/* Floating theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white dark:bg-[#003459] shadow-2xl border border-gray-200 dark:border-[#003459]/60 flex items-center justify-center text-[#003459] dark:text-yellow-300 hover:scale-110 active:scale-95 transition-all duration-300 group"
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#003459]/10 to-transparent dark:from-yellow-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <FontAwesomeIcon
          icon={theme === "dark" ? faSun : faMoon}
          className="text-xl transition-transform duration-500"
          style={{ transform: theme === "dark" ? "rotate(0deg)" : "rotate(-20deg)" }}
        />
      </button>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative z-10 pt-12 pb-16 md:pt-20 md:pb-28 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto text-center">

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white dark:bg-white/10 border border-[#003459]/20 dark:border-white/10 shadow-sm mb-8 animate-fade-in-up backdrop-blur-sm">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#003459] dark:bg-blue-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#003459] dark:bg-blue-400" />
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Over 5,000 verified professionals available
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#00171F] dark:text-white leading-tight mb-8 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            Connect with trusted local
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#00171F] via-[#003459] to-[#00171F] dark:from-blue-300 dark:via-blue-100 dark:to-blue-300 bg-clip-text text-transparent">
              service professionals
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            Instant quotes • Clear pricing • Verified experts • Guaranteed satisfaction
          </p>

          {/* Hero category pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            {HERO_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleHeroCategoryClick(cat.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 hover:scale-105 active:scale-95
                  ${activeHeroCategory === cat.label
                    ? "bg-[#003459] dark:bg-blue-500 text-white border-[#003459] dark:border-blue-500 shadow-lg"
                    : "bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:border-[#003459] dark:hover:border-blue-400 hover:text-[#003459] dark:hover:text-blue-300"
                  }`}
              >
                <FontAwesomeIcon icon={cat.icon} className="text-xs" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search form */}
          <div className="max-w-4xl mx-auto relative group animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00171F] via-[#003459] to-[#00171F] dark:from-blue-900 dark:via-blue-600 dark:to-blue-900 rounded-3xl opacity-15 group-hover:opacity-30 blur-xl transition duration-500" />
            <form
              onSubmit={handleSearch}
              className="relative bg-white dark:bg-[#00171F]/90 rounded-3xl p-3 sm:p-4 shadow-xl ring-1 ring-gray-200/60 dark:ring-white/10 backdrop-blur-sm"
            >
              {searchError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-center text-sm">
                  {searchError}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
                <div className="flex-1 flex items-center px-5 sm:px-7 py-4 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-white/10">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[#003459] dark:text-blue-400 text-xl mr-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    name="service"
                    placeholder="What service do you need? (required)"
                    className="w-full bg-transparent outline-none text-[#00171F] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base sm:text-lg font-medium"
                    required
                  />
                </div>
                <div className="flex-1 flex items-center px-5 sm:px-7 py-4">
                  <FontAwesomeIcon icon={faLocationDot} className="text-[#003459] dark:text-blue-400 text-xl mr-4" />
                  <input
                    type="text"
                    name="location"
                    placeholder="Your city or PIN code (optional)"
                    className="w-full bg-transparent outline-none text-[#00171F] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base sm:text-lg font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="m-1 px-8 sm:px-10 py-4 bg-gradient-to-r from-[#00171F] to-[#003459] dark:from-blue-600 dark:to-blue-800 hover:from-[#000f14] hover:to-[#002b47] text-white rounded-2xl font-semibold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl hover:shadow-[#00171F]/30 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Find Professionals</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </form>
          </div>

          {/* Stats row */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            {[
              { value: 5000,  suffix: "+", label: "Verified Pros"    },
              { value: 50000, suffix: "+", label: "Jobs Completed"    },
              { value: 98,    suffix: "%", label: "Satisfaction Rate" },
              { value: 120,   suffix: "+", label: "Cities Covered"    },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-extrabold text-[#003459] dark:text-blue-300">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY CHOOSE US
      ══════════════════════════════════════════ */}
      <section className="py-16 relative z-10 bg-gray-50 dark:bg-[#001824] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12 md:text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-[#00171F] dark:text-white mb-4">
              Why customers choose{" "}
              <span className="text-[#003459] dark:text-blue-400">SmartService</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Reliable, transparent, and efficient service matching with no hidden costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Verified Professionals */}
            <div className="md:col-span-2 bg-white dark:bg-[#00253a] rounded-[2rem] p-8 md:p-10 border border-gray-100 dark:border-white/5 shadow-xl shadow-[#003459]/10 hover:shadow-2xl hover:shadow-[#003459]/20 transition duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#003459]/10 to-[#00171F]/5 dark:from-blue-500/10 dark:to-transparent rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition duration-700" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[#00171F] dark:bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 rotate-3 shadow-lg shadow-[#00171F]/30">
                  <FontAwesomeIcon icon={faShieldHalved} />
                </div>
                <h3 className="text-2xl font-bold text-[#00171F] dark:text-white mb-3">Thoroughly Verified Professionals</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                  Every professional undergoes identity verification, background checks, and skill assessments before being approved to provide quotes.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["ID Verified", "Background Check", "Skill Tested", "Insured"].map((badge) => (
                    <span key={badge} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003459]/8 dark:bg-blue-500/15 text-[#003459] dark:text-blue-300 text-xs font-semibold border border-[#003459]/15 dark:border-blue-500/20">
                      <FontAwesomeIcon icon={faCheck} className="text-[10px]" /> {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Instant Matching */}
            <div className="bg-gradient-to-br from-[#003459] to-[#00171F] dark:from-blue-700 dark:to-[#00171F] rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-[#00171F]/30 transition duration-300 relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-xl mb-5">
                  <FontAwesomeIcon icon={faBoltLightning} />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Matching</h3>
                <p className="text-gray-100 text-sm">Connect with available professionals in under 60 seconds.</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="relative w-3 h-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
                  </div>
                  <span className="text-green-300 text-xs font-medium">Live matching active</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/search")}
                className="mt-6 text-sm font-medium bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 group-hover:bg-white group-hover:text-[#00171F] transition cursor-pointer"
              >
                Find a professional <FontAwesomeIcon icon={faArrowRight} className="ml-1.5" />
              </button>
            </div>

            {/* Transparent Pricing */}
            <div className="bg-white dark:bg-[#00253a] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-lg hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 bg-gray-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-[#003459] dark:text-blue-400 text-lg mb-4">
                <FontAwesomeIcon icon={faTag} />
              </div>
              <h3 className="text-lg font-bold text-[#00171F] dark:text-white mb-2">Transparent Pricing</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Fixed upfront quotes with no hidden charges.</p>
            </div>

            {/* Satisfaction Guarantee */}
            <div className="bg-white dark:bg-[#00253a] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-lg hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 bg-gray-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-[#003459] dark:text-blue-400 text-lg mb-4">
                <FontAwesomeIcon icon={faCircleCheck} />
              </div>
              <h3 className="text-lg font-bold text-[#00171F] dark:text-white mb-2">Satisfaction Guarantee</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">We ensure the job meets your expectations or we make it right.</p>
            </div>

            {/* Rating stats */}
            <div className="md:col-span-2 bg-white dark:bg-[#00253a] rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-gray-200 dark:border-white/5 shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-end gap-2 mb-1">
                  <h3 className="text-5xl font-extrabold text-[#00171F] dark:text-white">4.9</h3>
                  <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-1">/5</span>
                </div>
                <div className="flex gap-1 mb-2">
                  {[1,2,3,4,5].map((i) => (
                    <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 text-lg" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Average from 50,000+ completed jobs</p>
              </div>
              <div className="flex -space-x-4 relative z-10">
                {["bg-gray-300","bg-gray-400","bg-gray-500","bg-[#003459] dark:bg-blue-600"].map((color, i) => (
                  <div key={i} className={`w-12 h-12 rounded-full border-4 border-white dark:border-[#00253a] ${color} flex items-center justify-center`}>
                    {i === 3 && <span className="text-white text-xs font-bold">+2k</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-16 bg-white dark:bg-[#00171F] relative transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Visual mockup */}
            <div className="order-2 md:order-1 relative">
              <div className="aspect-square bg-gradient-to-tr from-[#003459]/15 to-[#00171F]/10 dark:from-blue-500/20 dark:to-[#00171F]/30 rounded-[3rem] p-6 relative">
                <div className="absolute inset-4 bg-white dark:bg-[#00253a] rounded-[2rem] shadow-2xl p-5 flex flex-col gap-3">
                  <div className="h-6 w-3/4 bg-gray-100 dark:bg-white/5 rounded-lg" />
                  <div className="flex gap-3">
                    <div className="h-20 w-full bg-[#003459]/5 dark:bg-blue-500/10 rounded-xl border border-[#003459]/10 dark:border-blue-500/20 p-3">
                      <div className="h-2 w-8 bg-[#003459]/30 dark:bg-blue-400/40 rounded mb-2" />
                      <div className="h-2 w-16 bg-[#003459]/30 dark:bg-blue-400/40 rounded" />
                    </div>
                    <div className="h-20 w-full bg-gray-50 dark:bg-white/5 rounded-xl" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[1,2,3].map((i) => (
                      <div key={i} className="h-14 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-[#003459]/10 dark:bg-blue-500/20" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto bg-gradient-to-r from-[#00171F] to-[#003459] dark:from-blue-600 dark:to-blue-800 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm">
                    <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                    Book Now
                  </div>
                </div>
                {/* Floating status badge */}
                <div className="absolute -bottom-4 -right-4 bg-white dark:bg-[#003459] p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow border border-gray-100 dark:border-white/10">
                  <div className="bg-[#003459]/10 dark:bg-blue-400/20 p-2 rounded-full text-[#003459] dark:text-blue-300">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                    <div className="font-bold text-[#00171F] dark:text-white text-sm">Professional En Route</div>
                  </div>
                </div>
                {/* Floating rating badge */}
                <div className="absolute -top-4 -left-4 bg-white dark:bg-[#003459] p-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce-slow border border-gray-100 dark:border-white/10" style={{ animationDelay: "1.5s" }}>
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                  <span className="font-bold text-[#00171F] dark:text-white text-sm">4.9</span>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold text-[#00171F] dark:text-white mb-2">Completed in three steps</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Fast, simple, and hassle-free every time.</p>
              <div className="space-y-0 relative">
                <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-gradient-to-b from-[#003459]/30 via-[#003459]/20 to-transparent dark:from-blue-500/30 dark:via-blue-500/10 dark:to-transparent" />
                {[
                  { icon: faFileLines, step: 1, title: "Describe your requirements", desc: "Specify the service, location, and preferred timing."                        },
                  { icon: faUserTie,   step: 2, title: "Select your professional",   desc: "Review profiles, ratings, and quotes to choose the best fit."                },
                  { icon: faCouch,     step: 3, title: "Job completed",              desc: "Pay securely only after the work is completed to your satisfaction."          },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5 group pb-8 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#003459]/10 dark:bg-blue-500/20 text-[#003459] dark:text-blue-400 flex items-center justify-center font-bold text-lg group-hover:bg-[#003459] dark:group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 relative z-10 border-2 border-white dark:border-[#00171F]">
                      {item.step}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-lg font-bold text-[#00171F] dark:text-white mb-1">
                        <FontAwesomeIcon icon={item.icon} className="mr-2 text-[#003459] dark:text-blue-400" />
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          EXPLORE SERVICES
      ══════════════════════════════════════════ */}
      <section className="py-16 bg-gray-50 dark:bg-[#001824] relative z-10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#00171F] dark:text-white mb-2">
                Explore services near you
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Browse by category or filter by what matters to you
              </p>
            </div>
            <button
              onClick={() => navigate("/search?service=")}
              className="flex items-center gap-2 text-sm font-medium text-[#003459] dark:text-blue-400 hover:gap-3 transition-all duration-200 shrink-0"
            >
              View all professionals
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {EXPLORE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => handleExploreFilterClick(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 hover:scale-105 active:scale-95
                  ${activeFilter === f.key && !activeExploreCategory
                    ? "bg-[#003459] dark:bg-blue-600 text-white border-[#003459] dark:border-blue-600 shadow-md"
                    : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-[#003459] dark:hover:border-blue-400"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {EXPLORE_CATEGORIES.map((cat) => {
              const isActive = activeExploreCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => handleExploreCategoryClick(cat.label)}
                  className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 overflow-hidden
                    ${isActive
                      ? "border-[#003459] dark:border-blue-500 shadow-lg shadow-[#003459]/10 dark:shadow-blue-500/10 bg-white dark:bg-[#00253a]"
                      : "border-gray-100 dark:border-white/5 bg-white dark:bg-[#00253a] hover:border-gray-200 dark:hover:border-white/10"
                    }`}
                >
                  {/* Animated bottom accent bar */}
                  <div
                    className={`absolute bottom-0 left-0 h-[3px] ${cat.accent} transition-all duration-500 rounded-b-2xl
                      ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                  />

                  {/* Icon */}
                  <div className={`w-11 h-11 ${cat.bg} rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}>
                    <FontAwesomeIcon icon={cat.icon} className={`${cat.text} text-lg`} />
                  </div>

                  {/* Label */}
                  <div className="font-semibold text-sm text-[#00171F] dark:text-white mb-1">
                    {cat.label}
                  </div>

                  {/* Count */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-[9px]" />
                    {cat.count} providers
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-[#003459] dark:bg-blue-500 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faCircleCheck} className="text-white text-[10px]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-8 p-5 rounded-2xl bg-white dark:bg-[#00253a] border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-[#00171F] dark:text-white text-sm mb-0.5">
                Can't find what you need?
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Search for any service and we'll match you with the right professional
              </div>
            </div>
            <button
              onClick={() => navigate("/search")}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#003459] dark:bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-[#002b47] dark:hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shrink-0 shadow-md"
            >
              Browse all services
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-16 bg-white dark:bg-[#00171F] relative overflow-hidden transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#00171F] dark:text-white mb-2">Trusted by customers and professionals</h2>
            <p className="text-gray-500 dark:text-gray-400">Real stories from real people</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: "The electrician was highly professional and respectful of our home. Payment through the platform was seamless.",                              name: "Rahul K.", city: "Bangalore", service: "Electrical Repair",    initial: "R", color: "bg-[#00171F] dark:bg-blue-700"                },
              { text: "SmartService delivered transparent pricing and excellent workmanship for my car service.",                                                   name: "Priya M.", city: "Delhi",     service: "Vehicle Service",       initial: "P", color: "bg-[#003459] dark:bg-blue-600", featured: true },
              { text: "As a service provider, SmartService has significantly grown my client base with reliable leads and excellent support.",                      name: "Anil S.",  city: "",          service: "Plumbing Professional", initial: "A", color: "bg-[#00171F] dark:bg-blue-800"                },
            ].map((t, i) => (
              <div
                key={i}
                className={`bg-white dark:bg-[#00253a] p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                  ${t.featured ? "mt-0 md:-mt-4 ring-2 ring-[#003459]/20 dark:ring-blue-500/20" : ""}`}
              >
                {t.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#003459] dark:bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Top Review
                  </div>
                )}
                <div className="absolute -top-4 left-6 text-6xl text-[#003459]/15 dark:text-blue-400/10 font-serif opacity-60">"</div>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <FontAwesomeIcon key={s} icon={faStar} className="text-yellow-400 text-xs" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-5 relative z-10 text-sm leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-bold text-[#00171F] dark:text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.city && `${t.city} • `}{t.service}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section className="py-20 px-6 relative z-10 bg-gray-50 dark:bg-[#001824] transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#00171F] to-[#003459] dark:from-[#001020] dark:to-[#003459] p-12 text-center shadow-2xl shadow-[#00171F]/30">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> 5,000+ professionals ready now
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Ready to book a service?
              </h2>
              <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of satisfied customers and verified professionals today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="px-8 py-4 bg-white text-[#00171F] font-bold rounded-full hover:bg-gray-100 transition duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <FontAwesomeIcon icon={faCalendarPlus} />
                  Book a Service
                </button>
                <button
                  onClick={() => navigate("/provider/register")}
                  className="px-8 py-4 bg-transparent border-2 border-white/40 text-white font-bold rounded-full hover:bg-white/10 transition duration-300 flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  Join as a Professional
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}