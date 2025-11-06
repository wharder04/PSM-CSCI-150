import { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginAndCreate.css";
import { authService } from "../../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = await authService.login(email, password);
    console.log(data);
    if (data.success) {
      alert(data.user.name + " LoggedIn Succesfully");
      return;
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <>
      <div className="loginPage">
        <form onSubmit={handleSubmit} className="login">
          <div className="leftSide"></div>
          <div className="rightSide">
            <h2>Welcome Back</h2>
            <h3>Login in to your account</h3>
            <div className="input-field">
              <label for="email">Email:</label>
              <input
                type="text"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label for="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
      </div>
    </>
  );
}

export default Login;
