import React, { useState, useEffect } from "react";
import API from "../../api";
import { getToken } from "../../utils/auth";
import { useParams } from "react-router-dom";
import "./Search.css";
import NewsPopup from "../../components/NewsPopup/NewsPopup";

const Search = () => {
  const [newsList, setNewsList] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const { query } = useParams();
 
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await API.get(`/news/${query}`);
        setNewsList(res.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, [query]);

  return (
    <>
    <div className="news-grid">
      {newsList.map((news) => (
        <div className="news-card" onClick={() => setSelectedNews(news)}>
          <h3 className="news-title">{news.title}</h3>
          {news.imageUrl && <img className="news-img" src={news.imageUrl} alt="news" />}
          <div className="news-body">
            <p className="news-content">{news.content?.substring(0, 150)}...</p>
          </div>
        </div>
      ))}
      </div>
      {selectedNews && (
        <NewsPopup
          news={selectedNews}
          onClose={() => setSelectedNews(null)}
        />
      )}
    </>
  );
};

export default Search;