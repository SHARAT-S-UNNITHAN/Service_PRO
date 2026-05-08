// src/pages/SearchPage.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { Star, MapPin, BadgeCheck, Search, ChevronRight } from "lucide-react";

const API = "http://localhost:4000";

export default function SearchPage() {
  const [searchParams] = useSearchParams();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const serviceParam = searchParams.get("service") || "";
  const locationParam = searchParams.get("location") || "";
  const sortParam = searchParams.get("sort") || "";
  const verifiedParam = searchParams.get("verified") || "";

  const formatText = (text) =>
    text.replace(/\b\w/g, (c) => c.toUpperCase());

  const getInitials = (name) => {
    if (!name) return "";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const renderStars = (score) => {
    const fullStars = Math.floor(score);
    const decimal = score - fullStars;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={14} className="text-gray-900 fill-gray-900" />);
    }
    if (decimal > 0) {
      stars.push(
        <div key="partial" className="relative">
          <Star size={14} className="text-gray-200" />
          <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${decimal * 100}%` }}>
            <Star size={14} className="text-gray-900 fill-gray-900" />
          </div>
        </div>
      );
    }
    const emptyCount = 5 - fullStars - (decimal > 0 ? 1 : 0);
    for (let i = 0; i < emptyCount; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className="text-gray-200" />);
    }
    return stars;
  };

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API}/search/providers`, {
          params: {
            service: serviceParam,
            location: locationParam,
            sort: sortParam,
            verified: verifiedParam
          },
        });

        let results = res.data || [];
        // The backend now handles sorting, but we can keep a fallback if needed
        setProviders(results);
      } catch (err) {
        console.error("Search error:", err);
        setError(err.response?.data?.error || "Failed to search providers.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [serviceParam, locationParam, sortParam, verifiedParam]);

  const getPageTitle = () => {
    if (serviceParam) {
      return `Results for "${formatText(serviceParam)}${locationParam ? ` in ${formatText(locationParam)}` : ""}"`;
    }
    if (sortParam === "rating") return "Top Rated Professionals";
    if (sortParam === "response") return "Quick Response Experts";
    if (verifiedParam === "true") return "Verified Professionals";
    return "Service Professionals";
  };

  return (
    <div className="min-h-screen bg-white py-16 px-6 sm:px-8 lg:px-12 font-sans selection:bg-gray-100">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="mb-14 text-left">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="mt-3 text-gray-500 text-sm sm:text-base">
            {!loading && !error && providers.length > 0
              ? `${providers.length} providers found based on your criteria.`
              : loading ? "Searching our network..." : ""}
          </p>
        </div>

        {/* State Handling */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="py-12 border-t border-gray-100">
            <p className="text-gray-900 font-medium">{error}</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="py-20 text-center border-t border-gray-100">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No providers found</h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your search terms or exploring different services.
            </p>
          </div>
        ) : (
          /* Two Cards Per Row */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-8">
            {providers.map((p) => {
              const score = p.average_rating || p.rating || 0;
              const displayName = p.full_name || p.username || "Provider";

              return (
                <div
                  key={p.id}
                  className="group block bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                >
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center h-full">
                    
                    {/* Avatar */}
                    <div className="shrink-0 w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium tracking-wide">
                      {getInitials(displayName)}
                    </div>

                    {/* Core Info */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {displayName}
                          </h3>
                          {p.is_verified === 1 && (
                            <BadgeCheck className="text-blue-600" size={18} strokeWidth={2.5} />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex gap-0.5">{renderStars(score)}</div>
                          <span className="text-sm font-medium text-gray-900 ml-1">
                            {score.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                        <MapPin size={14} />
                        {p.district}, {p.region}
                      </div>

                      {/* Services Pills */}
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(p.professions) && p.professions.length > 0 ? (
                          p.professions.map((service, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium"
                            >
                              {service}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">Services unlisted</span>
                        )}
                      </div>
                    </div>

                    {/* Profile Button */}
                    <div className="w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 shrink-0">
                      <Link
                        to={`/provider/${p.id}`}
                        className="flex items-center justify-center sm:justify-end gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors w-full sm:w-auto"
                      >
                        Profile
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}