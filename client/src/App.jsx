import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Type from "./pages/Type.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { ToastContainer } from "react-toastify";
import { AuthContext } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import EmailVerify from "./pages/EmailVerify.jsx";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gray-900">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isLoading, user } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-gray-900">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!isLoggedIn || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/types"
          element={
            <ProtectedRoute>
              <Type />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
