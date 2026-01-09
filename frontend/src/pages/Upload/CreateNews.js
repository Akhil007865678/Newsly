import React, { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import './CreateNews.css';
import Loader from "../../components/Loading/Loader";

const CreateNews = () => {
  const [form, setForm] = useState({ title: "", content: "", category: "" });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", form.title);
    data.append("content", form.content);
    data.append("category", form.category);
    if (image) data.append("image", image);
    setLoading(true);
    try {
      const response = await API.post("/news", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const savedNews = response.data;
      await API.post("/auth/store-vector", {
        _id: savedNews._id,
        title: savedNews.title,
        content: savedNews.content,
        category: savedNews.category,
        author: savedNews.author,
        createdAt: savedNews.createdAt,
      });
      setLoading(false);
      alert("News posted successfully!");
      navigate("/");
    } catch (err) {
      setLoading(false);
      alert("Error uploading news.");
    }
  };
  if (loading) {
    return (
      <div className="form-container">
        <Loader />
      </div>
    );
  }
  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Create News</h2>
        <input name="title" placeholder="Title" onChange={handleChange} required />
        <textarea name="content" placeholder="Content" onChange={handleChange} required />
        <input name="category" placeholder="Category" onChange={handleChange} />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default CreateNews;