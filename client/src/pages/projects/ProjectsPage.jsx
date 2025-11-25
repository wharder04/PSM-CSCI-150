import projectData from "../../data/projects.json";

// Component for individual project cards
function ProjectCard({
  name,
  className,
  dueDate,
  status,
  progress,
  remainingTasks,
}) {
  // calculations for effective progress, in case of finished project
  const tasks = Number(remainingTasks ?? 0);
  const allTasksDone = tasks === 0;

  const percent = Number(progress);
  const effectiveProgress = Number.isNaN(percent)
    ? (allTasksDone ? 100 : 0)
    : percent;

  return (
    // Outer card container
    <div className="w-[320px] bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-[rgb(194,189,189)] px-5 pt-5 pb-4">
        <h3 className="text-xl font-semibold text-black leading-snug">
          {name}
        </h3>
        <p className="mt-1 text-xs text-gray-700 italic">
          {className}
        </p>
      </div>

      {/* BOTTOM SECTION */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between text-xs text-gray-700">
          <span>
            {allTasksDone
              ? "All Tasks Completed"
              : `${tasks} Incomplete Tasks`}
          </span>

          <span className="flex items-center gap-1">
            <span className="text-[11px]"></span>
            <span>{dueDate}</span>
          </span>
        </div>

        {/* progress bar */}
        <div className="mt-4 h-2 w-full rounded-full bg-gray-300">
          <div
            className="h-full rounded-full bg-gray-600"
            style={{ width: `${effectiveProgress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-gray-700">
          Completed: <span className="font-semibold">{effectiveProgress}%</span>
        </p>
      </div>
    </div>
  );
}

//Projects page ui
export default function ProjectsPage() {
  let name = "PSM Group";

  console.log("projectData =", projectData);

  return (
    <div className="min-h-screen w-full bg-white">
      <h1 className="mt-10 ml-10 text-xl! font-semibold text-black">
        Hello {name}!
        </h1>
      <div className="relative w-[90%] mx-10 mt-4">
        <input
        type="search"
        placeholder="Search Projects..."
        className="w-full rounded-lg border border-gray-300 bg-gray-100
        px-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent "
        />
      </div>

      <h2 className="mt-2.5 ml-10 text-[28px] text-black">
        My Projects
        </h2>

      <div className="mt-4 ml-10 flex gap-3">
        <button className="rounded-lg bg-white px-4 py-2 text-black cursor-pointer">
          All
        </button>
        <button className="rounded-lg bg-white px-4 py-2 text-black cursor-pointer">
          Active
          </button>
        <button className="rounded-lg bg-white px-4 py-2 text-black cursor-pointer">
          Completed
          </button>
      </div>

      <div className="mt-8 ml-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectData.slice(0, 2).map((project) => (
          <ProjectCard
            key={project.id}
            name={project.name}
            className={project.className}
            dueDate={project.dueDate}
            status={project.status}
            progress={project.progress}
            remainingTasks={project.remainingTasks}
          />
        ))}
      </div>


      <div className="fixed bottom-10 right-10 z-50">
        <button className="bg-[rgb(194,189,189)] text-black px-6 py-2 rounded-full shadow-md hover:bg-gray-800">
          Create New +
        </button>
      </div>
    </div>
  );
}

