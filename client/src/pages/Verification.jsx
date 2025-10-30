import React from "react";
import "./Verify.css";

export default function Verfication() {
    return (
    <div className="verification-page">
    <div className="verify-page">
      <div className="left-side"></div>
      <div className="right-side">
        <h1>Enter <br /> Verfication Code</h1>
        <p>Verfication Code Has been sent to your email </p>
        <input
            type ="text"
            maxLength = {6}
            pattern = "\d*"
            inputMode="numeric"
            placeholder="Enter 6-digit code"
        />
        <button>Send Code</button>
        <button className="back-button">←</button>
        </div>
    </div> 
    </div> /* verification-page */
  );
}