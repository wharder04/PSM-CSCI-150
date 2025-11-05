import { useState } from "react";
import { Link } from "react-router-dom";
import './LoginAndCreate.css';

function AccountCreate() {
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
      <div className ="createAccountPage">
        <div className="createAccount">
          <div id="leftSide">
            <h2>Let's Get Started</h2>
          </div>
          <div id="rightSide">
            <h2>Create Account</h2>
            <p>Enter your details to create account</p>
            <label for="fname">First name:</label>
            <br />
            <input type="text" id="fname" name="fname" />
            <br />
            <label for="lname">Last name:</label>
            <br />
            <input type="text" id="lname" name="lname" />
            <br />
            <label for="email">Email:</label>
            <br />
            <input type="text" id="email" name="email" />
            <br />
            <label for="password">Password:</label>
            <br />
            <input type="text" id="password" name="password" />
            <br />
            <button type="signup">Sign up</button>
            <p>or</p>
            <br />
            <button>Google</button>
            <p>Already have an account?</p>
            <Link to="/auth/login">Login here</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountCreate;
