

export default function ProjectsPage() {
  let name = "PSM Group";

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
    </div>
  );
}

