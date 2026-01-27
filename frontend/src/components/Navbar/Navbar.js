import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Navbar.css';
import { FiMenu, FiSearch } from "react-icons/fi";
import { MdKeyboardVoice } from "react-icons/md";
import API from "../../api";
import { CirclesWithBar } from "react-loader-spinner";
import { RiVoiceprintFill } from "react-icons/ri";


const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const [query, setQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSearch = (e) => {
  if (e.key === "Enter") {
    performSearch(query);
  }
};

const performSearch = (searchText) => {
  const cleanText = searchText.trimStart(); // ✅ only first spacing
  if (!cleanText) return;
  navigate(`/search/${cleanText}`);
};


  
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    setIsRecording(true);
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      setIsRecording(false);
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.webm");
      try {
        const res = await API.post("/news/stt", formData);
        const text = res.data.text;
        //console.log("Transcribed Text:", text);
        if (!text.trim()) return;

        setQuery(text);
        // ✅ Send directly using text
        performSearch(text);

      } catch (err) {
        console.error("Voice to text failed:", err);
      }
    };

    mediaRecorder.start();
    setTimeout(() => mediaRecorder.stop(), 5000);
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
            {isRecording ? <CirclesWithBar 
              height="40"
              width="40"
              color="#2764ec"
              outerCircleColor="#2764ec"
              innerCircleColor="#2764ec"
              barColor="#2764ec"
              ariaLabel="circles-with-bar-loading"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
              /> :
              <MdKeyboardVoice className="voiceSearch" onClick={() => startRecording()}/>
            }
            
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
            <Link to="/" onClick={toggleSidebar} style={{ textDecoration: "none"}}>Home</Link>
            <Link to="/newsly" onClick={toggleSidebar} style={{ textDecoration: "none"}}>Newsly Ai</Link>
            <Link to="/upload" onClick={toggleSidebar} style={{ textDecoration: "none"}}>Upload News</Link>
            <Link to="/profile" onClick={toggleSidebar} style={{ textDecoration: "none"}}>Profile</Link>
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