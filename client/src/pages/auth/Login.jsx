import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await authService.login(email, password);
      if (data.success) {
        login(data.user); // Store user data (token is in httpOnly cookie)
        toast.success("LoggedIn as " + data.user.name);
        navigate("/home"); // Redirect to dashboard
      } else {
        toast.error(data.message || "Login failed");
      }
      return;
    } catch (error) {
      console.log("Login page Error: ", error);
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full h-screen flex">
      <div className="bg-gray-300 w-1/2 h-full"></div>
      <div className="w-1/2 h-full flex flex-col justify-center items-center bg-gray-400 text-black">
        <p className="text-5xl font-medium mb-4">Welcome Back</p>
        <p className="text-lg font-medium mb-8">Login in to your account</p>
        <div className="w-[40%] flex flex-col mb-8 ">
          <label className="font-medium">Email:</label>
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-700"
          />
        </div>
        <div className="w-[40%] flex flex-col mb-8">
          <label className="font-medium">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-700"
          />
          <div className="flex justify-end mt-2">
            <Link
              to="/auth/forgot"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
        <br />
        <button
          className="bg-black text-white px-4 py-2 rounded-xl mb-4 cursor-pointer"
          type="submit"
        >
          Sign in
        </button>
        {/* <Link to="/auth/forgot" className="text-blue-500 hover:text-blue-600 hover:underline"> Forgot Password </Link> */}
        <p>
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="text-blue-500 hover:text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
}

export default Login;
