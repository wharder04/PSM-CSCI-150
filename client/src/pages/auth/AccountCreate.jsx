import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services/api";

function AccountCreate() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    const obj = {
      fname: fname,
      lname: lname,
      email: email,
      password: password,
    };

    const data = await authService.register(obj);
    if (data.success) {
      alert("User Registration Succesfull");
      navigate("auth/login");
    } else {
      alert("Something Went Wrong");
    }
  };

  return (
    <form onSubmit={handleRegister} className="w-full h-screen flex">
      <div className="bg-gray-300 w-1/2 h-full"></div>
      <div className="w-1/2 h-full flex flex-col justify-center items-center bg-gray-800">
        <p className="text-5xl font-medium mb-4">Create Account</p>
        <p className="text-lg font-medium mb-8">
          Enter your details to create account
        </p>
        <div className="w-[40%] flex flex-col mb-8 text-white">
          <label>First name:</label>
          <input
            type="text"
            id="fname"
            name="fname"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-700"
            required
          />
        </div>

        <div className="w-[40%] flex flex-col mb-8 text-white">
          <label>Last name:</label>
          <input
            type="text"
            id="lname"
            name="lname"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-700"
            required
          />
        </div>
        <div className="w-[40%] flex flex-col mb-8 text-white">
          <label>Email:</label>
          <input
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-700"
            required
          />
        </div>
        <div className="w-[40%] flex flex-col mb-8 text-white">
          <label>Password:</label>
          <input
            type="text"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-700"
            required
          />
        </div>

        <div className="flex gap-4 items-center mb-4">
          <button type="signup">Sign up</button>
          <p>or</p>
          <button>Google</button>
        </div>

        <p>Already have an account?</p>
        <Link to="/auth/login">Login here</Link>
      </div>
    </form>
  );
}

export default AccountCreate;
