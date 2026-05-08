// src/components/admin/AdminAnalytics.jsx
// npm install recharts  (if not already installed)
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, Users, IndianRupee, CheckCircle2, AlertTriangle,
  RefreshCw, Download, Trophy, Activity, UserMinus, Copy,
  Star, Clock, Zap, Award, ChevronRight, Filter, FileText
} from "lucide-react";
import { generatePDFReport } from "../../utils/pdfGenerator";

const API    = "http://localhost:4000";
const COLORS = ["#4f46e5","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316","#64748b"];

function token() { return localStorage.getItem("token"); }
function h()     { return { Authorization: `Bearer ${token()}` }; }
function fmt(n)  { return Number(n||0).toLocaleString("en-IN"); }
function fmtD(d) { if(!d) return "—"; return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"}); }
function fmtDT(d){ if(!d) return "—"; return new Date(d).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}); }

// ── KPI card ─────────────────────────────────────────────────
function Kpi({ label, value, icon: Icon, color = "indigo", sub }) {
  const bg = { indigo:"bg-indigo-50 text-indigo-600", green:"bg-green-50 text-green-600",
                yellow:"bg-yellow-50 text-yellow-600", red:"bg-red-50 text-red-600",
                blue:"bg-blue-50 text-blue-600",     purple:"bg-purple-50 text-purple-600" };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, icon: Icon, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-indigo-600" />}
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Export CSV helper ─────────────────────────────────────────
function exportCSV(data, filename) {
  if (!data || !data.length) return alert("No data to export");
  const keys = Object.keys(data[0]);
  const csv  = [keys.join(","), ...data.map(r => keys.map(k => `"${r[k] ?? ""}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Main component ────────────────────────────────────────────
export default function AdminAnalytics() {
  const [activeTab,    setActiveTab]    = useState("overview");
  const [overview,     setOverview]     = useState(null);
  const [leaderboard,  setLeaderboard]  = useState([]);
  const [activity,     setActivity]     = useState([]);
  const [inactive,     setInactive]     = useState([]);
  const [duplicates,   setDuplicates]   = useState([]);
  const [potw,         setPotw]         = useState([]);
  const [userSpending, setUserSpending] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [actFilter,    setActFilter]    = useState("all");
  const [lbSort,       setLbSort]       = useState("total_earnings");
  const actInterval = useRef(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, lb, act, inact, dup, pw, us] = await Promise.all([
        axios.get(`${API}/api/admin/overview`,             { headers: h() }),
        axios.get(`${API}/api/admin/leaderboard`,          { headers: h() }),
        axios.get(`${API}/api/admin/activity?limit=40`,    { headers: h() }),
        axios.get(`${API}/api/admin/inactive-providers`,   { headers: h() }),
        axios.get(`${API}/api/admin/duplicate-bookings`,   { headers: h() }),
        axios.get(`${API}/api/admin/provider-of-week`,     { headers: h() }),
        axios.get(`${API}/api/admin/user-spending`,        { headers: h() }),
      ]);
      setOverview(ov.data);
      setLeaderboard(lb.data||[]);
      setActivity(act.data||[]);
      setInactive(inact.data||[]);
      setDuplicates(dup.data||[]);
      setPotw(pw.data||[]);
      setUserSpending(us.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/admin/activity?type=${actFilter}&limit=40`, { headers: h() });
      setActivity(res.data||[]);
    } catch {}
  }, [actFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh activity feed every 30s
  useEffect(() => {
    actInterval.current = setInterval(fetchActivity, 30000);
    return () => clearInterval(actInterval.current);
  }, [fetchActivity]);

  useEffect(() => { fetchActivity(); }, [actFilter, fetchActivity]);

  const tabs = [
    { id: "overview",   label: "Overview",   icon: TrendingUp   },
    { id: "leaderboard",label: "Leaderboard",icon: Trophy       },
    { id: "activity",   label: "Activity",   icon: Activity     },
    { id: "inactive",   label: "Inactive",   icon: UserMinus    },
    { id: "duplicates", label: "Duplicates", icon: Copy         },
    { id: "potw",       label: "Prov. of Week", icon: Award     },
    { id: "spending",   label: "User Spending", icon: IndianRupee},
  ];

  const handleExportSummary = () => {
    if (!overview) return;
    
    const { totals } = overview;
    const columns = [
      { header: "Metric", dataKey: "metric" },
      { header: "Value", dataKey: "value" }
    ];

    const data = [
      { metric: "Total Users", value: fmt(totals.total_users) },
      { metric: "Total Providers", value: fmt(totals.total_providers) },
      { metric: "Verified Providers", value: fmt(totals.verified_providers) },
      { metric: "Total Bookings", value: fmt(totals.total_bookings) },
      { metric: "Completed Bookings", value: fmt(totals.completed_bookings) },
      { metric: "Total Revenue", value: `Rs. ${fmt(totals.total_revenue)}` },
      { metric: "Open Complaints", value: fmt(totals.open_complaints) },
      { metric: "Bookings Today", value: fmt(totals.bookings_today) }
    ];

    generatePDFReport({
      title: "Platform Executive Summary",
      columns: columns,
      data: data,
      filename: "executive_summary",
      stats: {
        "Platform": "ZERV",
        "Type": "Full Status Report",
        "Currency": "INR"
      }
    });
  };

  const sortedLb = [...leaderboard].sort((a,b)=>(b[lbSort]||0)-(a[lbSort]||0));

  const actColor = { booking:"bg-blue-100 text-blue-700", signup:"bg-green-100 text-green-700", complaint:"bg-red-100 text-red-700" };
  const actIcon  = { booking:"📋", signup:"👤", complaint:"⚠️" };

  if (loading) return (
    <div className="flex justify-center py-20">
      <RefreshCw size={24} className="text-gray-400 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 pb-24 md:pb-6">

      {/* Tab nav */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === t.id ? "bg-indigo-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={handleExportSummary}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-xs font-semibold shadow-sm"
          >
            <FileText size={13} className="text-indigo-600" />
            Summary PDF
          </button>
          <button onClick={fetchAll} title="Refresh all"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition shrink-0">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeTab === "overview" && overview && (
        <div className="space-y-5">
          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Kpi label="Total Revenue"      value={`₹${fmt(overview.totals?.total_revenue)}`}    icon={IndianRupee}    color="green"  sub="from completed bookings" />
            <Kpi label="Total Bookings"     value={fmt(overview.totals?.total_bookings)}          icon={CheckCircle2}   color="indigo" sub={`${overview.totals?.bookings_today||0} today`} />
            <Kpi label="Completed"          value={fmt(overview.totals?.completed_bookings)}      icon={CheckCircle2}   color="blue"   />
            <Kpi label="Registered Users"   value={fmt(overview.totals?.total_users)}             icon={Users}          color="purple" />
            <Kpi label="Open Complaints"    value={fmt(overview.totals?.open_complaints)}         icon={AlertTriangle}  color="red"    />
          </div>

          {/* Revenue chart - 30 days */}
          <Section title="Daily Revenue — Last 30 Days" icon={TrendingUp}>
            {(overview.daily||[]).length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">No revenue data yet. Complete bookings with cash amounts to see charts.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={overview.daily} margin={{top:5,right:10,left:0,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={fmtD} tick={{fontSize:10,fill:"#9ca3af"}} />
                  <YAxis tick={{fontSize:10,fill:"#9ca3af"}} tickFormatter={v=>`₹${v}`} width={55} />
                  <Tooltip formatter={v=>[`₹${fmt(v)}`,"Revenue"]} labelFormatter={fmtD}
                    contentStyle={{borderRadius:"10px",border:"1px solid #e5e7eb",fontSize:"12px"}} />
                  <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5}
                    dot={{r:3,fill:"#4f46e5"}} activeDot={{r:5}} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Section>

          {/* Bookings + Revenue monthly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Section title="Monthly Bookings">
              {(overview.monthly||[]).length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={overview.monthly} margin={{top:5,right:5,left:0,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} />
                    <YAxis tick={{fontSize:10,fill:"#9ca3af"}} width={30} />
                    <Tooltip contentStyle={{borderRadius:"10px",border:"1px solid #e5e7eb",fontSize:"12px"}} />
                    <Bar dataKey="bookings" fill="#4f46e5" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>

            <Section title="Monthly Revenue">
              {(overview.monthly||[]).length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={overview.monthly} margin={{top:5,right:5,left:0,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{fontSize:10,fill:"#9ca3af"}} />
                    <YAxis tick={{fontSize:10,fill:"#9ca3af"}} tickFormatter={v=>`₹${v}`} width={55} />
                    <Tooltip formatter={v=>[`₹${fmt(v)}`,"Revenue"]}
                      contentStyle={{borderRadius:"10px",border:"1px solid #e5e7eb",fontSize:"12px"}} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>
          </div>

          {/* Provider stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Kpi label="Total Providers"    value={fmt(overview.totals?.total_providers)}    icon={Users} color="indigo" />
            <Kpi label="Verified"           value={fmt(overview.totals?.verified_providers)} icon={CheckCircle2} color="green" />
            <Kpi label="Pending Approval"   value={fmt(overview.totals?.pending_providers)}  icon={Clock} color="yellow" />
            <Kpi label="Pending Bookings"   value={fmt(overview.totals?.pending_bookings)}   icon={Clock} color="blue" />
          </div>
        </div>
      )}

      {/* ═══ LEADERBOARD ═══ */}
      {activeTab === "leaderboard" && (
        <div className="space-y-4">
          <Section title="Provider Performance Leaderboard" icon={Trophy}
            action={
              <div className="flex items-center gap-2">
                <select value={lbSort} onChange={e=>setLbSort(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
                  <option value="total_earnings">By Earnings</option>
                  <option value="completed_jobs">By Jobs</option>
                  <option value="avg_rating">By Rating</option>
                  <option value="trust_score">By Trust Score</option>
                </select>
                <button onClick={()=>exportCSV(sortedLb,"leaderboard.csv")}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                  <Download size={13}/> CSV
                </button>
              </div>
            }>
            {sortedLb.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">No data yet</div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["#","Provider","District","Earnings","Jobs","Rating","Resp. Time","Trust","Professions"].map(h=>(
                          <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sortedLb.map((p,i)=>(
                        <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${i<3?"font-medium":""}`}>
                          <td className="px-3 py-3 text-center">
                            {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span className="text-gray-400 text-xs">{i+1}</span>}
                          </td>
                          <td className="px-3 py-3 text-gray-900">{p.full_name}</td>
                          <td className="px-3 py-3 text-gray-500 text-xs">{p.district}</td>
                          <td className="px-3 py-3 text-gray-900">₹{fmt(p.total_earnings)}</td>
                          <td className="px-3 py-3 text-gray-700">{p.completed_jobs}</td>
                          <td className="px-3 py-3">
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-amber-400 fill-amber-400" />
                              {Number(p.avg_rating||0).toFixed(1)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-gray-500 text-xs">
                            {p.avg_response_time > 0 ? `${Math.round(p.avg_response_time)}m` : "—"}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all"
                                  style={{
                                    width:`${p.trust_score||100}%`,
                                    background: p.trust_score>=80?"#10b981":p.trust_score>=50?"#f59e0b":"#ef4444"
                                  }} />
                              </div>
                              <span className="text-xs text-gray-500">{p.trust_score||100}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            {p.professions ? (
                              <div className="flex flex-wrap gap-1">
                                {p.professions.split(",").slice(0,2).map((pr,idx)=>(
                                  <span key={idx} className="px-1.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 rounded">{pr.trim()}</span>
                                ))}
                              </div>
                            ) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {sortedLb.slice(0,20).map((p,i)=>(
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="text-xl w-8 text-center shrink-0">
                        {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span className="text-sm text-gray-400">{i+1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.full_name}</p>
                        <p className="text-xs text-gray-500">{p.district}</p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-600">
                          <span>₹{fmt(p.total_earnings)}</span>
                          <span>{p.completed_jobs} jobs</span>
                          <span>⭐{Number(p.avg_rating||0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>

          {/* Earnings bar chart */}
          {sortedLb.slice(0,10).some(p=>p.total_earnings>0) && (
            <Section title="Top 10 Providers by Earnings" icon={IndianRupee}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sortedLb.slice(0,10)} layout="vertical" margin={{top:0,right:20,left:80,bottom:0}}>
                  <XAxis type="number" tick={{fontSize:10,fill:"#9ca3af"}} tickFormatter={v=>`₹${v}`} />
                  <YAxis type="category" dataKey="full_name" tick={{fontSize:11,fill:"#374151"}} width={80} />
                  <Tooltip formatter={v=>[`₹${fmt(v)}`,"Earnings"]}
                    contentStyle={{borderRadius:"10px",border:"1px solid #e5e7eb",fontSize:"12px"}} />
                  <Bar dataKey="total_earnings" radius={[0,6,6,0]}>
                    {sortedLb.slice(0,10).map((_,i)=>(
                      <Cell key={i} fill={COLORS[i%COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Section>
          )}
        </div>
      )}

      {/* ═══ ACTIVITY FEED ═══ */}
      {activeTab === "activity" && (
        <Section title="Real-time Activity Feed" icon={Activity}
          action={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live
              </span>
              <select value={actFilter} onChange={e=>setActFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none">
                <option value="all">All Events</option>
                <option value="booking">Bookings</option>
                <option value="signup">Sign-ups</option>
                <option value="complaint">Complaints</option>
              </select>
            </div>
          }>
          {activity.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No activity yet</div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {activity.map((item,i)=>(
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="text-xl shrink-0 mt-0.5">{actIcon[item.type]||"•"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${actColor[item.type]||"bg-gray-100 text-gray-600"}`}>
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDT(item.time)}</span>
                    </div>
                    <p className="text-sm text-gray-800">
                      {item.type === "booking" && <>
                        <span className="font-medium">{item.user_name}</span> booked{" "}
                        <span className="text-gray-600">"{item.detail}"</span>{" "}
                        with <span className="font-medium">{item.provider_name}</span>
                        <span className={`ml-2 px-2 py-0.5 text-[10px] rounded-full ${
                          item.status==="completed"?"bg-green-50 text-green-700":
                          item.status==="pending"?"bg-yellow-50 text-yellow-700":"bg-gray-50 text-gray-500"
                        }`}>{item.status}</span>
                      </>}
                      {item.type === "signup" && <>
                        <span className="font-medium">{item.user_name||"Unknown"}</span>{" "}
                        joined as <span className="text-indigo-600 font-medium">{item.detail}</span>
                      </>}
                      {item.type === "complaint" && <>
                        <span className="font-medium">{item.user_name}</span> reported{" "}
                        <span className="font-medium">{item.provider_name}</span>{" "}
                        <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                          item.detail==="critical"?"bg-red-100 text-red-700":
                          item.detail==="high"?"bg-orange-100 text-orange-700":"bg-yellow-50 text-yellow-700"
                        }`}>{item.detail} severity</span>
                      </>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ═══ INACTIVE PROVIDERS ═══ */}
      {activeTab === "inactive" && (
        <Section title="Provider Inactivity Monitor" icon={UserMinus}
          action={
            <button onClick={()=>exportCSV(inactive,"inactive-providers.csv")}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
              <Download size={13}/> CSV
            </button>
          }>
          {inactive.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              🎉 All providers have been active in the last 30 days!
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 mb-4">{inactive.length} providers with no bookings in the last 30 days</p>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Provider","District","Last Booking","Total Jobs","Avg Rating","Reason","Action"].map(h=>(
                        <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {inactive.map(p=>(
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 font-medium text-gray-900">{p.full_name}</td>
                        <td className="px-3 py-3 text-gray-500 text-xs">{p.district}</td>
                        <td className="px-3 py-3 text-gray-500 text-xs">{fmtD(p.last_booking_date)||"Never"}</td>
                        <td className="px-3 py-3 text-gray-700">{p.total_bookings}</td>
                        <td className="px-3 py-3">
                          {p.avg_rating > 0 ? (
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-amber-400 fill-amber-400" />
                              {Number(p.avg_rating).toFixed(1)}
                            </span>
                          ) : <span className="text-gray-400 text-xs">No reviews</span>}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 text-[10px] font-medium rounded-full ${
                            p.reason.includes("rating")?"bg-red-50 text-red-700":
                            p.reason.includes("joined")?"bg-blue-50 text-blue-700":"bg-yellow-50 text-yellow-700"
                          }`}>{p.reason}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs text-indigo-600 cursor-pointer hover:underline">Send tip</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="sm:hidden space-y-3">
                {inactive.map(p=>(
                  <div key={p.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-gray-900">{p.full_name}</p>
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                        p.reason.includes("rating")?"bg-red-50 text-red-700":"bg-yellow-50 text-yellow-700"
                      }`}>{p.reason}</span>
                    </div>
                    <p className="text-xs text-gray-500">{p.district} • Last: {fmtD(p.last_booking_date)||"Never"} • {p.total_bookings} jobs</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* ═══ DUPLICATE BOOKINGS ═══ */}
      {activeTab === "duplicates" && (
        <Section title="Duplicate Booking Detector" icon={Copy}
          action={
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              duplicates.length > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}>{duplicates.length} found</span>
          }>
          {duplicates.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-2xl mb-3">✅</p>
              <p className="text-sm font-medium text-gray-900 mb-1">No duplicates detected</p>
              <p className="text-xs text-gray-500">No same customer + provider + service within 24 hours</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                ⚠️ These bookings may be accidental duplicates or potential fraud. Review and take action.
              </p>
              {duplicates.map((d,i)=>(
                <div key={i} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-red-900">{d.customer_name} → {d.provider_name}</p>
                      <p className="text-xs text-red-700 mt-0.5">"{d.service_description}"</p>
                    </div>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full shrink-0">
                      {d.hours_apart}h apart
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-red-600">
                    <span>Booking #{d.booking1_id} ({d.status1})</span>
                    <span>Booking #{d.booking2_id} ({d.status2})</span>
                    <span>{fmtDT(d.time1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ═══ PROVIDER OF THE WEEK ═══ */}
      {activeTab === "potw" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Award size={28} />
              <div>
                <h3 className="text-lg font-bold">Provider of the Week</h3>
                <p className="text-indigo-200 text-sm">Internal recognition — not shown to customers</p>
              </div>
            </div>
          </div>

          {potw.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-2xl mb-3">🏆</p>
              <p className="text-sm font-medium text-gray-900 mb-1">No data for this week yet</p>
              <p className="text-xs text-gray-500">Providers need completed bookings this week to appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {potw.map((p,i)=>(
                <div key={p.id} className={`bg-white rounded-2xl border p-6 text-center shadow-sm hover:shadow-md transition-shadow ${
                  i===0?"border-yellow-200 ring-2 ring-yellow-100":
                  i===1?"border-gray-200 ring-1 ring-gray-100":"border-gray-100"
                }`}>
                  <div className="text-4xl mb-3">{i===0?"🥇":i===1?"🥈":"🥉"}</div>
                  <h4 className="font-bold text-gray-900 mb-1">{p.full_name}</h4>
                  <p className="text-xs text-gray-500 mb-4">{p.district}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between px-2">
                      <span className="text-gray-500">Jobs this week</span>
                      <span className="font-bold text-gray-900">{p.jobs_this_week}</span>
                    </div>
                    <div className="flex justify-between px-2">
                      <span className="text-gray-500">Earnings</span>
                      <span className="font-bold text-gray-900">₹{fmt(p.earnings_this_week)}</span>
                    </div>
                    <div className="flex justify-between px-2">
                      <span className="text-gray-500">Rating</span>
                      <span className="font-bold text-gray-900 flex items-center gap-1">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        {Number(p.avg_rating||0).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between px-2">
                      <span className="text-gray-500">Trust score</span>
                      <span className={`font-bold ${p.trust_score>=80?"text-green-600":p.trust_score>=50?"text-yellow-600":"text-red-600"}`}>
                        {p.trust_score||100}/100
                      </span>
                    </div>
                  </div>

                  {p.professions && (
                    <div className="flex flex-wrap gap-1 justify-center mt-4">
                      {p.professions.split(",").slice(0,3).map((pr,idx)=>(
                        <span key={idx} className="px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 rounded-full">{pr.trim()}</span>
                      ))}
                    </div>
                  )}

                  {i===0 && (
                    <div className="mt-4 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-xs text-yellow-800 font-semibold">⭐ Top Performer this week!</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ USER SPENDING ═══ */}
      {activeTab === "spending" && userSpending && (
        <div className="space-y-5">
          {/* Spending by category pie chart */}
          <Section title="Revenue by Service Category" icon={IndianRupee}>
            {(userSpending.byCategory||[]).length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">No data yet</div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={userSpending.byCategory} dataKey="total_revenue" nameKey="profession"
                      cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                      {userSpending.byCategory.map((_,i)=>(
                        <Cell key={i} fill={COLORS[i%COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v=>[`₹${fmt(v)}`,"Revenue"]}
                      contentStyle={{borderRadius:"10px",border:"1px solid #e5e7eb",fontSize:"12px"}} />
                    <Legend iconType="circle" iconSize={10} formatter={(v)=><span style={{fontSize:"11px",color:"#374151"}}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full md:w-auto space-y-2 shrink-0">
                  {userSpending.byCategory.map((cat,i)=>(
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{background:COLORS[i%COLORS.length]}} />
                      <span className="text-sm text-gray-700 flex-1">{cat.profession}</span>
                      <span className="text-sm font-bold text-gray-900 text-right">₹{fmt(cat.total_revenue)}</span>
                      <span className="text-xs text-gray-400 w-12 text-right">{cat.bookings}j</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Top spenders */}
          <Section title="Top Spending Customers" icon={Users}
            action={
              <button onClick={()=>exportCSV(userSpending.topSpenders,"top-spenders.csv")}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition">
                <Download size={13}/> CSV
              </button>
            }>
            {(userSpending.topSpenders||[]).length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No completed bookings with amounts yet</div>
            ) : (
              <div className="space-y-2">
                {userSpending.topSpenders.map((c,i)=>(
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                      {i<3?["🥇","🥈","🥉"][i]:i+1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.full_name}</p>
                      <p className="text-xs text-gray-500">{c.bookings} bookings • Avg ₹{fmt(Math.round(c.avg_per_booking))}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">₹{fmt(c.total_spent)}</p>
                      <p className="text-xs text-gray-400">total spent</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}