// src/contexts/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [registrationData, setRegistrationData] = useState({
    firstName: "",
    lastName: "",
    dob: "",       // Date of Birth
    gender: "",    // Gender
    profilePicture: null, // For storing the File object of the picture
  });

  // Function to update any part of the registration data
  const updateRegistrationData = (newData) => {
    setRegistrationData(prevData => ({ ...prevData, ...newData }));
  };

  // Function to clear all registration data (e.g., after successful registration)
  const clearRegistrationData = () => {
    setRegistrationData({
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      profilePicture: null,
    });
  };

  const value = {
    registrationData,
    updateRegistrationData,
    clearRegistrationData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};