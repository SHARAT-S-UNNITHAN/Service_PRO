// src/components/provider/OtpCompletionModal.jsx
import { useState } from "react";
import axios from "axios";
import { IndianRupee } from "lucide-react";

const API = "http://localhost:4000";

export default function OtpCompletionModal({ bookingId, onSuccess, onClose }) {
  const [step, setStep]                 = useState("idle");
  const [otp, setOtp]                   = useState("");
  const [error, setError]               = useState("");
  const [customerAmount, setCustomerAmount] = useState(null);
  const token   = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const handleRequestOtp = async () => {
    setStep("sending"); setError("");
    try {
      const res = await axios.post(`${API}/api/bookings/${bookingId}/request-completion`, {}, { headers });
      setCustomerAmount(res.data.customer_amount);
      setStep("otp_sent");
    } catch (err) {
      const code = err.response?.data?.code;
      if (code === "CUSTOMER_NOT_CONFIRMED") {
        setError("The customer has not confirmed the work yet. Ask them to open their dashboard → My Bookings → tap \"Confirm Work Done\" and enter the amount paid.");
      } else {
        setError(err.response?.data?.error || "Failed to send OTP.");
      }
      setStep("idle");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { setError("Please enter the 6-digit OTP"); return; }
    setStep("verifying"); setError("");
    try {
      await axios.post(`${API}/api/bookings/${bookingId}/verify-completion`, { otp }, { headers });
      setStep("done");
      setTimeout(() => onSuccess(bookingId), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed.");
      setStep("otp_sent");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        {step !== "verifying" && step !== "sending" && step !== "done" && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold transition">✕</button>
        )}

        {/* IDLE / SENDING */}
        {(step === "idle" || step === "sending") && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Mark as Completed</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                The customer must first confirm the work from their dashboard and enter the amount paid. Then click below to generate an OTP.
              </p>
            </div>
            {error && <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm leading-relaxed">{error}</div>}
            <button onClick={handleRequestOtp} disabled={step === "sending"}
              className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition disabled:opacity-60 flex items-center justify-center gap-2">
              {step === "sending"
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Checking...</>
                : "Generate OTP"}
            </button>
          </>
        )}

        {/* OTP SENT / VERIFYING */}
        {(step === "otp_sent" || step === "verifying") && (
          <>
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📧</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Enter OTP</h2>
              <p className="text-sm text-gray-500">OTP sent to customer's email and dashboard. Ask them for the 6-digit code.</p>
            </div>

            {customerAmount !== null && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                <span className="text-sm text-emerald-700 font-medium">Customer confirmed amount</span>
                <span className="flex items-center gap-1 text-emerald-800 font-bold text-base">
                  <IndianRupee size={14} />{Number(customerAmount).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

            <input type="text" inputMode="numeric" maxLength={6} value={otp}
              onChange={(e) => { setError(""); setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); }}
              placeholder="000000"
              className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-2 border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-gray-900 mb-4 transition" />

            <button onClick={handleVerifyOtp} disabled={step === "verifying" || otp.length !== 6}
              className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-2 mb-3">
              {step === "verifying"
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</>
                : "Verify & Complete"}
            </button>
            <button onClick={() => { setStep("idle"); setOtp(""); setError(""); }}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition">← Resend OTP</button>
          </>
        )}

        {/* DONE */}
        {step === "done" && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Completed!</h2>
            <p className="text-sm text-gray-500">The booking has been marked as completed.</p>
          </div>
        )}
      </div>
    </div>
  );
}