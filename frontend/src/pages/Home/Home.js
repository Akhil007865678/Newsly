import React, { useState, useEffect } from "react";
import API from "../../api";
import { getToken } from "../../utils/auth";
import "./Home.css";
import { FiFilter } from "react-icons/fi";
import FilterDropdown from "../../components/Filter/FilterDropdown";
import NewsFeed from "../../components/Feeds/NewsFeed";
import NewsPopup from "../../components/NewsPopup/NewsPopup";
import Loader from "../../components/Loading/Loader";
import { Bot } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";

const Home = () => {
  const [newsList, setNewsList] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const token = getToken();
  const navigate = useNavigate();

  const handleBotClick = () => {
    navigate(`/newsly`);
  };

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await API.get("/auth/recommend");
        const recommendations = Array.isArray(res.data)
          ? res.data
          : res.data.recommendations;
        //console.log("data: ", recommendations);
        setNewsList(recommendations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filteredNews = newsList
    .filter(
      (news) =>
        (!filterCategory || news.category === filterCategory) &&
        (!filterLocation || news.location === filterLocation)
    )
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "popular") return (b.likes?.length || 0) - (a.likes?.length || 0);
      return 0;
    });
    
  if (loading) {
    return (
      <div className="home-container">
        <Loader />
      </div>
    );
  }
  return (
    <div className="home-container">
      {/* Filter Button */}
      <div className="filter-icon-wrapper">
        <FiFilter className="filter-icon" color="white" onClick={() => setShowFilter(!showFilter)} />
        <div className="filter-icon" onClick={handleBotClick}>
          <Bot className="bot" size={20} color="white" />
        </div>
        {showFilter && (
          <FilterDropdown
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterLocation={filterLocation}
            setFilterLocation={setFilterLocation}
          />
        )}
      </div>
      {/* News Feed */}
      <NewsFeed newsList={filteredNews} onSelect={setSelectedNews} />

      {/* Popup Modal */}
      {selectedNews && (
        <NewsPopup news={selectedNews} onClose={() => setSelectedNews(null)} />
      )}

      <Footer className="footer"/>
    </div>
  );
};

export default Home;