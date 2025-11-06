import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginAndCreate.css";
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
      navigate("/login");
    } else {
      alert("Something Went Wrong");
    }
  };

  return (
    <>
      <div className="createAccountPage">
        <div className="createAccount">
          <div className="leftSide">
            <h2>Let's Get Started</h2>
          </div>
          <form onSubmit={handleRegister} className="rightSide">
            <h2>Create Account</h2>
            <p>Enter your details to create account</p>
            <div className="input-field">
              <label for="fname">First name:</label>
              <input
                type="text"
                id="fname"
                name="fname"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />
            </div>

            <div className="input-field">
              <label for="lname">Last name:</label>
              <input
                type="text"
                id="lname"
                name="lname"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
              />
            </div>
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
                type="text"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="buttons-section">
              <button type="signup">Sign up</button>
              <p>or</p>
              <br />
              <button>Google</button>
            </div>

            <p>Already have an account?</p>
            <Link to="/auth/login">Login here</Link>
          </form>
        </div>
      </div>
    </>
  );
}

export default AccountCreate;
