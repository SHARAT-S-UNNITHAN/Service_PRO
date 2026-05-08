import { useState, useEffect } from "react";
import axios from "axios";
import { Megaphone, X, Bell } from "lucide-react";

const API = "http://localhost:4000";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API}/api/announcements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnnouncements(res.data || []);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      }
    };

    fetchAnnouncements();
  }, []);

  if (!visible || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const nextAnnouncement = () => {
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setVisible(false);
    }
  };

  return (
    <div className="bg-indigo-600 text-white p-4 relative overflow-hidden shadow-lg animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <Megaphone size={20} className="animate-bounce" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-500 px-2 py-0.5 rounded">
              Announcement
            </span>
            <h4 className="font-bold text-sm truncate">{current.title}</h4>
          </div>
          <p className="text-xs text-indigo-100 mt-0.5 line-clamp-1 italic">
            {current.message}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {announcements.length > 1 && (
            <span className="text-[10px] text-indigo-300 font-medium">
              {currentIndex + 1} of {announcements.length}
            </span>
          )}
          <button 
            onClick={nextAnnouncement}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Next / Close"
          >
            {currentIndex < announcements.length - 1 ? <Bell size={18} /> : <X size={18} />}
          </button>
        </div>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
    </div>
  );
}
