import React from "react";
import "./Verify.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Verfication() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  function handleChange(e) {
    const value = e.target.value;
    setCode(value);

    if (value.length === 6) {
      console.log("Verification code entered:", value);
      //TODO: Add verification logic
      navigate("/auth/reset");
    }
  }

  function handleBackArrow() {
    navigate("/auth/forgot");
    console.log("Back arrow clicked");
  }
  function HandleResendButton() {
    console.log("Resend button clicked");
  }


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
            value={code}
            onChange={handleChange}
        />
        <button onClick={HandleResendButton}>Resend Code</button>
        <button className="back-button" onClick={handleBackArrow} >←</button>
        </div>
    </div> 
    </div> /* verification-page */
  );
}