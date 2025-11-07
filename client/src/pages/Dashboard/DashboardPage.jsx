import { useState } from "react";
import "../../css/DashboardPage.css";
import DashboardLayout from "./DashboardLayout";

function Dashboard() {
  const [name, setName] = useState("");
  const [projects, setProjects] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);

  return (
    <DashboardLayout>
      <div className="dashboardPage">
        <div className="topHalf">
          <h2>My Dashboard</h2>
          <div className="dashboardMessage">
            <p>Good Morning</p>
          </div>
        </div>
        <div className="bottomHalf">
          <div className="leftSide">
            <h2>Your Projects</h2>
            <p>Here's an overview of your group projects</p>
          </div>
          <div className="rightSide"></div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
