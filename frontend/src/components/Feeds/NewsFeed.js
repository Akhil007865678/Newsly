import React from "react";
import NewsCard from "../NewsCard/NewsCard";
import './NewsFeed.css';

const NewsFeed = ({ newsList, onSelect }) => {
  if (newsList.length === 0) {
    return <div className="no-news">No news found.</div>;
  }

  return (
    <div className="news-feed">
      {newsList.map((news) => (
        <NewsCard key={news._id} news={news} onClick={() => onSelect(news)} />
      ))}
    </div>
  );
};

export default NewsFeed;
