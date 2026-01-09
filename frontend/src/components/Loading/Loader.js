import React from "react";
import "./Loader.css"; // make sure this path matches your project structure

const Loader = () => {
  return (
    <div className="content">
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
    </div>
  );
};

export default Loader;
