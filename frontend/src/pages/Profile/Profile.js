import React, { useState, useEffect } from "react";
import API from "../../api"; // your axios instance
import './Profile.css';
import { getToken } from "../../utils/auth";
import NewsPopup from "../../components/NewsPopup/NewsPopup";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);

  const token=getToken();
  
  useEffect(() => {
    const handleUserData = async () => {
      try{
        const response=await API.get(`/auth/me`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        //console.log("data: ",response.data);
        setUserData(response.data);
      }
      catch(error){
        console.log("Problem occurred in fetching user data function: ", error);
      }
    };
    handleUserData();
  },[]);

  return (
    <div className="profile-container">
      <header className="profile-header">
        <img 
          src="https://imgs.search.brave.com/hT1tOqBHh4R8vuiAy0-N5VvWOqwe-WZ9K2a-pgXs0AM/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tb2Nr/bWluZC1hcGkudWlm/YWNlcy5jby9jb250/ZW50L2NhcnRvb24v/MjYuanBn"
          alt="Profile" 
          className="profile-pic" 
        />
        <div className="profile-info">
          <h1>{userData?.user?.name}</h1>
          <p className="profile-bio">{userData?.user?.bio}</p>
          
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-value">{userData?.user?.followers.length}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{userData?.totalLikes}</span>
              <span className="stat-label">Total Likes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{userData?.newsCount}</span>
              <span className="stat-label">Articles</span>
            </div>
          </div>
          <button className="follow-btn">Follow</button>
        </div>
      </header>

      {/* News Feed Section */}
      <h2 className="news-section-title">Latest Articles</h2>
      <div className="news-grid">
        {userData?.userNews.map((news) => (
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
    </div>
  );
};

export default ProfilePage;