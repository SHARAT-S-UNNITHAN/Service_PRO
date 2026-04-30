// src/components/user/ConfirmWorkModal.jsx
import { useState } from "react";
import axios from "axios";
import { IndianRupee, CheckCircle2, X } from "lucide-react";

const API = "http://localhost:4000";

export default function ConfirmWorkModal({ booking, token, onSuccess, onClose }) {
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  const handleConfirm = async () => {
    if (!amount || isNaN(amount) || Number(amount) < 0) {
      setError("Please enter a valid amount");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${API}/api/bookings/${booking.id}/confirm-work`,
        { cash_amount_paid: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDone(true);
      setTimeout(() => { onSuccess(booking.id); }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to confirm. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">

        {/* Close */}
        {!loading && !done && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        )}

        {/* Done state */}
        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Work Confirmed!</h3>
            <p className="text-sm text-gray-500">The provider can now complete the booking.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={26} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Work Completion</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Is <strong>{booking.service_description}</strong> done to your satisfaction?
              </p>
            </div>

            {/* Booking info */}
            <div className="bg-gray-50 rounded-xl p-3 mb-5 text-sm text-gray-600">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Provider</span>
                <span className="font-medium text-gray-800">{booking.provider_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Booking #</span>
                <span className="font-medium text-gray-800">{booking.id}</span>
              </div>
            </div>

            {/* Amount input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Amount Paid (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(""); }}
                  placeholder="Enter amount you paid"
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
              {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
              <p className="text-xs text-gray-400 mt-1.5">
                This amount is recorded for your transaction history.
              </p>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
              <p className="text-xs text-amber-800 leading-relaxed">
                ⚠️ Only confirm if you are <strong>satisfied with the work</strong>. After confirmation, the provider will generate an OTP to finalize completion.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} disabled={loading}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleConfirm} disabled={loading || !amount}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-black transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Confirming...</>
                ) : "Confirm Work Done"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}