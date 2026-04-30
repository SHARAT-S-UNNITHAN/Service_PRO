// src/components/user/OtpNotifications.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Key, Clock, CheckCircle2, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";

const API = "http://localhost:4000";

export default function OtpNotifications({ token, onActiveCountChange }) {
  const [otps, setOtps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchOtps = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/user/otp-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      setOtps(data);
      // Tell parent how many active (non-expired, non-used) OTPs exist for badge
      const activeCount = data.filter(
        (o) => o.is_used !== 1 && new Date(o.expires_at) > new Date()
      ).length;
      if (onActiveCountChange) onActiveCountChange(activeCount);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load OTP notifications");
    } finally {
      setLoading(false);
    }
  }, [token, onActiveCountChange]);

  useEffect(() => {
    fetchOtps();
    // Auto-refresh every 30 seconds so expiry updates live
    const interval = setInterval(fetchOtps, 30000);
    return () => clearInterval(interval);
  }, [fetchOtps]);

  // ── Loading ──
  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw size={22} className="text-gray-400 animate-spin" />
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="py-16 flex flex-col items-center gap-4">
      <AlertTriangle className="text-red-400" size={32} strokeWidth={1.5} />
      <p className="text-sm text-gray-500">{error}</p>
      <button
        onClick={fetchOtps}
        className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-black transition"
      >
        Retry
      </button>
    </div>
  );

  // ── Empty ──
  if (otps.length === 0) return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-8">
      <div className="mb-6 flex items-baseline justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-medium tracking-tight text-gray-900">OTP Notifications</h2>
      </div>
      <div className="py-24 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
        <Key strokeWidth={1.5} className="text-gray-400 mb-4 w-10 h-10" />
        <h3 className="text-sm font-medium text-gray-900">No OTP notifications yet</h3>
        <p className="text-sm text-gray-500 mt-1 text-center max-w-xs">
          When a provider requests to mark your booking as complete, your OTP will appear here.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 font-sans">

      {/* Header */}
      <div className="mb-6 flex items-baseline justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-medium tracking-tight text-gray-900">OTP Notifications</h2>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{otps.length} total</p>
          <button
            onClick={fetchOtps}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <ShieldCheck className="text-amber-600 shrink-0 mt-0.5" size={18} strokeWidth={2} />
        <p className="text-sm text-amber-800 leading-relaxed">
          <strong>Important:</strong> Share the OTP with your provider <strong>only after confirming</strong> the
          work is complete and satisfactory. Once shared, the booking will be marked as completed.
        </p>
      </div>

      {/* OTP list */}
      <div className="space-y-4">
        {otps.map((item) => {
          const isExpired = new Date(item.expires_at) < new Date();
          const isUsed    = item.is_used === 1;
          const isActive  = !isExpired && !isUsed;

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-5 transition-all duration-200 ${
                isActive
                  ? "border-indigo-200 shadow-sm shadow-indigo-100"
                  : "border-gray-100 opacity-70"
              }`}
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-400">Booking #{item.booking_id}</span>
                    {/* Status badge */}
                    {isUsed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[11px] font-medium">
                        <CheckCircle2 size={11} /> Used
                      </span>
                    ) : isExpired ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-[11px] font-medium">
                        <Clock size={11} /> Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[11px] font-medium animate-pulse">
                        <Clock size={11} /> Active
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900">{item.service_description}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Provider: <span className="font-medium text-gray-700">{item.provider_name}</span>
                  </p>
                </div>

                {/* Expiry info */}
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">
                    {isUsed
                      ? "Completed"
                      : isExpired
                      ? "Expired at"
                      : "Expires at"}
                  </p>
                  <p className="text-xs font-medium text-gray-600 mt-0.5">
                    {new Date(item.expires_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    •{" "}
                    {new Date(item.expires_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>

              {/* OTP display box */}
              <div
                className={`rounded-xl p-4 text-center ${
                  isActive
                    ? "bg-indigo-50 border border-indigo-100"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                {isUsed ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <CheckCircle2 size={18} strokeWidth={2} />
                    <span className="text-sm font-medium">OTP has been used — booking completed</span>
                  </div>
                ) : isExpired ? (
                  <p className="text-sm text-gray-400 font-medium">
                    This OTP has expired. Ask the provider to resend it.
                  </p>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
                      Your OTP Code
                    </p>
                    <p className="text-5xl font-black tracking-[0.6em] text-gray-900 select-all">
                      {item.otp_code}
                    </p>
                    <p className="text-xs text-red-500 font-medium mt-3">
                      ⏰ Valid for 10 minutes — share only when work is done
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}