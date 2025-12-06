import React from "react";
import "../../css/SetPass.css";
import { useNavigate } from "react-router-dom";

export default function SetPassword() {
  const navigate = useNavigate();
  function handleBackArrow() {
    navigate("/auth/login");
    console.log("Back arrow clicked");
  }
  function continueClicked() {
    navigate("/auth/login");
    console.log("Continue clicked");
  }

  return (
    <div className="SetPass-page">
      <div className="Pass-Page">
        <div className="left-side"></div>
        <div className="right-side">
          <h1>Set Password</h1>
          <p>
            Password requires minimum of 8 characters and contains a capital
            letter, number and symbol
          </p>
          <input type="password" placeholder="Enter your password" />
          <button onClick={continueClicked} className="cursor-pointer">Continue</button>
          <button className="back-button cursor-pointer" onClick={handleBackArrow}>
            ←
          </button>
        </div>
      </div>
    </div>
  );
}
