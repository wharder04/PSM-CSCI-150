import axios from "axios";
import {
  createTask,
  getTask,
  listTasks,
} from "../../server/controllers/taskController";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies to be sent with requests
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user data from localStorage on 401
      localStorage.removeItem("user");
      // Optionally redirect to login - but let components handle it
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password, remember = true) => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        remember,
      });
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const res = await api.post("/auth/register", userData);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  logout: async () => {
    try {
      const res = await api.post("/auth/logout");
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
};

export const projectService = {
  createProject: async (name, desc, startDate, dueDate) => {
    try {
      const res = await api.post("/projects", {
        name,
        desc,
        startDate,
        dueDate,
      });
      return res.data;
    } catch (error) {
      console.log("error obj", error);
    }
  },
  myProjects: async () => {
    try {
      const res = await api.get("/projects");
      return res.data;
    } catch (error) {
      console.log("error obj", error);
    }
  },
  getDashboardData: async () => {
    try {
      const res = await api.get("/projects/dashboard");
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
  getProject: async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
    }
  },
  updateProject: async (projectId, projectData) => {
    try {
      const res = await api.put(`/projects/${projectId}`, { projectData });
      return res.data;
    } catch (error) {
      console.log("error obj", error);
    }
  },
  deleteProject: async (projectId) => {
    try {
      const res = await api.delete(`/projects/${projectId}`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
    }
  },
  listMembers: async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
    }
  },
  addMember: async (projectId, emailOrId) => {
    try {
      const body = emailOrId.includes("@")
        ? { email: emailOrId }
        : { memberId: emailOrId };

      const res = await api.post(`/projects/${projectId}/members`, body);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
  toggleMemberStatus: async (projectId, memberId) => {
    try {
      const res = await api.patch(`/projects/${projectId}/members/${memberId}`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
  removeMember: async (projectId, memberId) => {
    try {
      const res = await api.delete(
        `/projects/${projectId}/members/${memberId}`
      );
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
  getProgress: async (projectId) => {
    try {
      const res = await api.get(`/projects/progress/${projectId}`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
};

export const taskService = {
  listTasks: async (projectId) => {
    try {
      const url = `/projects/${projectId}/tasks`;
      const res = await api.get(url);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
    }
  },

  createTask: async (projectId, taskData) => {
    try {
      const url = projectId ? `/projects/${projectId}/tasks` : "/tasks";
      const res = await api.post(url, taskData);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  getTask: async (taskId) => {
    try {
      const res = await api.get(`/tasks/${taskId}`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, taskData);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
};
