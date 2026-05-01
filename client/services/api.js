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

const cleanAssignee = (taskData = {}) => {
  return {
    ...taskData,
    assignee:
      taskData.assignee === "" ||
      taskData.assignee === "unassigned" ||
      taskData.assignee === undefined
        ? null
        : taskData.assignee,
  };
};

export const authService = {
  login: async (email, password, remember = true) => {
    const res = await api.post("/auth/login", { email, password, remember });
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post("/auth/register", userData);
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (resetToken, password) => {
    const res = await api.put(`/auth/reset-password/${resetToken}`, {
      password,
    });
    return res.data;
  },

  verifyToken: async (resetToken) => {
    const res = await api.get(`/auth/verify-password/${resetToken}`);
    return res.data;
  },
};

export const projectService = {
  createProject: async (name, desc, startDate, dueDate) => {
    const res = await api.post("/projects", {
      name,
      desc,
      startDate,
      dueDate,
    });
    return res.data;
  },

  myProjects: async () => {
    const res = await api.get("/projects/mine");
    return res.data;
  },

  getDashboardData: async (projectId = "") => {
    const url = projectId
      ? `/projects/dashboard?projectId=${projectId}`
      : "/projects/dashboard";

    const res = await api.get(url);
    return res.data;
  },

  getProject: async (projectId) => {
    const res = await api.get(`/projects/${projectId}`);
    return res.data;
  },

  updateProject: async (projectId, projectData) => {
    const res = await api.put(`/projects/${projectId}`, projectData);
    return res.data;
  },

  deleteProject: async (projectId) => {
    const res = await api.delete(`/projects/${projectId}`);
    return res.data;
  },

  listMembers: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/members`);
    return res.data;
  },

  addMember: async (projectId, emailOrId) => {
    const body =
      typeof emailOrId === "string" && emailOrId.includes("@")
        ? { email: emailOrId }
        : { memberId: emailOrId };

    const res = await api.post(`/projects/${projectId}/members`, body);
    return res.data;
  },

  toggleMemberStatus: async (projectId, memberId) => {
    const res = await api.patch(
      `/projects/${projectId}/members/${memberId}/status`
    );
    return res.data;
  },

  toggleMemberTaskPermission: async (projectId, memberId) => {
    const res = await api.patch(
      `/projects/${projectId}/members/${memberId}/task-permission`
    );
    return res.data;
  },

  removeMember: async (projectId, memberId) => {
    const res = await api.delete(`/projects/${projectId}/members/${memberId}`);
    return res.data;
  },

  getProgress: async (projectId) => {
    const res = await api.get(`/projects/progress/${projectId}`);
    return res.data;
  },

  getDiscussion: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/discussion`);
    return res.data;
  },

  sendDiscussionMessage: async (projectId, text) => {
    const res = await api.post(`/projects/${projectId}/discussion`, { text });
    return res.data;
  },
};

export const taskService = {
  listTasks: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/tasks`);
    return res.data;
  },

  createTask: async (projectId, taskData) => {
    const url = projectId ? `/projects/${projectId}/tasks` : "/tasks";
    const res = await api.post(url, cleanAssignee(taskData));
    return res.data;
  },

  getTask: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data;
  },

  updateTask: async (taskId, taskData) => {
    const res = await api.put(`/tasks/${taskId}`, cleanAssignee(taskData));
    return res.data;
  },

  unassignTask: async (taskId) => {
    const res = await api.put(`/tasks/${taskId}`, { assignee: null });
    return res.data;
  },

  addComment: async (taskId, text) => {
    const res = await api.post(`/tasks/${taskId}/comments`, { text });
    return res.data;
  },

  deleteTask: async (taskId) => {
    const res = await api.delete(`/tasks/${taskId}`);
    return res.data;
  },
};

export const notificationService = {
  getUnread: async () => {
    const res = await api.get("/notifications/unread");
    return res.data;
  },

  getAll: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },

  getNotifications: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },

  markRead: async (notificationId) => {
    const res = await api.patch(`/notifications/${notificationId}/read`);
    return res.data;
  },

  markOneRead: async (notificationId) => {
    const res = await api.patch(`/notifications/${notificationId}/read`);
    return res.data;
  },

  markAllRead: async () => {
    const res = await api.patch("/notifications/read-all");
    return res.data;
  },

  deleteNotification: async (notificationId) => {
    const res = await api.delete(`/notifications/${notificationId}`);
    return res.data;
  },
};

export const profileService = {
  getProfile: async () => {
    const res = await api.get("/profile/me");
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put("/profile/me", profileData);
    return res.data;
  },
};

export default api;