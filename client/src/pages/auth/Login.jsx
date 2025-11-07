import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await authService.login(email, password);
      // console.log(data);
      if (data.success) {
        alert(data.user.name + " LoggedIn Succesfully");
        navigate("/home"); // Redirect to dashboard
        return;
      } else {
        alert("Invalid Credentials");
      }
    } catch (error) {
      console.log("Login page Error: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full h-screen flex">
      <div className="bg-gray-300 w-1/2 h-full"></div>
      <div className="w-1/2 h-full flex flex-col justify-center items-center bg-gray-800">
        <p className="text-5xl font-medium mb-4">Welcome Back</p>
        <p className="text-lg font-medium mb-8">Login in to your account</p>
        <div className="w-[40%] flex flex-col mb-8 text-white">
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
        <div className="w-[40%] flex flex-col mb-8 text-white">
          <label className="font-medium">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-700"
          />
        </div>
        <br />
        <button type="submit">Sign in</button>
        <p>
          <Link to="/auth/forgot"> Forgot Password </Link>
        </p>
        <p>
          Don't have an account? <Link to="/auth/register">Sign up</Link>
        </p>
      </div>
    </form>
  );
}

export default Login;
