import { useState } from 'react'
import { Link } from "react-router-dom";
import './App.css'

function Login() {
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")

  const handleUserName = (e) => {
    setUserName(e.target.value)
  };

  const handlePassword = (e) => {
    setPassword(e.target.value)
  };


  return (
    <>
      <div className="login">
        <div id="leftSide"></div>
        <div id="rightSide">
          <h2>Welcome Back</h2>
          <h3>Login in to your account</h3>
          <label for="username">Username:</label><br/>
          <input type="text" id="username" name="username" /><br/>
          <label for="password">Password:</label><br/>
          <input type="text" id="password" name="password" /><br/>
          <button type ="submit">Sign in</button>
          <p><a href ="#">Forgot Password?</a></p>
          <p>Don't have an account?{" "}<Link to="/create-account">Sign up</Link></p>
        </div>
      </div>
    </>
  )
}

export default Login
