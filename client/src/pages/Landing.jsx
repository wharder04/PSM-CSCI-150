import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();


  return (
    <>
      <h1 className="">Landing Page Here</h1>
      <button onClick={() => navigate("/auth/login")}>Go to Login</button>
    </>
  );
}

export default Landing;
