// src/components/admin/MLInsightsSection.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Zap, Brain, TrendingUp, Info, RefreshCw, BarChart3, Target, ShieldCheck } from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";

const API = "http://localhost:4000";

export default function MLInsightsSection() {
  const [stats, setStats] = useState(null);
  const [weights, setWeights] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation State
  const [simRating, setSimRating] = useState(4.5);
  const [simResponse, setSimResponse] = useState(30);
  const [simVolume, setSimVolume] = useState(25);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [statsRes, weightsRes] = await Promise.all([
        axios.get(`${API}/api/ml/training-stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/ml/weights`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setWeights(weightsRes.data);
    } catch (err) {
      console.error("Error fetching ML data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateSimScore = () => {
    if (!weights || !weights.weights) return 0;
    const w = weights.weights;
    
    // Rating score
    let ratingScore = (simRating / 5) * w.rating;
    if (simRating >= 4.8) ratingScore *= 1.1;
    else if (simRating >= 4.5) ratingScore *= 1.05;
    
    // Response score
    let responseScore = 0;
    if (simResponse <= 15) responseScore = w.response;
    else if (simResponse <= 60) responseScore = w.response * 0.9;
    else if (simResponse <= 240) responseScore = w.response * 0.7;
    else responseScore = w.response * 0.3;
    
    // Volume score
    let volumeScore = Math.min(w.volume, (simVolume / 20) * w.volume);
    if (simVolume >= 50) volumeScore *= 1.1;
    
    const score = Math.round(ratingScore + responseScore + volumeScore);
    return Math.max(0, Math.min(100, score));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw size={24} className="text-indigo-600 animate-spin" />
      </div>
    );
  }

  const radarData = [
    { subject: 'Rating Importance', A: weights?.weights?.rating || 40, fullMark: 100 },
    { subject: 'Response Speed', A: weights?.weights?.response || 35, fullMark: 100 },
    { subject: 'Service Volume', A: weights?.weights?.volume || 25, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="text-indigo-600" /> ML Ranking Insights
          </h2>
          <p className="text-gray-500 text-sm mt-1">Understanding how our artificial intelligence ranks service providers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${weights?.is_trained ? "bg-green-50 text-green-700 border border-green-100" : "bg-yellow-50 text-yellow-700 border border-yellow-100"}`}>
            <span className={`w-2 h-2 rounded-full ${weights?.is_trained ? "bg-green-500" : "bg-yellow-500"}`} />
            {weights?.is_trained ? "MODEL TRAINED" : "DEFAULT WEIGHTS"}
          </div>
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Distribution */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Target size={20} className="text-indigo-600" /> Dynamic Weight Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 60]} tick={false} axisLine={false} />
                  <Radar
                    name="Current Weight"
                    dataKey="A"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-indigo-900">Rating Priority</span>
                  <span className="text-lg font-bold text-indigo-600">{weights?.weights?.rating.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${weights?.weights?.rating}%` }} />
                </div>
                <p className="text-[10px] text-indigo-500 mt-2">Impacts score based on average customer reviews</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-emerald-900">Response Speed</span>
                  <span className="text-lg font-bold text-emerald-600">{weights?.weights?.response.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${weights?.weights?.response}%` }} />
                </div>
                <p className="text-[10px] text-emerald-500 mt-2">Impacts score based on booking acceptance time</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-amber-900">Experience Volume</span>
                  <span className="text-lg font-bold text-amber-600">{weights?.weights?.volume.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: `${weights?.weights?.volume}%` }} />
                </div>
                <p className="text-[10px] text-amber-500 mt-2">Impacts score based on total number of reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Training Context */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Info size={20} className="text-indigo-600" /> Data Source Context
          </h3>
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-gray-100">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{stats?.training_data?.total_bookings || 0}</p>
                <p className="text-xs text-gray-500">Bookings Analyzed</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-gray-100">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{stats?.training_data?.unique_providers || 0}</p>
                <p className="text-xs text-gray-500">Providers Modeled</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Training Window</p>
              <p className="text-[11px] text-gray-600">
                Oldest: {new Date(stats?.training_data?.oldest_data).toLocaleDateString()}<br/>
                Newest: {new Date(stats?.training_data?.newest_data).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-auto p-4 bg-indigo-600 rounded-2xl text-white">
              <p className="text-xs font-medium opacity-80 mb-1">Model Version</p>
              <p className="text-sm font-bold tracking-tight">SimpleLinear-V2.1</p>
              <div className="mt-3 flex items-center gap-2 text-[10px] bg-white/10 p-2 rounded-lg">
                <Zap size={12} className="text-yellow-300" />
                <span>Auto-retrains every 24 hours based on new booking outcomes.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-600" /> Ranking Score Simulator
            </h3>
            <p className="text-sm text-gray-500 mt-1">Simulate how a provider's profile metrics translate into an ML ranking score</p>
          </div>
          <div className="px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Predicted Score</p>
            <p className="text-4xl font-black text-indigo-600">{calculateSimScore()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">Average Rating</label>
              <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">{simRating} ★</span>
            </div>
            <input 
              type="range" min="1" max="5" step="0.1" 
              value={simRating} onChange={(e) => setSimRating(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <p className="text-[10px] text-gray-400">Higher ratings significantly boost visibility</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">Response Time (min)</label>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">{simResponse} min</span>
            </div>
            <input 
              type="range" min="5" max="300" step="5" 
              value={simResponse} onChange={(e) => setSimResponse(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[10px] text-gray-400">Response time under 15 mins provides maximum boost</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">Review Count</label>
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{simVolume} reviews</span>
            </div>
            <input 
              type="range" min="0" max="100" step="1" 
              value={simVolume} onChange={(e) => setSimVolume(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[10px] text-gray-400">More reviews build confidence and increase rank</p>
          </div>
        </div>
      </div>
    </div>
  );
}
