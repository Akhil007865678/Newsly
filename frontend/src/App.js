import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login/Login";
import Signup from "./pages/SignUp/Signup";
import Home from "./pages/Home/Home";
import CreateNews from "./pages/Upload/CreateNews";
import Navbar from "./components/Navbar/Navbar";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import Newslybot from "./pages/NewslyBot/Newslybot";
import Search from "./pages/Search/Search";

function AppContent() {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/signup", "/newsly"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/newsly" element={<Newslybot/>} />
        <Route path="/search/:query" element={<Search/>} />
        <Route
          path="/upload"
          element={token ? <CreateNews /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;