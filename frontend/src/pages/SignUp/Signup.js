import React, { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loading/Loader";
import './Signup.css';

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSignupRedirect = () => {
    navigate("/login");
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      setLoading(false);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      setLoading(false);
      alert(err.response.data.message);
    }
  };
  if (loading) {
    return (
      <div className="loader">
        <Loader />
      </div>
    );
  }
  return (
    <div className="auth-container">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input className="input-data" name="name" placeholder="Name" onChange={handleChange} required />
        <input className="input-data" name="email" placeholder="Email" onChange={handleChange} required />
        <input className="input-data" type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Signup</button>
        <div className="auth-footer-link">
          <p>If you have an account <span onClick={handleSignupRedirect}>Login</span></p>
        </div>
      </form>
    </div>
  );
};

export default Signup;