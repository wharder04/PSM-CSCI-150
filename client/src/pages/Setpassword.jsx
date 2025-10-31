import React from "react";
import "./SetPass.css";

export default function SetPassword() {
    return (
    <div className="SetPass-page">
    <div className="Pass-Page">
      <div className="left-side"></div>
      <div className="right-side">
        <h1>Set Password</h1>
        <p>Password requires minimum of 8 characters and contains a capital letter, number and symbol</p>
        <input type="password" placeholder="Enter your password" />
        <button>Continue</button>
        <button className="back-button">←</button>
        </div>
    </div>
    </div>
  );
}