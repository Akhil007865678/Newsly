import React, { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import './Login.css';
import Loader from "../../components/Loading/Loader";
import { toast } from "react-toastify";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setLoading(false);
      navigate("/");
    } catch (err) {
      toast.error(err.response.data.message);
      setLoading(false);
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
      <h2 className="login-heading">Login</h2>
      <form onSubmit={handleSubmit}>
        <input className="input-data" name="email" placeholder="Email" onChange={handleChange} required />
        <input className="input-data" type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
        <div className="auth-footer-link">
          <p>If you don't have any account <span onClick={handleSignupRedirect}>Signup</span></p>
        </div>
      </form>
    </div>
  );
};

export default Login;