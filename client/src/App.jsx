import { Routes, Route, Link, useNavigate } from "react-router-dom";
import SetPassword from "./pages/auth/Setpassword.jsx";
import Verfication from "./pages/auth/Verification.jsx";
import Login from "./pages/auth/Login.jsx";
import Landing from "./pages/auth/Landing.jsx";
import AccountCreate from "./pages/auth/AccountCreate.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ProjectsPage from "./pages/projects/ProjectsPage.jsx";
import Dashboard from "./pages/dashboard/DashboardPage.jsx";

export default function App() {
  return (
    <div className="w-full">
      <Routes>
        <Route path="/" element={<Landing />}></Route>
        <Route path="/auth/login" element={<Login />}></Route>
        <Route path="/auth/register" element={<AccountCreate />}></Route>
        <Route path="/auth/forgot" element={<ForgotPassword />} />
        <Route path="/auth/verify" element={<Verfication />} />
        <Route path="/auth/reset" element={<SetPassword />} />

        <Route path="/home" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </div>
  );
}
