import React from "react";
import "./App.css";

export default function ForgotPassword() {

function handleResetButton() {
  console.log("Reset Password button clicked");
}

  return (
    <div className="forgot-page">
      <div className="forgot">
      <div className="left-side"></div>
      <div className="right-side">
        <button className="back-button">←</button>
        <h1>Forgot<br />
        Your Password?</h1>
        <p> Email</p>
        <input type="email" placeholder="Enter your email" />
        <button onClick={handleResetButton}>Reset Password</button>
        <button>Back to Sign In</button>
        </div>
      </div>
    </div>
  );
}