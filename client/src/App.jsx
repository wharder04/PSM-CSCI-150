import { AuthProvider } from "./AuthContext.jsx";
import RouteProtection from "./RouteProtection.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="w-full">
          <RouteProtection />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}
