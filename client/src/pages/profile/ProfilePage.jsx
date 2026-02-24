import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { profileService } from "../../../services/api";
import { MdEdit, MdClose, MdEmail, MdSchool, MdInfo, MdVerifiedUser } from "react-icons/md";

function ProfilePage() {
  const { user: authUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    course: "",
    status: "Active",
    password: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await profileService.getProfile();
        if (response && response.ok) {
          setProfile(response.data);
          setFormData({
            name: response.data.name || "",
            bio: response.data.bio || "",
            course: response.data.course || "",
            status: response.data.status || "Active",
            password: "",
          });
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(
          err.response?.data?.error ||
          err.message ||
          "Failed to load profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenEditModal = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        course: profile.course || "",
        status: profile.status || "Active",
        password: "",
      });
    }
    setIsEditModalOpen(true);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setUpdateError(null);
    setUpdateSuccess(false);
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        course: profile.course || "",
        status: profile.status || "Active",
        password: "",
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // Validation
      if (!formData.name || !formData.name.trim()) {
        setUpdateError("Name is required");
        setUpdateLoading(false);
        return;
      }

      if (formData.password && formData.password.length < 8) {
        setUpdateError("Password must be at least 8 characters long");
        setUpdateLoading(false);
        return;
      }

      // Prepare update data - send all fields that are being updated
      const updateData = {
        name: formData.name.trim(),
        bio: formData.bio || "",
        course: formData.course || "",
        status: formData.status || "Active",
      };

      // Only include password if it's provided
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password.trim();
      }

      const response = await profileService.updateProfile(updateData);
      if (response && response.ok) {
        setProfile(response.data);
        // Update AuthContext with new user data
        if (authUser) {
          const updatedUser = {
            ...authUser,
            ...response.data,
          };
          login(updatedUser);
        }
        setUpdateSuccess(true);
        // Reset password field after successful update
        setFormData((prev) => ({
          ...prev,
          password: "",
        }));
        setTimeout(() => {
          setIsEditModalOpen(false);
          setUpdateSuccess(false);
        }, 1500);
      } else {
        setUpdateError(response?.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateError(
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.message ||
        err.message ||
        "Failed to update profile. Please try again."
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Busy":
        return "bg-yellow-100 text-yellow-700";
      case "In a Meeting":
        return "bg-blue-100 text-blue-700";
      case "Offline":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full p-8 bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mb-4"></div>
          <p className="text-sm text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen w-full p-8 bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Error loading profile
          </h3>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-2 bg-bg-main">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2 tracking-tight">
            Profile
          </h1>
          <p className="text-base text-text-secondary">
            Manage your profile information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-panel rounded-2xl p-8 shadow-soft border border-border-default mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-accent-primary flex items-center justify-center text-text-on-accent text-3xl font-bold">
                {getInitials(profile?.name || authUser?.name)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-1">
                  {profile?.name || authUser?.name || "User"}
                </h2>
                <p className="text-sm text-text-secondary mb-2">
                  {profile?.email || authUser?.email || ""}
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    profile?.status || "Active"
                  )}`}
                >
                  {profile?.status || "Active"}
                </span>
              </div>
            </div>
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-text-on-accent rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <MdEdit size={18} />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border-default">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-bg-surface-hover flex items-center justify-center flex-shrink-0">
                <MdEmail size={20} className="text-text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium mb-1">
                  Email
                </p>
                <p className="text-base text-text-primary">
                  {profile?.email || authUser?.email || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-bg-surface-hover flex items-center justify-center flex-shrink-0">
                <MdSchool size={20} className="text-text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium mb-1">
                  Course
                </p>
                <p className="text-base text-text-primary">
                  {profile?.course || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 md:col-span-2">
              <div className="w-10 h-10 rounded-lg bg-bg-surface-hover flex items-center justify-center flex-shrink-0">
                <MdInfo size={20} className="text-text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-secondary font-medium mb-1">
                  About You
                </p>
                <p className="text-base text-text-primary">
                  {profile?.bio || "No bio provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-bg-surface rounded-2xl p-6 shadow-soft border border-border-default">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Account Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border-default">
              <span className="text-sm text-text-secondary">Member since</span>
              <span className="text-sm text-text-primary">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border-default">
              <span className="text-sm text-text-secondary">Last updated</span>
              <span className="text-sm text-text-primary">
                {profile?.updatedAt
                  ? new Date(profile.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 cursor-pointer"
          onClick={handleCloseEditModal}
        >
          <div
            className="bg-bg-surface rounded-xl shadow-large w-full max-w-xl h-full max-h-[90vh] overflow-y-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 rounded-tl-xl bg-bg-surface px-6 py-5 flex justify-between items-center border-b border-border-default">
              <h2 className="text-xl font-semibold text-text-primary">
                Edit Profile
              </h2>
              <button
                onClick={handleCloseEditModal}
                className="text-text-muted hover:text-text-primary transition-colors p-1 cursor-pointer"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateProfile}
              className="p-6 space-y-6 bg-bg-surface h-full overflow-y-none"
            >
              {updateError && (
                <div className="bg-status-error-bg border border-status-error-border text-status-error-text px-4 py-3 rounded-lg text-sm">
                  {updateError}
                </div>
              )}

              {updateSuccess && (
                <div className="bg-status-success-bg border border-status-success-border text-status-success-text px-4 py-3 rounded-lg text-sm">
                  Profile updated successfully!
                </div>
              )}

              <div className="grid grid-cols-5 items-center">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="Enter your name"
                  disabled={updateLoading}
                />
              </div>

              <div className="grid grid-cols-5 items-center">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  About You
                </label>
                <div className="col-span-4">
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors resize-none"
                    placeholder="Tell us about yourself"
                    disabled={updateLoading}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-text-muted mt-1 text-right">
                    {formData.bio?.length || 0}/500 characters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-5 items-center">
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Course
                </label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="Enter your course"
                  disabled={updateLoading}
                />
              </div>

              <div className="grid grid-cols-5 items-center">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="col-span-4 w-full px-0 py-2 bg-transparent border-0 border-b-2 border-border-default text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                  disabled={updateLoading}
                >
                  <option value="Active">Active</option>
                  <option value="Offline">Offline</option>
                  <option value="Busy">Busy</option>
                  <option value="In a Meeting">In a Meeting</option>
                </select>
              </div>

              <div className="grid grid-cols-5 items-center">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Password
                </label>
                <div className="col-span-4">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-border-default text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                    placeholder="Leave blank to keep current password"
                    disabled={updateLoading}
                    minLength={8}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    {formData.password
                      ? `Minimum 8 characters (${formData.password.length} entered)`
                      : "Leave blank to keep your current password"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 bg-accent-primary text-text-on-accent rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {updateLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-text-on-accent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <MdVerifiedUser size={18} />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 bg-bg-surface-hover text-text-primary rounded-lg text-sm font-medium hover:bg-border-default transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
