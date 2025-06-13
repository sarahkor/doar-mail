import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import RegisterDetailsPage from './pages/Register/RegisterDetailsPage';
import RegisterPasswordPage from './pages/Register/RegisterPasswordPage';
import HomePage from "./pages/home/HomePage"; // <-- Use the right path/casing
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/details" element={<RegisterDetailsPage />} />
      <Route path="/register/password" element={<RegisterPasswordPage />} />

      {/* Nested mailbox routes, protected by login */}
      <Route
        path="/home/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
