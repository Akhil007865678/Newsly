import React from "react";
import './NewsCard.css';

const NewsCard = ({ news, onClick }) => {
  return (
    <div className="news-card" onClick={onClick}>
      <h3 className="news-title">{news.title}</h3>
      {news.imageUrl && <img className="news-img" src={news.imageUrl} alt="news" />}
      <div className="news-body">
        <p className="news-content">{news.content?.substring(0, 150)}...</p>
      </div>
    </div>
  );
};

export default NewsCard;
