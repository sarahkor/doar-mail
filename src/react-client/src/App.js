import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from 'react';
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import RegisterDetailsPage from './pages/Register/RegisterDetailsPage';
import RegisterPasswordPage from './pages/Register/RegisterPasswordPage';
import HomePage from "./pages/home/HomePage"; // <-- Use the right path/casing
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { searchMails } from './api/searchApi';

function App() {
  // Search state at app level
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  const handleSearch = async (params) => {
    setIsSearching(true);
    setSearchParams(params);

    try {
      const response = await searchMails(params);
      setSearchResults(response.results);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setSearchParams(null);
    setIsSearching(false);
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/details" element={<RegisterDetailsPage />} />
      <Route path="/register/password" element={<RegisterPasswordPage />} />

      <Route
        path="/home/*"
        element={
          <ProtectedRoute>
            <AppLayout
              onSearch={handleSearch}
              searchResults={searchResults}
              isSearching={isSearching}
              onClearSearch={handleClearSearch}
            >
              <HomePage
                searchResults={searchResults}
                isSearching={isSearching}
                searchParams={searchParams}
                onClearSearch={handleClearSearch}
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
