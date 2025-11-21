import { useState } from "react";
import { MdAdd } from "react-icons/md";

function TaskBoard() {
  const [unAssignedTasks, setUnassignedTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [incompleteTasks, setIncompleteTasks] = useState([]);

  return (
    <div className="min-h-screen p-8 bg-gray-100 text-black">
      <div>
        <h2 className="text-3xl font-bold text-black mb-6">Task Board</h2>
        <p className="text-2xl text-black font-semibold">
          Drag tasks to update their status
        </p>
        <button className="bg-gray-800 text-white font-sans rounded w-32 h-10">
          Filters
        </button>
        <button className="flex items-center gap-2 bg-gray-300 text-black font-sans rounded w-32 h-10">
          <MdAdd size={20} color="black" />
          Create New Task
        </button>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col items-center border-2 border-black w-32 h-96 rounded">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans">
            <p>Unassigned</p>
            <button className="w-7 h-7 flex items-center justify-center">
              <MdAdd size={30} color="black" />
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-32 h-96 rounded">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans">
            <p>Assigned</p>
            <button className="w-7 h-7 flex items-center justify-center">
              <MdAdd size={30} color="black" />
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-32 h-96 rounded">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans">
            <p>In Progress</p>
            <button className="w-7 h-7 flex items-center justify-center">
              <MdAdd size={30} color="black" />
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-32 h-96 rounded">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans">
            <p>Completed</p>
            <button className="w-7 h-7 flex items-center justify-center">
              <MdAdd size={30} color="black" />
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
        </div>
        <div className="flex flex-col items-center border-2 border-black w-32 h-96 rounded">
          <div className="flex items-center justify-between w-full px-2 mb-2 text-black font-sans">
            <p>Incomplete</p>
            <button className="w-7 h-7 flex items-center justify-center">
              <MdAdd size={30} color="black" />
            </button>
          </div>
          <div className="w-full border-t border-black"></div>
        </div>
      </div>
    </div>
  );
}

export default TaskBoard;
