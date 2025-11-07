import React from "react";
import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from './AuthContext'; // Assuming you have a context

function RequireAuth({ children }) {
  // const { isLoggedIn } = useAuth(); // Get auth state from context
  const isLoggedIn = true; // Use your real auth state here
  const location = useLocation();

  if (!isLoggedIn) {
    // If not logged in, redirect them to the login page.
    // `replace` stops them from using the "back" button to return.
    // `state` passes the original location they tried to visit.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in, render the component they were trying to access
  return children;
}
