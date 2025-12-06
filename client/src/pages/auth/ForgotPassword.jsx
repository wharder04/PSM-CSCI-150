import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  function handleResetButton(event) {
    event.preventDefault();
    if (email.trim() !== "") {
      alert("Reset password for email:", email);
      navigate("/auth/verify");
    } else {
      alert("Please enter a valid email address.");
      return;
    }
  }

  return (
    <form onSubmit={handleResetButton} className="w-full h-screen flex">
      <div className="bg-gray-300 w-1/2 "></div>
      <div className="w-1/2 flex justify-center items-center bg-gray-800">
        <div className="w-[40%] flex flex-col justify-center items-center">
          <div className="w-full">
            <p className="text-5xl font-medium mb-2 text-left">Forgot</p>
            <p className="text-5xl font-medium mb-10 text-left">
              Your Password?
            </p>
          </div>
          <div className="w-full flex flex-col mb-8 text-white">
            <label> Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl bg-gray-700"
              required
            />
          </div>
          <div className="flex flex-col gap-4 items-center mt-7">
            <button type="submit" className="cursor-pointer">Reset Password</button>
            <p>
              <Link to="/auth/login"> Back to Sign In </Link>
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
