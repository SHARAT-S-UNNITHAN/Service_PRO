// src/components/provider/ReviewsSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Star, Clock, User, Calendar, MessageSquare, 
  TrendingUp, Award, Zap, ThumbsUp 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip 
} from "recharts";

const API_BASE = "http://localhost:4000";

export default function ReviewsSection({ API = API_BASE, token }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API}/provider/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to load your reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [token, API]);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  const ratingCounts = [1, 2, 3, 4, 5].map(star => ({
    stars: `${star}★`,
    count: reviews.filter(r => r.rating === star).length
  }));

  const getResponseTimeText = (minutes) => {
    if (!minutes || minutes === 0) return "Fast Response";
    if (minutes < 30) return "Lightning Fast";
    if (minutes < 60) return `${minutes}m response`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h response`;
  };

  const getSentiment = (rating) => {
    if (rating >= 4) return { label: "Happy Client", color: "text-emerald-600 bg-emerald-50", icon: ThumbsUp };
    if (rating === 3) return { label: "Neutral", color: "text-amber-600 bg-amber-50", icon: MessageSquare };
    return { label: "Attention Needed", color: "text-red-600 bg-red-50", icon: Zap };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-gray-500 font-medium animate-pulse">Loading your feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[2.5rem] text-center font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <Award size={32} className="mb-6 text-indigo-200" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100">Your Average Rating</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h2 className="text-6xl font-black">{avgRating}</h2>
              <span className="text-xl text-indigo-200 font-bold">/ 5.0</span>
            </div>
            <div className="mt-6 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className={i < Math.round(avgRating) ? "fill-white text-white" : "text-indigo-400"} />
              ))}
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-600" />
              Recent Performance
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{reviews.length} Total Reviews</span>
          </div>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingCounts}>
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {ratingCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index >= 3 ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
                <XAxis dataKey="stars" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: 'transparent' }} content={() => null} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-gray-900 px-2 flex items-center gap-3">
          Client Feedback Feed
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
        </h3>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <MessageSquare size={40} />
            </div>
            <h4 className="text-xl font-bold text-gray-900">No reviews yet</h4>
            <p className="text-gray-500 mt-2">Complete more jobs to start receiving feedback!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => {
              const sentiment = getSentiment(review.rating);
              return (
                <div key={review.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <User size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{review.customer_name || "Valued Customer"}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                            <Calendar size={12} />
                            {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-100"} />
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-2 -top-2 text-4xl text-gray-100 font-serif select-none">“</div>
                      <p className="text-gray-700 text-sm leading-relaxed italic relative z-10 pl-4">
                        {review.review_text || "The customer didn't leave a comment, but was happy with the service!"}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <sentiment.icon size={16} className={sentiment.color.split(' ')[0]} />
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${sentiment.color}`}>
                          {sentiment.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                        <Zap size={14} className="text-amber-400" />
                        {getResponseTimeText(review.response_time_minutes)}
                      </div>
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