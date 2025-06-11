// src/components/RegisterPage.js
import React, { useState } from "react";
import logo from "../../assets/images/doar-logo.png"; // Adjust path as needed
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext'; // Import the useAuth hook

function RegisterPage() {
  // Destructure updateRegistrationData from the useAuth hook to save form data.
  const { updateRegistrationData } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState(""); // State for form validation errors
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Handles input changes and clears the error message when typing.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  };

  // Handles form submission and performs validation.
  const handleSubmit = (e) => {
    e.preventDefault();

    // Regular expression to allow only letters (English and Hebrew) and spaces.
    const lettersOnlyRegex = /^[a-zA-Z\u0590-\u05FF\s]+$/;

    // Validate First Name (required and must contain only letters/spaces)
    if (formData.firstName.trim() === "") {
      setError("Please enter your first name.");
      return;
    }
    if (!lettersOnlyRegex.test(formData.firstName.trim())) {
      setError("First name can only contain letters.");
      return;
    }

    // Validate Last Name (optional, but if entered, must contain only letters/spaces)
    if (formData.lastName.trim() !== "" && !lettersOnlyRegex.test(formData.lastName.trim())) {
      setError("Last name can only contain letters.");
      return;
    }

    // Save the valid data to the global context before navigating.
    updateRegistrationData(formData);

    console.log("Submitted First Step Data:", formData);
    navigate("/register/details"); // Navigate to the next registration step
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="row shadow bg-white rounded-4 overflow-hidden"
        style={{ width: "850px", maxWidth: "100%" }}
      >
        {/* Left section – Branding and introductory text */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-start p-5 bg-white">
          <img src={logo} alt="Doar Logo" style={{ height: "80px", marginBottom: "10px" }} />
          <h3 className="fw-semibold">Create a Doar Account</h3>
          <p className="text-muted">Enter your name</p>
        </div>

        {/* Right section – Registration form */}
        <div className="col-md-6 d-flex align-items-center p-5 bg-white">
          <form className="w-100" onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                // Apply 'is-invalid' class if there's an error related to first name
                className={`form-control ${error && error.includes("First name") ? "is-invalid" : ""}`}
              />
              {/* Display first name specific error message */}
              {error && error.includes("First name") && <div className="text-danger mt-1">{error}</div>}
            </div>

            <div className="mb-3">
              <input
                type="text"
                name="lastName"
                placeholder="Last name (optional)"
                value={formData.lastName}
                onChange={handleChange}
                // Apply 'is-invalid' class if there's an error related to last name
                className={`form-control ${error && error.includes("Last name") ? "is-invalid" : ""}`}
              />
              {/* Display last name specific error message */}
              {error && error.includes("Last name") && <div className="text-danger mt-1">{error}</div>}
            </div>

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary px-4">
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;