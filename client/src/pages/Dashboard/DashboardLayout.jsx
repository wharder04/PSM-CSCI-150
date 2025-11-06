import "./DashboardLayout.css";
import { MdHome, MdCheckCircle, MdFolder, MdSettings, MdAdd, MdLogout } from "react-icons/md";
export default function DashboardLayout({ children }) {
    return (
        <div className="dashboard-layout">
            <div className="dashboard-sidebar">
                <div className="sidebar-icons"> 
                    <MdHome size={30} />
                    <MdCheckCircle size={30} />
                    <MdFolder size={30} />

                    <div className="sidebar-spacer"></div>

                        <MdSettings size={30} />

                    <div className="sidebar-spacer"></div>

                        <MdAdd size={30} />
                        <MdLogout size={30} />
                </div>
            </div>
            <div className="dashboard-content">{children}</div>
        </div>
    );
}