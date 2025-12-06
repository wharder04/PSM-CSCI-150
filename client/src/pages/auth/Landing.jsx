import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext.jsx";
import {
  MdFolder,
  MdCheckCircle,
  MdPeople,
  MdTrendingUp,
  MdDashboard,
  MdTask,
  MdArrowForward,
  MdCalendarToday
} from "react-icons/md";

function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/auth/register");
    }
  };

  const features = [
    {
      icon: <MdFolder size={32} />,
      title: "Project Management",
      description: "Create, organize, and track all your projects in one place. Set deadlines, assign tasks, and monitor progress effortlessly."
    },
    {
      icon: <MdTask size={32} />,
      title: "Task Organization",
      description: "Break down projects into manageable tasks. Use Kanban boards and task lists to stay organized and productive."
    },
    {
      icon: <MdPeople size={32} />,
      title: "Team Collaboration",
      description: "Invite team members, assign roles, and collaborate seamlessly. Keep everyone in sync with real-time updates."
    },
    {
      icon: <MdTrendingUp size={32} />,
      title: "Progress Tracking",
      description: "Monitor project progress with visual dashboards. Get insights into completion rates and task statistics."
    },
    {
      icon: <MdDashboard size={32} />,
      title: "Smart Dashboard",
      description: "Get a comprehensive overview of all your projects, tasks, and team activity at a glance."
    },
    {
      icon: <MdCalendarToday size={32} />,
      title: "Deadline Management",
      description: "Never miss a deadline. Set due dates, get reminders, and track upcoming milestones."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-bg-base">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-border shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
              <MdFolder className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">PMS</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-6 py-2 text-text-primary font-semibold hover:text-black transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-2 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 tracking-tight">
            Manage Your Projects
            <br />
            <span className="text-black">With Ease</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
            A powerful project management system designed to help teams collaborate,
            organize tasks, and deliver projects on time. Everything you need in one place.
          </p>
          <div className="flex gap-4 justify-center">
            {!isAuthenticated && (
              <>
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-black text-white rounded-xl font-semibold text-lg shadow-medium hover:-translate-y-0.5 hover:shadow-large transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  Get Started Free
                  <MdArrowForward size={20} />
                </button>
                <Link
                  to="/auth/login"
                  className="px-8 py-4 bg-white text-text-primary rounded-xl font-semibold text-lg border-2 border-border hover:border-accent-light transition-all duration-200 cursor-pointer"
                >
                  Sign In
                </Link>
              </>
            )}
            {isAuthenticated && (
              <button
                onClick={() => navigate("/home")}
                className="px-8 py-4 bg-black text-white rounded-xl font-semibold text-lg shadow-medium hover:-translate-y-0.5 hover:shadow-large transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                Go to Dashboard
                <MdArrowForward size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-soft border border-border hover:-translate-y-1 hover:shadow-large transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-black mb-2">100%</div>
              <div className="text-text-secondary">Project Organization</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black mb-2">24/7</div>
              <div className="text-text-secondary">Team Collaboration</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black mb-2">∞</div>
              <div className="text-text-secondary">Unlimited Projects</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-black rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using PMS to manage their projects more effectively.
            </p>
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto cursor-pointer"
            >
              Create Your Account
              <MdArrowForward size={20} />
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-text-secondary">
            © 2025 PMS - Project Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
