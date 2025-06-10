import './App.css';
import Navbar from './components/Navbar';
import LabelSidebar from './components/LabelSidebar';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import HomePage from "./pages/HomePage";

function AppLayout({ children }) {
  return (
    <div className="App">
      <Navbar />
      <div className="app-content" style={{ display: "flex" }}>
        <LabelSidebar />
        <div style={{ flexGrow: 1, padding: "20px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/home"
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          }
        />
        {/* ניתוב לכל דבר לא מוכר */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
