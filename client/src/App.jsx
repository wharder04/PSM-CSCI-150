import { AuthProvider } from "./AuthContext.jsx";
import RouteProtection from "./RouteProtection.jsx";

export default function App() {
  return (
    <AuthProvider>
      <div className="w-full">
        <RouteProtection />
      </div>
    </AuthProvider>
  );
}
