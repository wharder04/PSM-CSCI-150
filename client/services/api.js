import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
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

  forgotPassword: async (email) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  resetPassword: async (resetToken, password) => {
    try {
      const res = await api.put(`/auth/reset-password/${resetToken}`, {
        password,
      });
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  verifyToken: async (resetToken) => {
    try {
      const res = await api.get(`/auth/verify-password/${resetToken}`);
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
      throw error;
    }
  },

  myProjects: async () => {
    try {
      const res = await api.get("/projects/mine");
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
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
      throw error;
    }
  },

  updateProject: async (projectId, projectData) => {
    try {
      const res = await api.put(`/projects/${projectId}`, projectData);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    try {
      const res = await api.delete(`/projects/${projectId}`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  listMembers: async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  addMember: async (projectId, emailOrId) => {
    try {
      const body =
        typeof emailOrId === "string" && emailOrId.includes("@")
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
      const res = await api.patch(`/projects/${projectId}/members/${memberId}/status`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  toggleMemberTaskPermission: async (projectId, memberId) => {
    try {
      const res = await api.patch(
        `/projects/${projectId}/members/${memberId}/task-permission`
      );
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  removeMember: async (projectId, memberId) => {
    try {
      const res = await api.delete(`/projects/${projectId}/members/${memberId}`);
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

  getDiscussion: async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}/discussion`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  sendDiscussionMessage: async (projectId, text) => {
    try {
      const res = await api.post(`/projects/${projectId}/discussion`, { text });
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
      const res = await api.get(`/projects/${projectId}/tasks`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
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
      throw error;
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

  addComment: async (taskId, text) => {
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { text });
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

export const notificationService = {
  getUnread: async () => {
    try {
      const res = await api.get("/notifications/unread");
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const res = await api.get("/notifications");
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  markRead: async (notificationId) => {
    try {
      const res = await api.patch(`/notifications/${notificationId}/read`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  markAllRead: async () => {
    try {
      const res = await api.patch("/notifications/read-all");
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const res = await api.delete(`/notifications/${notificationId}`);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
};

export const profileService = {
  getProfile: async () => {
    try {
      const res = await api.get("/profile/me");
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await api.put("/profile/me", profileData);
      return res.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
};

export default api;
