import { useState } from "react";
import tasksData from "../../data/tasks.json";
import { MdAdd } from "react-icons/md";



function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const unAssignedTasks = tasks.filter(task => task.assignedTo.trim() === "");
  const assignedTasks = tasks.filter(task => task.assignedTo.trim() !== "");
  const inProgressTasks = tasks.filter(task => task.status === "In Progress");
  const completedTasks = tasks.filter(task => task.status === "Completed");
  const incompleteTasks = tasks.filter(task => task.status === "Incomplete");

  useEffect(() => {
    setTasks(tasksData);
  })

  return (
    <div className="flex w-full min-h-screen p-8 bg-gray-100 text-black">
      <div className="w-1/3 h-full p-8 flex flex-col">
        <h2 className="text-4xl font-bold text-black mb-6">Task Board</h2>
        <p className="text-2xl text-black font-semibold mb-6">
          Drag tasks to update their status
        </p>
        <button className="bg-gray-800 text-white font-sans rounded w-24 h-10 mb-4">
          Filters
        </button>
        <button className="bg-gray-300 text-black font-sans rounded w-24 h-10 mb-8">
          + Create New Task
        </button>
      </div>
      <div className="w-2/3 h-full flex flex-row gap-6 p-6">
        <div className="flex flex-col items-center border-2 border-black w-40 h-[32rem] rounded p-3 bg-white">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans bg-white">
            <p>Unassigned</p>
            <button className="w-7 h-7 flex items-center justify-center text-black bg-white">
              +
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
          <div className="flex flex-wrap gap-4">
            {unAssignedTasks.map(task => (
              <div className="relative w-full h-full bg-white rounded p-3" key={task.id}>
                <div className="w-14 h-10 absolute top-2 right-2 text-base text-black font-semibold rounded bg-gray-200">{task.priority}</div>
                <p className="absolute inset-0 flex items-center justify-center text-black text-lg font-bold">{task.name}</p>
                <div className="absolute bottom-2 left-2 text-base text-black">Due: {task.dueDate}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-40 h-[32rem] rounded p-3 bg-white">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans bg-white">
            <p>Assigned</p>
            <button className="w-7 h-7 flex items-center justify-center text-black bg-white">
              +
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
          <div className="flex flex-wrap gap-4">
            {assignedTasks.map(task => (
              <div className="relative w-full h-full bg-white rounded p-3" key={task.id}>
                <div className="w-14 h-10 absolute top-2 right-2 text-base text-black font-semibold rounded bg-gray-200">{task.priority}</div>
                <p className="absolute inset-0 flex items-center justify-center text-black text-lg font-bold">{task.name}</p>
                <div className="absolute bottom-2 left-2 text-base text-black">Due: {task.dueDate}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-40 h-[32rem] rounded p-3 bg-white">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans bg-white">
            <p>In Progress</p>
            <button className="w-7 h-7 flex items-center justify-center text-black bg-white">
              +
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
          <div className="flex flex-wrap gap-4">
            {inProgressTasks.map(task => (
              <div className="relative w-full h-full bg-white rounded p-3" key={task.id}>
                <div className="w-14 h-10 absolute top-2 right-2 text-base text-black font-semibold rounded bg-gray-200">{task.priority}</div>
                <p className="absolute inset-0 flex items-center justify-center text-black text-lg font-bold">{task.name}</p>
                <div className="absolute bottom-2 left-2 text-base text-black">Due: {task.dueDate}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-40 h-[32rem] rounded p-3 bg-white">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans bg-white">
            <p>Completed</p>
            <button className="w-7 h-7 flex items-center justify-center text-black bg-white">
              +
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
          <div className="flex flex-wrap gap-4">
            {completedTasks.map(task => (
              <div className="relative w-full h-full bg-white rounded p-3" key={task.id}>
                <div className="w-14 h-10 absolute top-2 right-2 text-base text-black font-semibold rounded bg-gray-200">{task.priority}</div>
                <p className="absolute inset-0 flex items-center justify-center text-black text-lg font-bold">{task.name}</p>
                <div className="absolute bottom-2 left-2 text-base text-black">Due: {task.dueDate}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-40 h-32[rem] rounded p-3 bg-white">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans bg-white">
            <p>Incomplete</p>
            <button className="w-7 h-7 flex items-center justify-center text-black bg-white">
              +
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
          <div className="flex flex-wrap gap-4">
            {incompleteTasks.map(task => (
              <div className="relative w-full h-full bg-white rounded p-3" key={task.id}>
                <div className="w-14 h-10 absolute top-2 right-2 text-base text-black font-semibold rounded bg-gray-200">{task.priority}</div>
                <p className="absolute inset-0 flex items-center justify-center text-black text-lg font-bold">{task.name}</p>
                <div className="absolute bottom-2 left-2 text-base text-black">Due: {task.dueDate}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskBoard;
