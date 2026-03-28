// src/components/user/MyBookings.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquareWarning
} from "lucide-react";

const API = "http://localhost:4000";

export default function MyBookings({ bookings, token }) {
  const navigate = useNavigate();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Review states
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Complaint states
  const [complaintText, setComplaintText] = useState("");
  const [complaintSeverity, setComplaintSeverity] = useState("medium");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());

  // Load already reviewed bookings
  useEffect(() => {
    const loadReviewedBookings = async () => {
      try {
        const res = await axios.get(`${API}/user/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reviewedIds = new Set(res.data.map((review) => review.booking_id));
        setReviewedBookingIds(reviewedIds);
      } catch (err) {
        console.error("Failed to load reviewed bookings:", err);
      }
    };

    if (token) loadReviewedBookings();
  }, [token]);

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setRating(0);
    setReviewText("");
    setShowReviewModal(true);
  };

  const openComplaintModal = (booking) => {
    setSelectedBooking(booking);
    setComplaintText("");
    setComplaintSeverity("medium");
    setShowComplaintModal(true);
  };

  const closeModals = () => {
    setShowReviewModal(false);
    setShowComplaintModal(false);
    setSelectedBooking(null);
  };

  const submitReview = async () => {
    if (rating === 0) return alert("Please select a rating");
    setSubmittingReview(true);
    try {
      await axios.post(
        `${API}/user/reviews`,
        {
          booking_id: selectedBooking.id,
          rating,
          review_text: reviewText.trim() || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewedBookingIds((prev) => new Set([...prev, selectedBooking.id]));
      alert("Thank you for your review!");
      closeModals();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const submitComplaint = async () => {
    if (!complaintText.trim()) return alert("Please describe your complaint");
    setSubmittingComplaint(true);
    try {
      await axios.post(
        `${API}/user/complaints`,
        {
          booking_id: selectedBooking.id,
          provider_id: selectedBooking.provider_id,
          subject: `Complaint regarding booking #${selectedBooking.id}`,
          complaint_text: complaintText.trim(),
          severity: complaintSeverity,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Complaint submitted successfully. Admin will review it soon.");
      closeModals();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit complaint");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const goToProviderDetail = (providerId) => {
    if (providerId) navigate(`/provider/${providerId}`);
  };

  // Helper for clean dates
  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 font-sans">   {/* ← Reduced top padding */}
      
      {/* Header */}
      <div className="mb-6 flex items-baseline justify-between border-b border-gray-100 pb-4">   {/* ← Slightly reduced margin */}
        <h2 className="text-2xl font-medium tracking-tight text-gray-900">My Bookings</h2>
        <p className="text-sm text-gray-500">{bookings.length} total</p>
      </div>

      {/* Empty State */}
      {bookings.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <Calendar strokeWidth={1.5} className="text-gray-400 mb-4 w-10 h-10" />
          <h3 className="text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="text-sm text-gray-500 mt-1">When you book a service, it will appear here.</p>
        </div>
      ) : (
        /* Booking List */
        <div className="space-y-4">
          {bookings.map((booking) => {
            const { date, time } = formatDateTime(booking.scheduled_date);
            const isCompleted = booking.status === "completed";
            const isReviewed = reviewedBookingIds.has(booking.id);

            return (
              <div
                key={booking.id}
                className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Main Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-medium text-gray-400">#{booking.id}</span>
                      <div className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                        booking.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        booking.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                        "bg-red-50 text-red-700 border-red-100"
                      }`}>
                        {booking.status === "completed" && <CheckCircle2 size={12} strokeWidth={2.5}/>}
                        {booking.status === "pending" && <Clock size={12} strokeWidth={2.5}/>}
                        {booking.status === "rejected" && <XCircle size={12} strokeWidth={2.5}/>}
                        <span className="capitalize tracking-wide">{booking.status}</span>
                      </div>
                    </div>

                    <h4 className="font-medium text-lg text-gray-900 truncate mb-1">
                      {booking.service_description}
                    </h4>
                    
                    <p className="text-sm text-gray-500 mb-4">
                      Provided by{' '}
                      <button 
                        onClick={() => goToProviderDetail(booking.provider_id)}
                        className="font-medium text-gray-700 hover:text-black hover:underline transition-colors"
                      >
                        {booking.provider_name}
                      </button>
                      {' '}• {booking.provider_district}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{date} at {time}</span>
                      </div>
                      <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></div>
                      <div className="flex items-center gap-1.5 truncate max-w-[250px] sm:max-w-xs">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="truncate">{booking.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                    {isCompleted && (
                      <>
                        <button
                          onClick={() => openComplaintModal(booking)}
                          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <MessageSquareWarning size={16} />
                          Report
                        </button>

                        {isReviewed ? (
                          <div className="px-4 py-2 text-sm font-medium text-emerald-600 flex items-center gap-1.5 bg-emerald-50 rounded-lg">
                            <CheckCircle2 size={16} /> Reviewed
                          </div>
                        ) : (
                          <button
                            onClick={() => openReviewModal(booking)}
                            className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-all shadow-sm"
                          >
                            Write Review
                          </button>
                        )}
                      </>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- Review Modal --- */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 text-center">Rate your experience</h3>
            <p className="text-sm text-center text-gray-500 mt-1 mb-6">
              with {selectedBooking.provider_name}
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-4xl focus:outline-none transition-transform hover:scale-110 ${
                    star <= rating ? "text-amber-400" : "text-gray-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Leave a comment (optional)"
              className="w-full h-28 p-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={submittingReview || rating === 0}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-black disabled:opacity-50 transition-colors"
              >
                {submittingReview ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Complaint Modal --- */}
      {showComplaintModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-500" size={20} strokeWidth={2.5} />
              <h3 className="text-lg font-medium text-gray-900">Report an Issue</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Regarding your booking with <span className="font-medium text-gray-700">{selectedBooking.provider_name}</span>
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                Severity Level
              </label>
              <select
                value={complaintSeverity}
                onChange={(e) => setComplaintSeverity(e.target.value)}
                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="low">Low - Minor inconvenience</option>
                <option value="medium">Medium - Service issue</option>
                <option value="high">High - Serious problem</option>
                <option value="critical">Critical - Safety/Security concern</option>
              </select>
            </div>

            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                Details
              </label>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Please describe what happened..."
                className="w-full h-32 p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitComplaint}
                disabled={submittingComplaint || !complaintText.trim()}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {submittingComplaint ? "Sending..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}