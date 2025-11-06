import "./DashboardLayout.css";
export default function DashboardLayout({ children }) {
    return (
        <div className="dashboard-layout">
            <div className="dashboard-sidebar"> </div>
            <div className="dashboard-content">{children}</div>
        </div>
    );
}