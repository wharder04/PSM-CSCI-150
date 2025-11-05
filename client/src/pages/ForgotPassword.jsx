import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  function handleResetButton() {
    navigate("/Verify");
  }
  function handleBackArrow() {
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
          <input type="email" placeholder="Enter your email" />
          <button onClick={handleResetButton}>Reset Password</button>
          <button onClick={handlebSignIn}>Back to Sign In</button>
        </div>
      </div>
    </div>
  );
}
