import "../../css/Projects-Page.css";
import DashboardLayout from "../dashboard/DashboardLayout.jsx";


export default function ProjectsPage() {
  let name = "PSM Group";
  return (
    <DashboardLayout>
      <div className="projects-page">
        <h1>Hello {name}!</h1>
        <input className="project-search-bar" type="search" placeholder="Search Projects..." />
        <h2 className="myProjects">My Projects</h2>
        <div className="project-filters">
          <button>All</button>
          <button>Active</button>
          <button>Completed</button>
        </div>
      </div>
    </DashboardLayout>
  );
}

