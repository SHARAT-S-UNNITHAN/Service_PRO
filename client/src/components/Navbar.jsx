// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faBars,
  faTimes,
  faArrowRight,
  faClock,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [clockDropdownOpen, setClockDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);
  const clockRef = useRef(null);
  const clockContainerRef = useRef(null);

  // Clock initialization effect
  useEffect(() => {
    if (!clockDropdownOpen || !clockContainerRef.current) return;

    const container = clockContainerRef.current;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create clock container structure (scaled down version)
    container.innerHTML = `
      <div class="clock-container-display">
        <div class="clock-digital">
          <div class="date"></div>
          <div class="time"></div>
          <div class="day"></div>
        </div>
        <div class="clock-analog">
          <div class="spear"></div>
          <div class="hour"></div>
          <div class="minute"></div>
          <div class="second"></div>
          <div class="dail"></div>
        </div>
      </div>
    `;

    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function dailer(selector, size) {
      const element = container.querySelector(selector);
      if (element) {
        for (let s = 0; s < 60; s++) {
          const span = document.createElement('span');
          span.style.transform = `rotate(${6 * s}deg) translateX(${size}px)`;
          span.textContent = s;
          element.appendChild(span);
        }
      }
    }

    function getTime() {
      const date = new Date();
      const second = date.getSeconds();
      const minute = date.getMinutes();
      let hour = date.getHours();
      
      // Convert to 12-hour format for display
      const displayHour = hour % 12 || 12;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const timeStr = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
      
      const day = date.getDay();
      const month = date.getMonth();
      const dateNum = date.getDate();
      const dateStr = `${dateNum} . ${months[month]}`;
      
      const ds = second * -6;
      const dm = minute * -6;
      const dh = (hour % 12) * -30 + (minute * -0.5);
      
      const secondHand = container.querySelector('.second');
      const minuteHand = container.querySelector('.minute');
      const hourHand = container.querySelector('.hour');
      const timeDiv = container.querySelector('.time');
      const dayDiv = container.querySelector('.day');
      const dateDiv = container.querySelector('.date');
      
      if (secondHand) secondHand.style.transform = `rotate(${ds}deg)`;
      if (minuteHand) minuteHand.style.transform = `rotate(${dm}deg)`;
      if (hourHand) hourHand.style.transform = `rotate(${dh}deg)`;
      if (timeDiv) timeDiv.textContent = timeStr;
      if (dayDiv) dayDiv.textContent = days[day];
      if (dateDiv) dateDiv.textContent = dateStr;
    }

    // Initialize dials with scaled sizes
    dailer('.second', 95);
    dailer('.minute', 70);
    dailer('.dail', 115);
    
    // Add hour markers
    const hourElement = container.querySelector('.hour');
    if (hourElement) {
      for (let s = 1; s < 13; s++) {
        const span = document.createElement('span');
        span.style.transform = `rotate(${30 * s}deg) translateX(50px)`;
        span.textContent = s;
        hourElement.appendChild(span);
      }
    }

    // Start clock
    getTime();
    const interval = setInterval(getTime, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [clockDropdownOpen]);

  // Close clock dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clockRef.current && !clockRef.current.contains(event.target)) {
        setClockDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check login status
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isLoggedIn = !!token;

  // Profile initial
  const profileInitial = role ? role[0].toUpperCase() : '?';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      const progress = document.getElementById('progress');
      if (progress) {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolledPercent = (winScroll / height) * 100;
        progress.style.width = scrolledPercent + '%';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchError('');

    const query = searchQuery.trim();

    if (!query || query.length < 2) {
      setSearchError("Please enter at least 2 characters");
      return;
    }

    navigate(`/unisearch?q=${encodeURIComponent(query)}`);

    setSearchQuery('');
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    setProfileOpen(false);
  };

  const goToDashboard = () => {
    const role = localStorage.getItem("role");
    if (role === "user") {
      navigate("/user/profile");
    } else if (role === "provider") {
      navigate("/provider/dashboard");
    } else if (role === "admin") {
      navigate("/admin/dashboard");
    }
    setProfileOpen(false);
  };

  return (
    <>
      <style>{`
        /* Clock Styles - Scaled Down Version */
        .clock-dropdown-content {
          position: fixed;
          top: 70px;
          right: 120px;
          width: 280px;
          background: #222;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          z-index: 10000;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .clock-container-display {
          position: relative;
          width: 250px;
          height: 250px;
          margin: 0 auto;
          background: #222;
          overflow: hidden;
          border-radius: 50%;
          box-shadow: 0 0 15px 2px #000, 0 0 5px rgba(0,0,0,0.8) inset;
        }

        .clock-container-display .spear {
          position: absolute;
          width: 110px;
          height: 1px;
          background: red;
          left: 50%;
          top: 50%;
          transform: translateY(-50%);
          z-index: 200;
          box-shadow: 0 2px 2px rgba(0,0,0,0.4);
        }

        .clock-container-display .spear:after {
          content: '';
          position: absolute;
          border: 4px solid transparent;
          border-right-color: red;
          right: 0;
          top: -4px;
        }

        .clock-container-display .spear:before {
          content: '';
          position: absolute;
          border: 4px solid transparent;
          border-left-color: red;
          left: 2px;
          top: -4px;
        }

        .clock-container-display .clock-analog {
          width: 220px;
          height: 220px;
          margin: 15px;
          background: #fff;
          z-index: 5;
          position: relative;
          border-radius: 50%;
          box-shadow: 0 0 15px 2px #000 inset;
        }

        .clock-container-display .clock-analog .second,
        .clock-container-display .clock-analog .minute,
        .clock-container-display .clock-analog .hour {
          width: 12px;
          height: 12px;
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          z-index: 100;
          transition: 0.2s 0.2s ease-in;
          transform: rotate(90deg);
        }

        .clock-container-display .clock-analog .second span,
        .clock-container-display .clock-analog .minute span,
        .clock-container-display .clock-analog .hour span {
          position: absolute;
          width: 12px;
          height: 12px;
          line-height: 12px;
          text-align: center;
          transform-origin: 50%;
          z-index: 5;
          font-size: 8px;
        }

        .clock-container-display .clock-analog .second span:after,
        .clock-container-display .clock-analog .minute span:after,
        .clock-container-display .clock-analog .hour span:after {
          content: '';
          width: 2px;
          height: 1px;
          background: #000;
          position: absolute;
          left: 130%;
          top: -10%;
          opacity: 0.3;
        }

        .clock-container-display .clock-analog .second span:nth-child(5n+2):after,
        .clock-container-display .clock-analog .minute span:nth-child(5n+2):after,
        .clock-container-display .clock-analog .hour span:nth-child(5n+2):after {
          width: 4px;
          opacity: 1;
          left: 110%;
        }

        .clock-container-display .clock-analog .hour {
          z-index: 150;
          font-size: 16px;
          font-weight: 400;
        }

        .clock-container-display .clock-analog .hour span:after {
          opacity: 1;
          width: 2px;
          height: 1px;
          color: #666;
          transform: translate(3px, 6px);
        }

        .clock-container-display .clock-analog .hour:after {
          content: '';
          background: #fff;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 125px;
          height: 125px;
          border-radius: 50%;
          box-shadow: 0 0 8px 1px rgba(0,0,0,.6) inset;
        }

        .clock-container-display .clock-analog .minute {
          color: #fff;
          font-size: 8px;
        }

        .clock-container-display .clock-analog .minute span:after {
          background: #fff;
          transform: translate(5px, -4px) rotate(-9deg);
        }

        .clock-container-display .clock-analog .minute:after {
          content: '';
          background: #333;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 175px;
          height: 175px;
          border-radius: 50%;
          box-shadow: 0 0 12px 1px #000 inset;
        }

        .clock-container-display .clock-analog .second {
          font-size: 6px;
        }

        .clock-container-display .clock-analog .second span:after {
          transform: translate(3px, -5px);
        }

        .clock-container-display .clock-analog .dail {
          width: 12px;
          height: 12px;
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          z-index: 100;
        }

        .clock-container-display .clock-analog .dail span {
          width: 12px;
          height: 12px;
          line-height: 12px;
          transform-origin: 50%;
          text-indent: 1000px;
          overflow: hidden;
          position: absolute;
        }

        .clock-container-display .clock-analog .dail span:after {
          content: '';
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: #7d7e7d;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .clock-container-display .clock-analog .dail span:nth-child(5n+1):after {
          width: 4px;
        }

        .clock-container-display .clock-digital {
          position: absolute;
          z-index: 200;
          height: 222px;
          width: 112px;
          background: #090909;
          left: 9px;
          top: 9px;
          border-radius: 110px 0 0 110px;
          box-shadow: 3px 0 8px #000;
        }

        .clock-container-display .clock-digital:after {
          content: '';
          position: absolute;
          border: 8px solid #8e0a0a;
          border-right: none;
          height: 200px;
          width: 100px;
          border-radius: 110px 0 0 110px;
          left: 12px;
          top: 12px;
        }

        .clock-container-display .clock-digital .time {
          background: #111;
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #fff;
          border-radius: 25px;
          font-size: 12px;
          padding: 2px 10px;
          box-shadow: 0 0 8px #000 inset;
        }

        .clock-container-display .clock-digital .day {
          background: #111;
          position: absolute;
          right: 10px;
          bottom: 50px;
          color: #fff;
          border-radius: 10px;
          box-shadow: 0 0 8px #000 inset;
          padding: 2px 10px;
          font-size: 8px;
        }

        .clock-container-display .clock-digital .date {
          background: #111;
          position: absolute;
          right: 10px;
          top: 50px;
          color: #fff;
          border-radius: 10px;
          font-size: 8px;
          box-shadow: 0 0 5px #000 inset;
          padding: 2px 10px;
        }

        /* Clock button in navbar */
        .clock-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(0, 52, 89, 0.1);
          border: 1px solid rgba(0, 52, 89, 0.2);
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
          color: #003459;
        }

        .clock-toggle-btn:hover {
          background: rgba(0, 52, 89, 0.2);
          border-color: #003459;
          transform: translateY(-1px);
        }

        .dark .clock-toggle-btn {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .dark .clock-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 768px) {
          .clock-dropdown-content {
            position: fixed;
            top: auto;
            bottom: 20px;
            right: 20px;
            left: auto;
            width: 280px;
          }
        }

        @keyframes clockFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .clock-dropdown-content {
          animation: clockFadeIn 0.2s ease-out;
        }
      `}</style>

      <div
        id="progress"
        className="fixed top-0 left-0 h-[3px] bg-[#003459] z-[1100] w-0 transition-all duration-150 ease-out"
      />

      <nav
        className={`fixed top-0 left-0 right-0 h-16 sm:h-16 px-6 sm:px-8 
          bg-transparent backdrop-blur-xl z-[1000] flex items-center justify-between gap-6 sm:gap-8
          transition-all duration-300 ${scrolled ? 'shadow-[0_10px_30px_-8px_rgba(0,23,31,0.18)]' : ''}`}
      >
        {/* Logo */}
        <Link
          to="/"
          className="text-[1.7rem] sm:text-[1.8rem] font-extrabold tracking-[-1px] 
            bg-gradient-to-r from-[#003459] to-[#00171f] bg-clip-text text-transparent
            hover:opacity-90 transition-opacity"
        >
          ZERV
        </Link>

        {/* Desktop: Search Icon + Clock + Profile / Get Started */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
          {/* Search Icon / Input */}
          {!searchOpen ? (
            <button
              onClick={() => setSearchOpen(true)}
              className="text-gray-700 hover:text-[#003459] transition text-xl p-2 rounded-full hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Open search"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          ) : (
            <form 
              onSubmit={handleSearch}
              className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 shadow-sm w-80 max-w-md"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchError('');
                }}
                onBlur={() => {
                  if (!searchQuery.trim()) setSearchOpen(false);
                }}
                placeholder="Search service or location..."
                className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-500 text-sm"
                autoFocus
              />
              <button
                type="submit"
                className="ml-3 text-[#003459] hover:text-[#00171f] transition"
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </form>
          )}

          {/* Clock Button */}
          <div className="relative" ref={clockRef}>
            <button
              onClick={() => setClockDropdownOpen(!clockDropdownOpen)}
              className="clock-toggle-btn"
              aria-label="Open clock"
            >
              <FontAwesomeIcon icon={faClock} />
              <span>Clock</span>
              <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
            </button>

            {/* Clock Dropdown */}
            {clockDropdownOpen && (
              <div className="clock-dropdown-content">
                <div ref={clockContainerRef} className="clock-container-wrapper"></div>
              </div>
            )}
          </div>

          {/* Profile / Get Started */}
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-full bg-[#003459] text-white flex items-center justify-center text-lg font-bold hover:bg-[#00171f] transition"
                aria-label="Profile"
              >
                {profileInitial}
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
                  <div className="py-1">
                    <button
                      onClick={goToDashboard}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Profile / Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-full 
                bg-[#00171f] text-white hover:bg-[#003459] hover:-translate-y-0.5 
                transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#00171f] dark:text-white text-3xl cursor-pointer focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faBars} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-[999] md:hidden bg-black/50 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        >
          <div 
            className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Search */}
            <form 
              onSubmit={handleSearch}
              className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-3 mb-6"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchError('');
                }}
                placeholder="Search service or location..."
                className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-500"
              />
              <button type="submit" className="text-[#003459] dark:text-blue-400">
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </form>

            {searchError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-center text-sm">
                {searchError}
              </div>
            )}

            {/* Mobile Links */}
            <div className="flex flex-col gap-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      const role = localStorage.getItem("role");
                      navigate(role === "user" ? "/user/profile" : role === "provider" ? "/provider/dashboard" : "/admin/dashboard");
                      setMenuOpen(false);
                    }}
                    className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-full text-center hover:bg-indigo-700 transition"
                  >
                    Profile / Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full py-3 px-6 bg-red-600 text-white font-semibold rounded-full text-center hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/signup"
                  className="w-full py-3 px-6 bg-[#00171f] text-white font-semibold rounded-full text-center hover:bg-[#003459] transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}