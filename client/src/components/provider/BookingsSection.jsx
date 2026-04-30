// src/components/provider/BookingsSection.jsx
import { useState } from 'react';  // ← ADD THIS (if not already imported)
import axios from 'axios';
import { 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Check 
} from 'lucide-react';
import OtpCompletionModal from './OtpCompletionModal';  // ← ADD THIS

export default function BookingsSection({ bookings, onActionSuccess, token, API }) {
  
  // ← ADD THIS STATE
  const [completingBookingId, setCompletingBookingId] = useState(null);
  
  const handleBookingAction = async (bookingId, action) => {
    // REMOVE the 'complete' action from here since we handle it with OTP
    if (action === 'complete') {
      // This is now handled by the OTP modal
      return;
    }
    
    const actionText = action === 'accept' ? 'accept' : 
                       action === 'reject' ? 'reject' : 
                       'complete';

    if (!window.confirm(`Are you sure you want to ${actionText} this booking?`)) return;

    try {
      await axios.patch(
        `${API}/provider/bookings/${bookingId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onActionSuccess();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${actionText} booking`);
    }
  };

  const statusConfig = {
    pending:   { icon: Clock,        color: 'bg-gray-50 text-gray-600 border-gray-200' },
    accepted:  { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    completed: { icon: CheckCircle2, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    rejected:  { icon: XCircle,      color: 'bg-rose-50 text-rose-700 border-rose-100' },
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    // Reduced top padding (pt-2) to pull everything up
    <div className="max-w-4xl mx-auto px-4 pt-2 pb-8 font-sans">
      
      {/* Header - Reduced bottom margin (mb-6) */}
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-gray-900">Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">
            {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-medium text-gray-900">No bookings yet</h3>
          <p className="text-sm text-gray-500 mt-1">New customer requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.pending;
            const Icon = status.icon;
            const { day, time } = formatDate(booking.scheduled_date);

            return (
              <div 
                key={booking.id}
                className="group bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md rounded-2xl p-6 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    <div className="flex-shrink-0 w-24">
                      <div className="text-sm font-medium text-gray-900">{day}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{time}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-base text-gray-900 tracking-tight">
                          {booking.customer_name || 'Customer'}
                        </h4>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${status.color}`}>
                          <Icon size={12} strokeWidth={2} />
                          <span className="capitalize tracking-wide">{booking.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="truncate max-w-[250px] sm:max-w-sm">{booking.address || 'Address not provided'}</span>
                        </div>
                        {booking.customer_phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone size={14} className="text-gray-400" />
                            <span>{booking.customer_phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleBookingAction(booking.id, 'reject')}
                          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking.id, 'accept')}
                          className="px-5 py-2 text-sm font-medium bg-gray-900 text-white hover:bg-black rounded-lg shadow-sm transition-all duration-200"
                        >
                          Accept
                        </button>
                      </>
                    )}

                    {booking.status === 'accepted' && (
                      <button
                        onClick={() => setCompletingBookingId(booking.id)}  // ← CHANGED: opens OTP modal instead
                        className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-200 rounded-lg transition-all duration-200"
                      >
                        <Check size={16} />
                        Mark Completed
                      </button>
                    )}

                    {['completed', 'rejected', 'cancelled'].includes(booking.status) && (
                      <div className="px-4 py-2 text-xs text-gray-400 tracking-wide uppercase">
                        Closed
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ← ADD OTP MODAL AT THE BOTTOM */}
      {completingBookingId && (
        <OtpCompletionModal
          bookingId={completingBookingId}
          onSuccess={() => {
            setCompletingBookingId(null);
            onActionSuccess(); // Refresh bookings list
          }}
          onClose={() => setCompletingBookingId(null)}
        />
      )}
    </div>
  );
}