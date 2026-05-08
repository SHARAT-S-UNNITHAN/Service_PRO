// src/components/admin/AllReviewsSection.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Star, Search, Filter, RefreshCw, MessageSquare, 
  User, Briefcase, Calendar, FileText, AlertCircle,
  TrendingUp, BarChart2, ArrowUpDown
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { generatePDFReport } from "../../utils/pdfGenerator";

const API = "http://localhost:4000";

export default function AllReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `${API}/api/admin/platform-reviews`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = 
      (r.provider_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.review_text || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.service_description || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesRating = ratingFilter === "all" || r.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesRating;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "rating-high") return b.rating - a.rating;
    if (sortBy === "rating-low") return a.rating - b.rating;
    return 0;
  });

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  const ratingCounts = [1, 2, 3, 4, 5].map(star => ({
    stars: `${star} ★`,
    count: reviews.filter(r => r.rating === star).length
  }));

  const getSentiment = (rating) => {
    if (rating >= 4) return { label: "Positive", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
    if (rating === 3) return { label: "Neutral", color: "text-amber-600 bg-amber-50 border-amber-100" };
    return { label: "Critical", color: "text-red-600 bg-red-50 border-red-100" };
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "Date", dataKey: "created_at" },
      { header: "Customer", dataKey: "customer_name" },
      { header: "Provider", dataKey: "provider_name" },
      { header: "Service", dataKey: "service_description" },
      { header: "Rating", dataKey: "rating" },
      { header: "Comment", dataKey: "review_text" },
    ];

    const data = filteredReviews.map(r => ({
      created_at: new Date(r.created_at).toLocaleDateString(),
      customer_name: r.customer_name,
      provider_name: r.provider_name,
      service_description: r.service_description,
      rating: `${r.rating} / 5`,
      review_text: r.review_text || "No comment"
    }));

    generatePDFReport({
      title: "Platform Reviews Report",
      columns: columns,
      data: data,
      filename: "platform_reviews",
      stats: {
        "Total Reviews": filteredReviews.length,
        "Avg Rating": `${avgRating} / 5`,
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <RefreshCw size={32} className="text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Platform Reviews</h2>
          <p className="text-gray-500 text-sm mt-1">Real-time feedback monitoring and sentiment analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all text-sm font-bold shadow-sm"
          >
            <FileText size={18} className="text-indigo-600" />
            Report
          </button>
          <button 
            onClick={fetchReviews}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-200"
          >
            <RefreshCw size={18} />
            Sync
          </button>
        </div>
      </div>

      {/* Analytics & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <BarChart2 size={18} className="text-indigo-600" />
              Rating Distribution
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Insights</span>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingCounts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="stars" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                  {ratingCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index >= 3 ? '#4f46e5' : index === 2 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <div className="relative z-10">
              <TrendingUp size={32} className="mb-6 text-indigo-200" />
              <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em]">Quality Score</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-5xl font-black">{avgRating}</p>
                <span className="text-indigo-200 text-xl font-bold">/ 5.0</span>
              </div>
              <div className="mt-6 flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(avgRating) ? "fill-white text-white" : "text-indigo-400"} />
                ))}
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Reviews</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{reviews.length}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Pros</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{new Set(reviews.map(r => r.provider_name)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 sticky top-4 z-20">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search provider, customer, or content..."
            className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <select
              className="w-full pl-10 pr-10 py-4 bg-gray-50/50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500/30 transition-all text-xs font-bold appearance-none outline-none"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All Ratings</option>
              {[5,4,3,2,1].map(s => <option key={s} value={s}>{s} Stars</option>)}
            </select>
          </div>
          <div className="relative min-w-[160px]">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <select
              className="w-full pl-10 pr-10 py-4 bg-gray-50/50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-500/30 transition-all text-xs font-bold appearance-none outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="rating-high">Highest Rated</option>
              <option value="rating-low">Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="grid grid-cols-1 gap-6">
        {sortedReviews.length === 0 ? (
          <div className="bg-white py-32 text-center rounded-[3rem] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No results found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          sortedReviews.map((review) => {
            const sentiment = getSentiment(review.rating);
            return (
              <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group">
                <div className="flex flex-col gap-8">
                  {/* Card Top */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={18} 
                              className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} 
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${sentiment.color}`}>
                          {sentiment.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold tracking-tight">
                        <Calendar size={12} className="text-gray-300" />
                        {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>

                    {review.is_flagged === 1 && (
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-red-100 animate-pulse">
                        <AlertCircle size={14} />
                        ACTION REQUIRED
                      </div>
                    )}
                  </div>

                  {/* Flag Alert */}
                  {review.is_flagged === 1 && (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-4">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-red-600 uppercase tracking-widest">Moderation Flag</p>
                        <p className="text-sm text-red-800 font-medium mt-1">{review.flag_reason || "Automated profanity detection triggered."}</p>
                      </div>
                    </div>
                  )}

                  {/* Comment */}
                  <div className="relative">
                    <div className="text-gray-800 text-lg leading-relaxed font-medium pl-6 relative">
                      <div className="absolute left-0 top-0 text-6xl text-indigo-100 font-serif -mt-6 select-none">“</div>
                      {review.review_text || <span className="text-gray-300 italic">User did not leave a written comment.</span>}
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-4 p-4 bg-indigo-50/30 rounded-3xl border border-indigo-100/20 group-hover:bg-indigo-50/60 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <Briefcase size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Category</p>
                        <p className="text-sm font-bold text-indigo-900 truncate">{review.service_description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-emerald-50/30 rounded-3xl border border-emerald-100/20 group-hover:bg-emerald-50/60 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <User size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Provider</p>
                        <p className="text-sm font-bold text-emerald-900 truncate">{review.provider_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-3xl border border-slate-100/30 group-hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-600 shadow-sm">
                        <User size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{review.customer_name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
