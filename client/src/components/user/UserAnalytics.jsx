// src/components/user/UserAnalytics.jsx
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import {
  IndianRupee, TrendingUp, TrendingDown, Calendar, Star,
  Users, Briefcase, Award, Clock, CheckCircle2, AlertCircle,
  Zap, Target, Crown, Medal, Sparkles, Wallet, BarChart3,
  PieChart as PieChartIcon, Activity, Eye, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = "http://localhost:4000";
const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

// ────────────────────────────────────────────────
// Helper Functions
// ────────────────────────────────────────────────
const formatMoney = (n) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getTrendIcon = (current, previous) => {
  if (!previous) return null;
  const percent = ((current - previous) / previous) * 100;
  if (percent > 0) return { icon: TrendingUp, color: 'text-green-500', text: `+${percent.toFixed(1)}%` };
  if (percent < 0) return { icon: TrendingDown, color: 'text-red-500', text: `${percent.toFixed(1)}%` };
  return null;
};

// ────────────────────────────────────────────────
// Animated Counter Component
// ────────────────────────────────────────────────
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{count.toLocaleString()}</span>;
};

// ────────────────────────────────────────────────
// Stat Card Component
// ────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, trend, color, subtitle, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <trend.icon className={`w-4 h-4 ${trend.color}`} />
          <span className={`text-sm font-medium ${trend.color}`}>{trend.text}</span>
          <span className="text-xs text-gray-400 ml-1">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export default function UserAnalytics({ token }) {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const fetchAllData = async () => {
    if (!token) return;
    
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const [statsRes, trendRes, catRes, favRes] = await Promise.all([
        fetch(`${API}/user/customer/stats`, { headers }),
        fetch(`${API}/user/customer/spending/trend`, { headers }),
        fetch(`${API}/user/customer/spending/by-category`, { headers }),
        fetch(`${API}/user/customer/favorite-providers`, { headers })
      ]);
      
      const statsData = await statsRes.json();
      const trendData = await trendRes.json();
      const catData = await catRes.json();
      const favData = await favRes.json();
      
      setStats(statsData);
      setTrend(trendData);
      setCategories(catData);
      setFavorites(favData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <Sparkles className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-500 mt-4">Loading your insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">Error loading analytics: {error}</p>
        <button onClick={fetchAllData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Try Again
        </button>
      </div>
    );
  }

  if (!stats || stats.total_bookings === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-10 h-10 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Complete your first booking and confirm payment to see detailed analytics about your spending patterns.
        </p>
      </div>
    );
  }

  const totalSpent = stats.total_spent || 0;
  const totalBookings = stats.total_bookings || 0;
  const avgPerBooking = stats.avg_booking_value || 0;
  const uniqueProviders = stats.unique_providers || 0;

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
            <h1 className="text-2xl font-bold mb-1">Analytics Dashboard</h1>
            <p className="text-indigo-100 text-sm">Your spending insights and booking patterns</p>
          </div>
          <button
            onClick={fetchAllData}
            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/30 transition"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'spending', label: 'Spending', icon: Wallet },
          { id: 'providers', label: 'Providers', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Total Spent"
                value={formatMoney(totalSpent)}
                icon={IndianRupee}
                color="green"
                subtitle={`Across ${totalBookings} bookings`}
                delay={0.1}
              />
              <StatCard
                title="Average per Booking"
                value={formatMoney(avgPerBooking)}
                icon={Wallet}
                color="indigo"
                subtitle="per service"
                delay={0.2}
              />
              <StatCard
                title="Total Bookings"
                value={totalBookings}
                icon={Briefcase}
                color="blue"
                subtitle={`${stats.completed_bookings || 0} completed`}
                delay={0.3}
              />
              <StatCard
                title="Providers Used"
                value={uniqueProviders}
                icon={Users}
                color="purple"
                subtitle="unique professionals"
                delay={0.4}
              />
            </div>

            {/* Spending Trend Chart */}
            {trend.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Spending Trend</h3>
                    <p className="text-sm text-gray-500">Monthly spending pattern over last 6 months</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(m) => {
                        const [year, month] = m.split('-');
                        return new Date(year, month-1).toLocaleDateString('en-IN', { month: 'short' });
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(v) => `₹${v/1000}k`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(v) => [formatMoney(v), 'Spent']}
                      labelFormatter={(l) => {
                        const [year, month] = l.split('-');
                        return new Date(year, month-1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
                      }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="spent" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fill="url(#spendGradient)"
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Booking Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Booking Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900">Booking Status</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Completed', value: stats.completed_bookings || 0, color: 'bg-green-500', icon: CheckCircle2 },
                    { label: 'Pending', value: stats.pending_bookings || 0, color: 'bg-yellow-500', icon: Clock },
                    { label: 'Accepted', value: stats.accepted_bookings || 0, color: 'bg-blue-500', icon: Zap },
                    { label: 'Rejected', value: stats.rejected_bookings || 0, color: 'bg-red-500', icon: AlertCircle },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${(item.value / totalBookings) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Key Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Key Insights</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Loyalty Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (uniqueProviders / 10) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">
                        {uniqueProviders > 5 ? 'High' : uniqueProviders > 2 ? 'Medium' : 'Building'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Avg Booking Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatMoney(avgPerBooking)}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {avgPerBooking > 3000 ? 'Premium customer' : avgPerBooking > 1500 ? 'Regular spender' : 'Value seeker'}
                    </p>
                  </div>
                  {stats.first_booking_date && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Member Since</p>
                      <p className="text-sm font-medium text-gray-700">{formatDate(stats.first_booking_date)}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Spending Tab */}
      {activeTab === 'spending' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="spending"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Category Breakdown */}
            {categories.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
                    <p className="text-sm text-gray-500">Breakdown by service type</p>
                  </div>
                  <PieChartIcon className="w-5 h-5 text-purple-500" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categories}
                        dataKey="spent"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatMoney(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {categories.map((cat, idx) => {
                      const percent = (cat.spent / totalSpent) * 100;
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-gray-900">{formatMoney(cat.spent)}</span>
                            <span className="text-xs text-gray-500 ml-2">({percent.toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Trend Bar Chart */}
            {trend.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(m) => {
                        const [year, month] = m.split('-');
                        return new Date(year, month-1).toLocaleDateString('en-IN', { month: 'short' });
                      }}
                    />
                    <YAxis tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip formatter={(v) => formatMoney(v)} />
                    <Bar dataKey="spent" fill="#6366f1" radius={[8, 8, 0, 0]}>
                      {trend.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <AnimatePresence mode="wait">
          <motion.div
            key="providers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Favorite Providers */}
            {favorites.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Favorite Providers</h3>
                </div>
                <div className="space-y-4">
                  {favorites.map((provider, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex items-center justify-between p-5 rounded-xl transition-all ${
                        idx === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                          idx === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{provider.provider_name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500">{provider.bookings} bookings</span>
                            <span className="text-xs text-indigo-600">{formatMoney(provider.total_spent)} spent</span>
                          </div>
                        </div>
                      </div>
                      <Award className={`w-8 h-8 ${idx === 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Provider Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Most Booked</h3>
                </div>
                {favorites[0] ? (
                  <>
                    <p className="text-xl font-bold text-gray-900">{favorites[0].provider_name}</p>
                    <p className="text-sm text-gray-600 mt-1">{favorites[0].bookings} times • {formatMoney(favorites[0].total_spent)} total</p>
                  </>
                ) : (
                  <p className="text-gray-500">No providers yet</p>
                )}
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Medal className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Provider Diversity</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">{uniqueProviders}</p>
                <p className="text-sm text-gray-600 mt-1">unique service providers</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}