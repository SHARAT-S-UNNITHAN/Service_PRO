// src/components/user/OtpNotifications.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, Clock, CheckCircle2, RefreshCw, ShieldCheck, 
  AlertTriangle, Timer, Bell, Mail, Smartphone,
  Lock, Eye, EyeOff, Copy, Check, XCircle, AlertCircle
} from 'lucide-react';

const API = "http://localhost:4000";

// ────────────────────────────────────────────────
// OTP Card Component
// ────────────────────────────────────────────────
const OtpCard = ({ otp, index, onCopy }) => {
  const isExpired = new Date(otp.expires_at) < new Date();
  const isUsed = otp.is_used === 1;
  const isActive = !isExpired && !isUsed;
  const [showOtp, setShowOtp] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(otp.otp_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const getTimeRemaining = () => {
    if (!isActive) return null;
    const expires = new Date(otp.expires_at);
    const now = new Date();
    const diff = expires - now;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { minutes, seconds, total: diff };
  };

  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining());

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
      if (remaining?.total <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [otp.expires_at, isActive]);

  const getStatusConfig = () => {
    if (isUsed) return { icon: CheckCircle2, text: 'Used', color: 'green', bg: 'bg-green-50', border: 'border-green-200', textColor: 'text-green-700' };
    if (isExpired) return { icon: XCircle, text: 'Expired', color: 'gray', bg: 'bg-gray-50', border: 'border-gray-200', textColor: 'text-gray-500' };
    return { icon: Bell, text: 'Active', color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', textColor: 'text-yellow-700' };
  };

  const status = getStatusConfig();
  const remaining = timeRemaining;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        isActive ? 'border-indigo-200 shadow-lg shadow-indigo-100/50' : 'border-gray-100 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className={`px-6 py-4 ${status.bg} border-b ${status.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${status.bg} flex items-center justify-center`}>
              <status.icon className={`w-5 h-5 ${status.textColor}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Booking #{otp.booking_id}</p>
              <h3 className="font-semibold text-gray-900">{otp.service_description}</h3>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            isActive ? 'bg-yellow-100 text-yellow-700 animate-pulse' : 
            isUsed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {status.text}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Smartphone className="w-4 h-4" />
            <span>Provider: {otp.provider_name}</span>
          </div>
          {isActive && remaining && remaining.total > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Timer className="w-4 h-4 text-orange-500" />
              <span className="font-mono font-bold text-orange-600">
                {remaining.minutes}:{remaining.seconds.toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* OTP Display */}
        {isActive ? (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 text-center">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">
              One-Time Password
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <p className={`text-5xl font-mono font-black tracking-wider ${showOtp ? 'text-gray-900' : 'blur-md select-none'}`}>
                  {otp.otp_code}
                </p>
              </div>
              <button
                onClick={() => setShowOtp(!showOtp)}
                className="p-2 hover:bg-white/50 rounded-lg transition"
              >
                {showOtp ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy OTP'}
              </button>
            </div>
            <p className="text-xs text-red-500 mt-4">
              ⚠️ Share only after work is complete and satisfactory
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">
              {isUsed ? 'This OTP has already been used' : 'This OTP has expired'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {isUsed ? 'The booking has been completed' : 'Request a new OTP from the provider'}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Created: {new Date(otp.created_at).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3" />
            <span>Sent via email</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export default function OtpNotifications({ token, onActiveCountChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchOtps = async () => {
    if (!token) {
      setError("No authentication token");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/user/otp-notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const otps = await response.json();
      console.log("OTP data:", otps);
      setData(otps);
      
      const activeCount = otps.filter(
        o => o.is_used !== 1 && new Date(o.expires_at) > new Date()
      ).length;
      if (onActiveCountChange) onActiveCountChange(activeCount);
    } catch (err) {
      console.error("OTP error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOtps();
    const interval = setInterval(fetchOtps, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const getFilteredData = () => {
    if (!data) return [];
    return data.filter(otp => {
      const now = new Date();
      const expiresAt = new Date(otp.expires_at);
      const isExpired = expiresAt < now;
      const isUsed = otp.is_used === 1;
      
      if (filter === 'active') return !isExpired && !isUsed;
      if (filter === 'used') return isUsed;
      if (filter === 'expired') return isExpired && !isUsed;
      return true;
    });
  };

  const filteredData = getFilteredData();
  const activeCount = data?.filter(o => !o.is_used && new Date(o.expires_at) > new Date()).length || 0;
  const usedCount = data?.filter(o => o.is_used === 1).length || 0;
  const expiredCount = data?.filter(o => new Date(o.expires_at) < new Date() && o.is_used !== 1).length || 0;

  const handleCopy = () => {
    console.log('OTP copied');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <Key className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-500 mt-4">Loading your OTPs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">Error: {error}</p>
        <button onClick={fetchOtps} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Try Again
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200"
      >
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-10 h-10 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No OTP Notifications</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          When a provider requests to complete a booking, they'll send an OTP that will appear here.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
          <ShieldCheck className="w-4 h-4" />
          <span>OTPs expire in 10 minutes for security</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5" />
              <h1 className="text-2xl font-bold">OTP Notifications</h1>
            </div>
            <p className="text-indigo-100 text-sm">Secure one-time passwords for booking completion</p>
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-medium">
                <span className="animate-pulse">🔔</span> {activeCount} active
              </div>
            )}
            <button
              onClick={fetchOtps}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Security Banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Security Tips</p>
            <p className="text-sm text-amber-700">
              • Never share OTP before verifying work completion<br />
              • OTPs expire in 10 minutes for your security<br />
              • Each OTP can only be used once
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs - Fixed */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'all', label: 'All', count: data.length },
          { id: 'active', label: 'Active', count: activeCount },
          { id: 'used', label: 'Used', count: usedCount },
          { id: 'expired', label: 'Expired', count: expiredCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-xl transition-all ${
              filter === tab.id
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OTP List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          {filteredData.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No {filter} OTPs found</p>
            </div>
          ) : (
            filteredData.map((otp, idx) => (
              <OtpCard key={otp.id} otp={otp} index={idx} onCopy={handleCopy} />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-gray-100 p-4"
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Key className="w-4 h-4" />
            <span>Total OTPs: {data.length}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Used: {usedCount}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Timer className="w-4 h-4 text-orange-500" />
            <span>Active: {activeCount}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <XCircle className="w-4 h-4 text-gray-400" />
            <span>Expired: {expiredCount}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}