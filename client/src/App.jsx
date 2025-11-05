import { Routes, Route, Link, useNavigate } from "react-router-dom";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import SetPassword from "./pages/Setpassword.jsx";
import Verfication from "./pages/Verification.jsx";
import Login from "./pages/Login.jsx";
import Landing from "./pages/Landing.jsx";
import AccountCreate from "./pages/AccountCreate.jsx";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />}></Route>
        <Route path="/auth/login" element={<Login />}></Route>
        <Route path="/auth/register" element={<AccountCreate />}></Route>
        <Route path="/auth/forgot" element={<ForgotPassword />} />
        <Route path="/auth/verify" element={<Verfication />} />
        <Route path="/auth/reset" element={<SetPassword />} />
      </Routes>
    </div>
  );
}
