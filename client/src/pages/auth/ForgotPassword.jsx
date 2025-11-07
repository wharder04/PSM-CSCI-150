import "../../css/ForgotPassword.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  function handleResetButton() {
    if (email.trim() !== "") {
      console.log("Reset password for email:", email);
      navigate("/auth/verify");
    } else {
      console.log("Please enter a valid email address.");
      return;
    }
  }
  function handleBackArrow() {
    navigate("/auth/login");
    console.log("Back arrow clicked");
  }
  function handlebSignIn() {
    navigate("/auth/login");
    console.log("Back to Sign In clicked");
  }

  return (
    <div className="forgot-page">
      <div className="forgot">
        <div className="left-side"></div>
        <div className="right-side">
          <button className="back-button" onClick={handleBackArrow}>
            ←
          </button>
          <h1>
            Forgot
            <br />
            Your Password?
          </h1>
          <p> Email</p>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleResetButton}>Reset Password</button>
          <button onClick={handlebSignIn}>Back to Sign In</button>
        </div>
      </div>
    </div>
  );
}
