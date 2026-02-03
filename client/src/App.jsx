import { AuthProvider } from "./AuthContext.jsx";
import RouteProtection from "./RouteProtection.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouteProtection />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
