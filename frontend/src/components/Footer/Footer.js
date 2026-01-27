import React, { useEffect, useState } from "react";
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import axios from "axios";
import "./Footer.css";

const Footer = () => {
  const [theme, setTheme] = useState("dark");
  const [links, setLinks] = useState([]);

  // 🌗 Theme handling
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // 🔗 Dynamic links
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await axios.get("/api/footer-links");
        setLinks(res.data);
      } catch {
        setLinks([
          { name: "Home", url: "/" },
          { name: "Newsly Ai", url: "/newsly" },
          { name: "Trending", url: "/" },
          { name: "Profile", url: "/profile" },
          { name: "Voice Search", url: "/" },
        ]);
      }
    };
    fetchLinks();
  }, []);

  return (
    <footer className="footer glass">
      <div className="footer-wrapper">

        {/* Brand */}
        <div className="brand">
          <h2>📰 Newsly</h2>
          <p>
            A smart AI-powered news platform with voice search, AI chat,
            real-time updates, and intelligent recommendations.
          </p>

          <div className="socials">
            <a href="https://www.linkedin.com/in/akhil-raj-916943257/" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://github.com/Akhil007865678?tab=repositories" aria-label="GitHub"><FaGithub /></a>
            <a aria-label="Twitter"><FaTwitter /></a>
          </div>
        </div>

        {/* Links */}
        <div className="links">
          <h4>Explore</h4>
          {links.map((l, i) => (
            <a key={i} href={l.url}>{l.name}</a>
          ))}
        </div>

        {/* Extra */}
        <div className="extra">
          <h4>Platform</h4>
          <p>🔊 Voice Assistant</p>
          <p>🤖 AI Chat</p>
          <p>🧠 Smart AI Search</p>
          <p>⚡ Real-time News</p>
        </div>

        {/* Theme */}
        <div className="theme">
          <h4>Appearance</h4>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
            <span>{theme === "dark" ? "Light" : "Dark"} Mode</span>
          </button>
        </div>

      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Newsly</span>
        <span>Built with ❤️ by Akhil Raj</span>
      </div>
    </footer>
  );
};

export default Footer;
