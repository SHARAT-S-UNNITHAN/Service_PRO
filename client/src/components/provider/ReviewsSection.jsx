// src/components/provider/ReviewsSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Star, Clock, User, Calendar, MessageSquare } from "lucide-react";

const API_BASE = "http://localhost:4000";

export default function ReviewsSection({ API = API_BASE, token }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  if (!token) {
    setLoading(false); // ✅ FIX
    return;
  }

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API}/provider/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API DATA:", res.data); // 👈 debug

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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getResponseTimeText = (minutes) => {
    if (!minutes || minutes === 0) return "N/A";
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hours`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading your reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-3xl text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Star className="text-yellow-500" size={32} />
            My Reviews
          </h2>
          <p className="text-gray-600 mt-1">
            Feedback from completed jobs ({reviews.length})
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
          <MessageSquare size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No reviews yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            When customers complete their jobs and leave a review, it will appear here with rating and response time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 hover:shadow transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center">
                    <User size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900">
                      {review.customer_name || "Valued Customer"}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Calendar size={15} />
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={22}
                      className={s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              {review.review_text && (
                <div className="mt-6 italic text-gray-700 leading-relaxed border-l-4 border-indigo-200 pl-4">
                  “{review.review_text}”
                </div>
              )}

              {/* Service & Response Time */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex-1">
                  <span className="text-gray-500">Service: </span>
                  <span className="font-medium">{review.service_description || "General Service"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  <span>Response: {getResponseTimeText(review.response_time_minutes)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}