import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Navbar.css';
import { FiMenu, FiSearch } from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      // redirect to /search/<query>
      navigate(`/search/${query}`);
    }
  };

  const newspapers = [
    { name: "Hindustan Times", url: "https://epaper.hindustantimes.com" },
    { name: "Dainik Bhaskar", url: "https://epaper.bhaskar.com" },
    { name: "The Hindu", url: "https://epaper.thehindu.com" },
    { name: "Times of India", url: "https://epaper.timesgroup.com" },
    { name: "Amar Ujala", url: "https://epaper.amarujala.com" },
    { name: "Navbharat Times", url: "https://navbharattimes.indiatimes.com/epaper" },
  ];

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const openPaper = (url) => {
    window.open(url, "_blank");
    setShowDropdown(false);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) &&
          !event.target.classList.contains("menu-icon")) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="left-section">
          <FiMenu className="menu-icon" onClick={toggleSidebar} />
          <div className="logo" onClick={() => navigate("/")}>
            Newsly
          </div>
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search ..."
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>

        <div className="nav-links">
          {token ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/upload">Create</Link>

              {/* E-Papers Dropdown */}
              <div className="epaper-menu" ref={dropdownRef}>
                <button className="epaper-btn" onClick={toggleDropdown}>
                  E-Papers ▾
                </button>
                {showDropdown && (
                  <div className="epaper-dropdown show">
                    {newspapers.map((paper, index) => (
                      <div
                        key={index}
                        className="epaper-option"
                        onClick={() => openPaper(paper.url)}
                      >
                        {paper.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/profile" className="nav-btn">Profile</Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </div>
      </nav>

      {/* ===== Left Sidebar ===== */}
      <div
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        ref={sidebarRef}
      >
        <h3>Menu</h3>
        {token ? (
          <>
            <Link to="/" onClick={toggleSidebar}>Home</Link>
            <Link to="/newsly" onClick={toggleSidebar}>Newsly Ai</Link>
            <Link to="/upload" onClick={toggleSidebar}>Upload News</Link>
            <Link to="/profile" onClick={toggleSidebar}>Profile</Link>
            <h4 style={{ textDecoration: "underline", color: "#187bf5" }}>News Channels</h4>
            {newspapers.map((paper, idx) => (
              <div
                key={idx}
                className="sidebar-link"
                onClick={() => openPaper(paper.url)}
              >
                {paper.name}
              </div>
            ))}

            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={toggleSidebar}>Login</Link>
            <Link to="/signup" onClick={toggleSidebar}>Signup</Link>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;