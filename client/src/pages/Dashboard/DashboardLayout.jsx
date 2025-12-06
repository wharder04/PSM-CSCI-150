import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = async (event) => {
    event.preventDefault();
    logout();
    alert("User Logged Out Successfully!");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen w-full bg-bg-base">
      <aside className="fixed top-0 left-0 w-[220px] h-screen bg-gray-200 z-50 flex flex-col border-r border-gray-300 rounded-xl overflow-y-auto">
        {/* <div className="p-6 border-b border-gray-200">
          <div className="mb-4">
            <div className="w-12 h-12 bg-accent-dark rounded-xl flex items-center justify-center text-white font-bold text-lg tracking-wide">
              PMS
            </div>
          </div>
          <h2 className="text-text-primary text-base font-semibold">Project Management</h2>
        </div> */}

        <nav className="flex-1 p-4 flex flex-col gap-1 mt-32">
          <Link
            to="/home"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative group ${isActive("/home")
              ? "bg-panel-muted text-text-primary font-semibold shadow-soft"
              : "text-text-secondary hover:bg-panel-muted hover:text-text-primary hover:translate-x-1 hover:shadow-soft active:scale-95 active:bg-panel-muted/80"
              } focus:outline-none focus:ring-2 focus:ring-accent-mid focus:ring-offset-2 focus:ring-offset-gray-200`}
          >
            <MdHome
              size={22}
              className={`text-text-primary transition-transform duration-200 ${isActive("/home") ? "" : "group-hover:scale-110"
                }`}
            />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/projects"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative group ${isActive("/projects")
              ? "bg-panel-muted text-text-primary font-semibold shadow-soft"
              : "text-text-secondary hover:bg-panel-muted hover:text-text-primary hover:translate-x-1 hover:shadow-soft active:scale-95 active:bg-panel-muted/80"
              } focus:outline-none focus:ring-2 focus:ring-accent-mid focus:ring-offset-2 focus:ring-offset-gray-200`}
          >
            <MdFolder
              size={22}
              className={`text-text-primary transition-transform duration-200 ${isActive("/projects") ? "" : "group-hover:scale-110"
                }`}
            />
            <span>Projects</span>
          </Link>

          <Link
            to="/tasks"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative group ${isActive("/tasks")
              ? "bg-panel-muted text-text-primary font-semibold shadow-soft"
              : "text-text-secondary hover:bg-panel-muted hover:text-text-primary hover:translate-x-1 hover:shadow-soft active:scale-95 active:bg-panel-muted/80"
              } focus:outline-none focus:ring-2 focus:ring-accent-mid focus:ring-offset-2 focus:ring-offset-gray-200`}
          >
            <MdCheckCircle
              size={22}
              className={`text-text-primary transition-transform duration-200 ${isActive("/tasks") ? "" : "group-hover:scale-110"
                }`}
            />
            <span>Tasks</span>
          </Link>

          {/* Large white rounded box placeholder */}
          <div className="mt-4 mb-4 h-32"></div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-4">
            <p className="text-text-primary text-sm">
              {user?.email || "user@example.com"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative group ${isActive("/settings")
                ? "bg-panel-muted text-text-primary font-semibold shadow-soft"
                : "text-text-secondary hover:bg-panel-muted hover:text-text-primary hover:translate-x-1 hover:shadow-soft active:scale-95 active:bg-panel-muted/80"
                } focus:outline-none focus:ring-2 focus:ring-accent-mid focus:ring-offset-2 focus:ring-offset-gray-200`}
            >
              <MdSettings
                size={20}
                className={`text-text-primary transition-transform duration-200 ${isActive("/settings") ? "" : "group-hover:scale-110"
                  }`}
              />
              <span>Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:bg-panel-muted hover:text-text-primary hover:translate-x-1 hover:shadow-soft active:scale-95 active:bg-panel-muted/80 transition-all duration-200 w-full text-left group focus:outline-none focus:ring-2 focus:ring-accent-mid focus:ring-offset-2 focus:ring-offset-gray-200 cursor-pointer"
            >
              <MdLogout
                size={20}
                className="text-text-primary transition-transform duration-200 group-hover:scale-110"
              />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-[220px] w-[calc(100%-220px)] min-h-screen bg-bg-base overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
