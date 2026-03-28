// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faBars,
  faTimes,
  faArrowRight,
  faUserCircle, // profile icon fallback
} from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false); // profile dropdown
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);

  // Check login status
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isLoggedIn = !!token;

  // Profile initial (U = user, P = provider, A = admin)
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
      navigate("/user/profile");  // ← Regular users go to profile page
    } else if (role === "provider") {
      navigate("/provider/dashboard");
    } else if (role === "admin") {
      navigate("/admin/dashboard");
    }
    setProfileOpen(false);
  };

  return (
    <>
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
          SmartService
        </Link>

        {/* Desktop: Search Icon + Profile / Get Started */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
          {/* Search Icon / Input */}
          {!searchOpen ? (
            <button
              onClick={() => setSearchOpen(true)}
              className="text-gray-700 hover:text-[#003459] transition text-xl p-2 rounded-full hover:bg-gray-100"
              aria-label="Open search"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          ) : (
            <form 
              onSubmit={handleSearch}
              className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm w-80 max-w-md animate-expand"
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
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-sm"
                autoFocus
              />
              <button
                type="submit"
                className="ml-3 text-[#003459] hover:text-[#00171F] transition"
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </form>
          )}

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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                  <div className="py-1">
                    <button
                      onClick={goToDashboard}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile / Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
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
          className="md:hidden text-[#00171f] text-3xl cursor-pointer focus:outline-none"
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
            className="absolute top-16 left-0 right-0 bg-white shadow-xl p-6 animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Search */}
            <form 
              onSubmit={handleSearch}
              className="flex items-center bg-gray-100 rounded-full px-4 py-3 mb-6"
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
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
              />
              <button type="submit" className="text-[#003459]">
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </form>

            {searchError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center text-sm">
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
                      navigate(role === "user" ? "/profile" : role === "provider" ? "/provider/dashboard" : "/admin/dashboard");
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