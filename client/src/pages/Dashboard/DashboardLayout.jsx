import { Link } from "react-router-dom";
import "../../css/./DashboardLayout.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";

import {
  MdHome,
  MdCheckCircle,
  MdFolder,
  MdSettings,
  MdAdd,
  MdLogout,
} from "react-icons/md";
export default function DashboardLayout({ children }) {
  const navigate = useNavigate();

  const { logout } = useAuth();
  const handleLogout = async (event) => {
    event.preventDefault();
    logout();
    alert("User Logged Out Successfully!");
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <div className="sidebar-icons">
          <Link to="/home">
            <MdHome size={30} />
          </Link>

          <Link to="/auth/forgot">
            <MdCheckCircle size={30} />
          </Link>

          <Link to="/projects">
            <MdFolder size={30} />
          </Link>
          <Link to="/tasks">
            <MdSettings size={30} />
          </Link>

          <div className="sidebar-spacer"></div>

          <Link to="/settings">
            <MdSettings size={30} />
          </Link>

          <div className="sidebar-spacer"></div>
          <button onClick={handleLogout}>
            <MdLogout size={30} />
          </button>
        </div>
      </div>
      <div className="dashboard-content">{children}</div>
    </div>
  );
}
