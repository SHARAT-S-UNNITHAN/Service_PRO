// src/components/provider/BookingsSection.jsx
import { useState } from 'react';
import axios from 'axios';
import { 
  Clock, MapPin, Phone, CheckCircle2, 
  XCircle, Check, Info, Calendar, 
  ChevronRight, ArrowRight, User
} from 'lucide-react';
import OtpCompletionModal from './OtpCompletionModal';

export default function BookingsSection({ bookings, onActionSuccess, token, API }) {
  const [completingBookingId, setCompletingBookingId] = useState(null);
  
  const handleBookingAction = async (bookingId, action) => {
    if (action === 'complete') return;
    
    const actionText = action === 'accept' ? 'accept' : 'reject';
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
    pending:   { icon: Clock,        label: 'Action Required', color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
    accepted:  { icon: CheckCircle2, label: 'Confirmed',       color: 'bg-indigo-50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-500' },
    completed: { icon: CheckCircle2, label: 'Finished',        color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
    rejected:  { icon: XCircle,      label: 'Declined',        color: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500' },
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      weekday: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    completed: bookings.filter(b => b.status === 'completed').length
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* Page Header & Stats Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Booking Queue</h2>
          <p className="text-gray-500 text-sm">Manage your service requests and schedule</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-5 py-3 bg-amber-50 rounded-2xl border border-amber-100 text-center">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pending</p>
            <p className="text-xl font-black text-amber-700">{stats.pending}</p>
          </div>
          <div className="px-5 py-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active</p>
            <p className="text-xl font-black text-indigo-700">{stats.accepted}</p>
          </div>
          <div className="px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Done</p>
            <p className="text-xl font-black text-emerald-700">{stats.completed}</p>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-dashed border-gray-200 py-32 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <Calendar size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Your queue is empty</h3>
          <p className="text-gray-500 mt-2">Check back later for new customer requests!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.pending;
            const Icon = status.icon;
            const dateObj = formatDate(booking.scheduled_date);

            return (
              <div 
                key={booking.id}
                className="group bg-white border border-gray-100 hover:border-indigo-100 shadow-sm hover:shadow-2xl rounded-[2.5rem] p-8 transition-all duration-500 overflow-hidden relative"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                  
                  {/* Date Block */}
                  <div className="flex-shrink-0 w-24 text-center space-y-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{dateObj.weekday}</p>
                    <p className="text-4xl font-black text-gray-900 leading-none">{dateObj.day.split(' ')[0]}</p>
                    <p className="text-xs font-bold text-gray-500">{dateObj.day.split(' ')[1]}</p>
                    <div className="pt-3 flex items-center justify-center gap-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50/50 py-1 rounded-full">
                      <Clock size={10} />
                      {dateObj.time}
                    </div>
                  </div>

                  {/* Divider (Desktop Only) */}
                  <div className="hidden lg:block w-px h-24 bg-gray-100"></div>

                  {/* Info Block */}
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`}></div>
                        {status.label}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-full">
                        <User size={14} className="text-gray-400" />
                        {booking.customer_name || 'Customer'}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Details</p>
                        <h4 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                          {booking.service_description || 'General Service Request'}
                          <ChevronRight size={20} className="text-gray-200 group-hover:translate-x-1 transition-transform" />
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-3xl group-hover:bg-indigo-50/30 transition-colors">
                          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                            <MapPin size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                            <p className="text-xs font-bold text-gray-700 leading-relaxed truncate md:whitespace-normal">
                              {booking.address || 'Address provided on acceptance'}
                            </p>
                          </div>
                        </div>

                        {booking.customer_phone && (
                          <div className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-3xl group-hover:bg-emerald-50/30 transition-colors">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                              <Phone size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contact</p>
                              <p className="text-xs font-bold text-gray-700 leading-relaxed">{booking.customer_phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex items-center gap-3 lg:flex-col lg:items-end lg:w-48 pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleBookingAction(booking.id, 'accept')}
                          className="flex-1 lg:w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95"
                        >
                          Accept
                          <ArrowRight size={14} />
                        </button>
                        <button
                          onClick={() => handleBookingAction(booking.id, 'reject')}
                          className="flex-1 lg:w-full px-6 py-4 bg-white border border-gray-100 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest transition-all"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {booking.status === 'accepted' && (
                      <button
                        onClick={() => setCompletingBookingId(booking.id)}
                        className="w-full flex items-center justify-center gap-2 px-8 py-5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 transition-all active:scale-95"
                      >
                        <Check size={20} />
                        Job Finished
                      </button>
                    )}

                    {['completed', 'rejected', 'cancelled'].includes(booking.status) && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Info size={14} />
                        Request Closed
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      )}

      {completingBookingId && (
        <OtpCompletionModal
          bookingId={completingBookingId}
          onSuccess={() => {
            setCompletingBookingId(null);
            onActionSuccess();
          }}
          onClose={() => setCompletingBookingId(null)}
        />
      )}
    </div>
  );
}