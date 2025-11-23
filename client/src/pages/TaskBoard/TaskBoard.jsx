import { useState } from "react";
import { MdAdd } from "react-icons/md";

function TaskBoard() {
  const [unAssignedTasks, setUnassignedTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [incompleteTasks, setIncompleteTasks] = useState([]);

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
        <div className="flex flex-col items-center border-2 border-black w-40 h-[32rem] rounded p-3">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans">
            <p>Unassigned</p>
            <button className="w-7 h-7 flex items-center justify-center text-black">
              +
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-40 h-[32rem] rounded p-3">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans">
            <p>Assigned</p>
            <button className="w-7 h-7 flex items-center justify-center text-black">
              +
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-40 h-[32rem] rounded p-3">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans">
            <p>In Progress</p>
            <button className="w-7 h-7 flex items-center justify-center text-black">
              +
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-40 h-[32rem] rounded p-3">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans">
            <p>Completed</p>
            <button className="w-7 h-7 flex items-center justify-center text-black">
              +
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-40 h-32[rem] rounded p-3">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans">
            <p>Incomplete</p>
            <button className="w-7 h-7 flex items-center justify-center text-black">
              +
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
        </div>
      </div>
    </div>
  );
}

export default TaskBoard;
