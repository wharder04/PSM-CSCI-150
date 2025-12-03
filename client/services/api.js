// inside projectService in src/services/api.js

export const projectService = {
  // ...existing methods (createProject, myProjects, etc.)...

  // List members in a project
  listMembers: async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      // { success, data: [ ...members ] }
      return res.data.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  // Add a member by email (or memberId)
  addMember: async (projectId, emailOrId) => {
    try {
      const body =
        emailOrId.includes("@")
          ? { email: emailOrId }
          : { memberId: emailOrId };

      const res = await api.post(`/projects/${projectId}/members`, body);
      return res.data.data; // the created/updated ProjectMember doc
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  // Toggle member active/inactive
  toggleMemberStatus: async (projectId, memberId) => {
    try {
      const res = await api.patch(`/projects/${projectId}/members/${memberId}`);
      return res.data.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },

  // Remove member from project
  removeMember: async (projectId, memberId) => {
    try {
      const res = await api.delete(
        `/projects/${projectId}/members/${memberId}`
      );
      return res.data.data;
    } catch (error) {
      console.log("error obj", error);
      throw error;
    }
  },
};
