import React, { useState, useEffect } from "react";
import API from "../../api"; // your axios instance
import './NewsPopup.css';
import { getToken } from "../../utils/auth";

const NewsPopup = ({ news, onClose }) => {
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [likeCount, setLikeCount] = useState(news.likes?.length || 0);
  //const [subscriberCount, setSubscriberCount] = useState(news.subscribers?.length || 0);
  const [authorName, setAuthorName] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  
  const token=getToken();
  // Fetch comments
  useEffect(() => {
    //console.log("data3: ",news.author);
    const fetchComments = async () => {
      try {
        const res = await API.get(`/comments/${news._id}`);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComments();
  }, [news._id]);

  useEffect(() => {
    const IsFollow = async () => {
      try{
        await API.post(`/auth/${news._id}/isfollow`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSubscribed(true);
      }
      catch(error){
        console.log("Problem occurred in handle Follow function: ", error);
      }
    };
    IsFollow();
  },[]);

  //fetching author name of a news
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const authorId = typeof news.author === "object" ? news.author._id : news.author;
        const res = await API.get(`/news/${authorId}`);
        //console.log("data2: ", res.data);
        setAuthorName(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAuthor();
  }, [news.author]);

  // Post comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await API.post(`/comments/${news._id}`, { text: newComment });
      setComments([res.data, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    try{
      await API.post(`/news/${news._id}/like`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    }
    catch(error){
      console.log("Problem occurred in handlelike function: ", error);
    }
  };

  const toggleFollow = async () => {
    try{
      await API.post(`/auth/${news._id}/follow`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSubscribed(true);
    }
    catch(error){
      console.log("Problem occurred in handle Follow function: ", error);
    }
  };

  return (
    <div className="news-popup-overlay" onClick={onClose}>
      <div className="news-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>{news.title}</h2>
        {news.imageUrl && <img src={news.imageUrl} alt={news.title} />}
        <p>{news.content}</p>

        <p>
          <strong>Author:</strong> {authorName?.name || "Unknown"}
        </p>

        {/* Like & Subscribe Buttons */}
        <div className="modal-actions">
          <button className={`like-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
            {liked ? "❤️ Liked" : "🤍 Like"} <span className="count">{likeCount}</span>
          </button>

          <button className={`subscribe-btn ${subscribed ? "subscribed" : ""}`} onClick={toggleFollow}>
            {subscribed ? "✓ Subscribed" : "+ Subscribe"} <span className="count"></span>
          </button>
        </div>

        {/* ================= Comments Section ================= */}
        <div className="comments-section">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit">Post</button>
          </form>

          <div className="comments-list">
            {comments.map((c) => (
              <div key={c._id} className="comment-item">
                <strong>{c.userId.name}:</strong> {c.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPopup;
