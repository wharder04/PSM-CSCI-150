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
      navigate("/auth/login");
    } else {
      alert("Something Went Wrong");
    }
  };

  return (
    <form onSubmit={handleRegister} className="w-full h-screen flex">
      <div className="bg-gray-300 w-1/2 h-full"></div>
      <div className="w-1/2 h-full flex flex-col justify-center items-center bg-gray-400 text-black">
        <p className="text-5xl font-medium mb-4">Create Account</p>
        <p className="text-lg font-medium mb-8">
          Enter your details to create account
        </p>
        <div className="w-[40%] flex flex-col mb-8">
          <label className="font-medium">First name:</label>
          <input
            type="text"
            id="fname"
            name="fname"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-100"
            required
          />
        </div>

        <div className="w-[40%] flex flex-col mb-8">
          <label className="font-medium">Last name:</label>
          <input
            type="text"
            id="lname"
            name="lname"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white"
            required
          />
        </div>

        <div className="w-[40%] flex flex-col mb-8">
          <label className="font-medium">Email:</label>
          <input
            type=""
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white"
            required
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
            className="px-4 py-3 rounded-xl bg-white"
            required
          />
        </div>
        <br />
        <button
          className="bg-black text-white px-4 py-2 rounded-xl mb-4 cursor-pointer"
          type="submit"
        >
          Sign up
        </button>
        <p>
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-blue-500 hover:text-blue-600 hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </form>
  );
}

export default AccountCreate;
