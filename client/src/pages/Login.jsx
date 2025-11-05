import { useState } from "react";
import { Link } from "react-router-dom";
import './LoginAndCreate.css';

function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleUserName = (e) => {
    setUserName(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  return (
    <>
      <div className="loginPage">
        <div className="login">
          <div id="leftSide"></div>
          <div id="rightSide">
            <h2>Welcome Back</h2>
            <h3>Login in to your account</h3>
            <label for="username">Username:</label>
            <br />
            <input type="text" id="username" name="username" />
            <br />
            <label for="password">Password:</label>
            <br />
            <input type="text" id="password" name="password" />
            <br />
            <button type="submit">Sign in</button>
            <p>
              <Link to="/auth/forgot"> Forgot Password </Link>
            </p>
            <p>
              Don't have an account? <Link to="/auth/register">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
