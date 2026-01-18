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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState("en");
  const [translatedTitle, setTranslatedTitle] = useState(news.title);
  const [translatedContent, setTranslatedContent] = useState(news.content);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  
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
        const res = await API.post(`/auth/${news._id}/isfollow`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSubscribed(res.data.following);
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
        const res = await API.get(`/news/author/${authorId}`);
        console.log(":dataaa:", res);
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

  const handleSpeak = () => {
    if (!translatedContent) return;

    const textToRead = `${translatedTitle}. ${translatedContent}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Language handling
    if (language === "hi") {
      utterance.lang = "hi-IN";
    } else if (language === "ta") {
      utterance.lang = "ta-IN";
    } else if (language === "te") {
      utterance.lang = "te-IN";
    } else if (language === "fr") {
      utterance.lang = "fr-FR";
    } else {
      utterance.lang = "en-IN";
    }

    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const translateText = async (text, targetLang) => {
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      return data[0].map((item) => item[0]).join("");
    } catch (err) {
      console.error("Translation error:", err);
      return text;
    }
  };

  useEffect(() => {
    const translateNews = async () => {
      if (language === "en") {
        setTranslatedTitle(news.title);
        setTranslatedContent(news.content);
        return;
      }

      setLoadingTranslation(true);

      const [tTitle, tContent] = await Promise.all([
        translateText(news.title, language),
        translateText(news.content, language),
      ]);

      setTranslatedTitle(tTitle);
      setTranslatedContent(tContent);
      setLoadingTranslation(false);
    };

    translateNews();
  }, [language, news.title, news.content]);


  return (
    <div className="news-popup-overlay" onClick={onClose}>
      <div className="news-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>{loadingTranslation ? "Translating..." : translatedTitle}</h2>
        {news.imageUrl && <img src={news.imageUrl} alt={news.title} />}
        <p>{loadingTranslation ? "Translating..." : translatedContent}</p>

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

          <div className="tts-actions">
            <select
              className="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="fr">French</option>
            </select>

            {!isSpeaking ? (
              <button className="tts-btn" onClick={handleSpeak}>
                🔊 Listen
              </button>
            ) : (
              <button className="tts-btn stop" onClick={handleStop}>
                ⏹ Stop
              </button>
            )}
            
          </div>

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
