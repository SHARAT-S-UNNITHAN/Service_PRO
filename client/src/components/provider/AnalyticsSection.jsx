// src/components/provider/AnalyticsSection.jsx
// npm install recharts  (if not already)
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import { RefreshCw, TrendingUp, TrendingDown, Minus, IndianRupee } from "lucide-react";

const API    = "http://localhost:4000";
const COLORS = ["#4f46e5","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];

function getHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

function KpiCard({ label, value, sub, trend, prefix = "" }) {
  const TrendIcon  = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-500" : "text-gray-400";
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">
        {prefix}{typeof value === "number" ? value.toLocaleString("en-IN") : value ?? "—"}
      </p>
      {sub && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon size={13} />
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsSection() {
  const [trend,   setTrend]   = useState([]);
  const [weekly,  setWeekly]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [trendRes, weeklyRes] = await Promise.all([
        axios.get(`${API}/api/provider/earnings/trend`,     { headers: getHeaders() }),
        axios.get(`${API}/api/provider/performance/weekly`, { headers: getHeaders() }),
      ]);
      setTrend(trendRes.data   || []);
      setWeekly(weeklyRes.data);
    } catch (err) {
      setError("Failed to load analytics. " + (err.response?.data?.error || ""));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const thisWeekEarnings = weekly?.thisWeek?.earnings || 0;
  const lastWeekEarnings = weekly?.lastWeek?.earnings || 0;
  const weekTrend = lastWeekEarnings > 0
    ? Math.round(((thisWeekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100)
    : thisWeekEarnings > 0 ? 100 : 0;

  const byProfession = weekly?.byProfession || [];

  if (loading) return (
    <div className="flex justify-center py-20">
      <RefreshCw size={22} className="text-gray-400 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="py-16 text-center">
      <p className="text-sm text-gray-500 mb-4">{error}</p>
      <button onClick={fetchAll} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-black transition">Retry</button>
    </div>
  );

  const hasData = trend.length > 0 || weekly?.allTime?.total_completed > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-2 pb-8 space-y-6">

      {/* Header */}
      <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Your earnings and performance overview</p>
        </div>
        <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {!hasData ? (
        <div className="py-16 border border-dashed border-gray-200 rounded-2xl text-center">
          <p className="text-2xl mb-3">📊</p>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No data yet</h3>
          <p className="text-sm text-gray-500">Complete bookings with cash amounts to see your earnings analytics here.</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard label="Total Earnings"  value={weekly?.allTime?.total_earnings || 0} prefix="₹" sub="all time" trend={0} />
            <KpiCard label="This Week"       value={thisWeekEarnings} prefix="₹"
              sub={`${weekTrend > 0 ? "+" : ""}${weekTrend}% vs last week`} trend={weekTrend} />
            <KpiCard label="Completed Jobs"  value={weekly?.allTime?.total_completed || 0} sub="all time" trend={0} />
            <KpiCard label="Avg per Job"     value={Math.round(weekly?.allTime?.avg_per_job || 0)} prefix="₹" sub="average" trend={0} />
          </div>

          {/* Earnings trend line chart */}
          {trend.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Earnings — Last 30 Days</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend} margin={{top:5,right:10,left:0,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{fontSize:11,fill:"#9ca3af"}} />
                  <YAxis tick={{fontSize:11,fill:"#9ca3af"}} tickFormatter={v=>`₹${v}`} width={55} />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Earnings"]}
                    labelFormatter={(l) => formatDate(l)}
                    contentStyle={{borderRadius:"12px",border:"1px solid #e5e7eb",fontSize:"12px"}}
                  />
                  <Line type="monotone" dataKey="earnings" stroke="#4f46e5" strokeWidth={2.5}
                    dot={{r:4,fill:"#4f46e5"}} activeDot={{r:6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Earnings by Profession — pie chart (FIXED: uses b.profession, no multiplication) */}
          {byProfession.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Earnings by Service Type</h3>
              <p className="text-xs text-gray-400 mb-4">Each booking is counted once under the selected service</p>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={byProfession} dataKey="earnings" nameKey="profession"
                      cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                      {byProfession.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Earnings"]}
                      contentStyle={{borderRadius:"10px",border:"1px solid #e5e7eb",fontSize:"12px"}}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 w-full md:w-auto shrink-0">
                  {byProfession.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{background: COLORS[i % COLORS.length]}} />
                      <span className="text-sm text-gray-700 flex-1">{item.profession}</span>
                      <span className="text-sm font-bold text-gray-900">₹{Number(item.earnings).toLocaleString("en-IN")}</span>
                      <span className="text-xs text-gray-400 w-14 text-right">{item.jobs} job{item.jobs !== 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* This week vs last week bar chart */}
          {(thisWeekEarnings > 0 || lastWeekEarnings > 0) && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">This Week vs Last Week</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={[
                    { name: "Last Week", earnings: lastWeekEarnings, jobs: weekly?.lastWeek?.bookings || 0 },
                    { name: "This Week", earnings: thisWeekEarnings, jobs: weekly?.thisWeek?.bookings || 0 },
                  ]}
                  margin={{top:5,right:10,left:0,bottom:5}}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{fontSize:12,fill:"#6b7280"}} />
                  <YAxis tick={{fontSize:11,fill:"#9ca3af"}} tickFormatter={v=>`₹${v}`} width={55} />
                  <Tooltip
                    formatter={(v, name) => [
                      name === "earnings" ? `₹${Number(v).toLocaleString("en-IN")}` : v,
                      name === "earnings" ? "Earnings" : "Jobs",
                    ]}
                    contentStyle={{borderRadius:"12px",border:"1px solid #e5e7eb",fontSize:"12px"}}
                  />
                  <Bar dataKey="earnings" radius={[8,8,0,0]}>
                    <Cell fill="#e0e7ff" />
                    <Cell fill="#4f46e5" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Last Week</p>
                  <p className="text-lg font-bold text-gray-900">₹{lastWeekEarnings.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-400">{weekly?.lastWeek?.bookings || 0} jobs</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">This Week</p>
                  <p className="text-lg font-bold text-indigo-600">₹{thisWeekEarnings.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-400">{weekly?.thisWeek?.bookings || 0} jobs</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}