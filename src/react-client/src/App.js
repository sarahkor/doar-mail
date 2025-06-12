import './App.css';
import Navbar from './components/Navbar';
import LabelSidebar from './components/LabelSidebar';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import RegisterDetailsPage from './pages/Register/RegisterDetailsPage'; 
import RegisterPasswordPage from './pages/Register/RegisterPasswordPage';
import HomePage from "./pages/HomePage";
import { useState } from 'react';
import ComposeDialog from './components/ComposeDialog'; // adjust path if needed

function AppLayout({ children }) {
  const [showCompose, setShowCompose] = useState(false);

  const openCompose = () => setShowCompose(true);
  const closeCompose = () => setShowCompose(false);

  return (
    <div className="App">
      <Navbar onComposeClick={openCompose} />
      <div className="app-content" style={{ display: "flex" }}>
        <LabelSidebar />
        <div style={{ flexGrow: 1, padding: "20px" }}>
          {children}
        </div>
      </div>
      {showCompose && <ComposeDialog onClose={closeCompose} />}
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
        <Route path="/register/details" element={<RegisterDetailsPage />} /> 
        <Route path="/register/password" element={<RegisterPasswordPage />} />
        <Route
          path="/home"
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
