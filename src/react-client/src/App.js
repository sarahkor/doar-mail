import './App.css';
import Navbar from './components/Navbar';
import LabelSidebar from './components/LabelSidebar';
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Wrap home route in your layout */}
        <Route
          path="/home"
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
