import React, { useState, useEffect } from "react";
import "../../css/SetPass.css";
import { useNavigate, useParams } from "react-router-dom";
import { authService } from "../../../services/api";
import { toast } from "react-toastify";

export default function SetPassword() {
  const navigate = useNavigate();
  const { resetToken } = useParams();
  const [password, setPassword] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        await authService.verifyToken(resetToken);
      } catch (error) {
        toast.error("Invalid or expired token");
        navigate("/auth/forgot");
      }
    };
    verify();
  }, [resetToken, navigate]);

  function handleBackArrow() {
    navigate("/auth/login");
    console.log("Back arrow clicked");
  }
  async function continueClicked() {
    try {
      if(password.length < 8) {
          toast.error("Password must be at least 8 characters long");
          return;
      }
      await authService.resetPassword(resetToken, password);
      toast.success("Password reset successful");
      navigate("/auth/login");
      console.log("Continue clicked");
    } catch (error) {
      toast.error(error.response?.data?.error || "Something went wrong");
    }
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
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={continueClicked} className="cursor-pointer">
            Continue
          </button>
          <button
            className="back-button cursor-pointer"
            onClick={handleBackArrow}
          >
            ←
          </button>
        </div>
      </div>
    </div>
  );
}
