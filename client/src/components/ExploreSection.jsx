// src/components/ExploreSection.jsx
// Drop this component and import it in Home.jsx just before the Testimonials section

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWrench, faBoltLightning, faBroom, faCar,
  faHammer, faLeaf, faPaintRoller, faFire,
  faArrowRight, faShieldHalved, faStar, faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

const CATEGORIES = [
  { label: "Plumbing",    icon: faWrench,        bg: "bg-blue-50   dark:bg-blue-900/20",  accent: "bg-blue-500",   text: "text-blue-700 dark:text-blue-300",  count: "12+" },
  { label: "Electrical",  icon: faBoltLightning,  bg: "bg-yellow-50 dark:bg-yellow-900/20",accent: "bg-yellow-400", text: "text-yellow-700 dark:text-yellow-300",count: "8+"  },
  { label: "Cleaning",    icon: faBroom,          bg: "bg-green-50  dark:bg-green-900/20", accent: "bg-green-500",  text: "text-green-700 dark:text-green-300", count: "15+" },
  { label: "Car Service", icon: faCar,            bg: "bg-pink-50   dark:bg-pink-900/20",  accent: "bg-pink-500",   text: "text-pink-700 dark:text-pink-300",   count: "6+"  },
  { label: "Carpenter",   icon: faHammer,         bg: "bg-orange-50 dark:bg-orange-900/20",accent: "bg-orange-500", text: "text-orange-700 dark:text-orange-300",count: "9+"  },
  { label: "Gardening",   icon: faLeaf,           bg: "bg-emerald-50 dark:bg-emerald-900/20",accent:"bg-emerald-500",text:"text-emerald-700 dark:text-emerald-300",count:"7+" },
  { label: "Painting",    icon: faPaintRoller,    bg: "bg-purple-50 dark:bg-purple-900/20",accent: "bg-purple-500", text: "text-purple-700 dark:text-purple-300",count: "5+"  },
  { label: "AC Repair",   icon: faFire,           bg: "bg-sky-50    dark:bg-sky-900/20",   accent: "bg-sky-500",    text: "text-sky-700 dark:text-sky-300",     count: "10+" },
];

const FILTERS = [
  { key: "all",      label: "All professionals",  icon: faShieldHalved },
  { key: "top",      label: "⭐ Top rated"                              },
  { key: "verified", label: "✓ Verified only",    icon: faCircleCheck  },
  { key: "fast",     label: "⚡ Quick response"                         },
];

export default function ExploreSection() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState(null);

  const handleCategoryClick = (label) => {
    const next = activeCategory === label ? null : label;
    setActiveCategory(next);
    if (next) {
      // Navigate to search with this category
      navigate(`/search?service=${encodeURIComponent(next)}`);
    }
  };

  const handleFilterClick = (key) => {
    setActiveFilter(key);
    setActiveCategory(null);
    const params = new URLSearchParams();
    if (key === "top")      { params.set("sort", "rating");   }
    if (key === "verified") { params.set("verified", "true"); }
    if (key === "fast")     { params.set("sort", "response"); }
    navigate(`/search?${params.toString()}`);
  };

  const handleViewAll = () => {
    navigate("/search?service=");
  };

  return (
    <section className="py-16 bg-white dark:bg-[#00171F] relative z-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
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
            onClick={handleViewAll}
            className="flex items-center gap-2 text-sm font-medium text-[#003459] dark:text-blue-400 hover:gap-3 transition-all duration-200 shrink-0"
          >
            View all professionals
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterClick(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 hover:scale-105 active:scale-95
                ${activeFilter === f.key && !activeCategory
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
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.label)}
                className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 overflow-hidden
                  ${isActive
                    ? "border-[#003459] dark:border-blue-500 shadow-lg shadow-[#003459]/10 dark:shadow-blue-500/10 bg-white dark:bg-[#00253a]"
                    : "border-gray-100 dark:border-white/5 bg-white dark:bg-[#00253a] hover:border-gray-200 dark:hover:border-white/10"
                  }`}
              >
                {/* Animated bottom bar */}
                <div className={`absolute bottom-0 left-0 h-[3px] ${cat.accent} transition-all duration-500 rounded-b-2xl
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
        <div className="mt-8 p-5 rounded-2xl bg-gray-50 dark:bg-[#001824] border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
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
  );
}