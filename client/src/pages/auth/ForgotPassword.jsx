import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "../../../services/api";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  async function handleResetButton(event) {
    event.preventDefault();
    if (email.trim() !== "") {
      try {
        const res = await authService.forgotPassword(email);
        if(res.success){
          toast.success("Email sent check your inbox");
          navigate("/auth/login");
        }else {
          toast.error(res.error);
        }
      } catch (error) {
        toast.error(error.response.data.error || "Something went wrong");
      }
    } else {
      toast.error("Please enter a valid email address.");
      return;
    }
  }

  return (
    <form onSubmit={handleResetButton} className="w-full h-screen flex">
      <div className="bg-gray-300 w-1/2 h-full"></div>
      <div className="w-1/2 h-full flex justify-center items-center bg-gray-400 text-black">
        <div className="w-[40%] flex flex-col justify-center items-center">
          <div className="w-full">
            <p className="text-5xl font-medium mb-2 text-left">Forgot</p>
            <p className="text-5xl font-medium mb-10 text-left">
              Your Password?
            </p>
          </div>
          <div className="w-full flex flex-col mb-8">
            <label className="font-medium"> Email</label>
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
            <button type="submit" className="bg-black text-white px-4 py-2 rounded-xl mb-4 cursor-pointer" >Reset Password</button>
            <p>
              <Link to="/auth/login" className="text-blue-500 hover:text-blue-600 hover:underline"> Back to Sign In </Link>
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
