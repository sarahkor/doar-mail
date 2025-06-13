// src/components/RegisterPage.js
import React, { useState } from "react";
import logo from "../../assets/images/doar-logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';

function RegisterPage() {
  const { updateRegistrationData } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  // Satate variables for error messages
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));


    if (name === "firstName") setFirstNameError("");
    if (name === "lastName") setLastNameError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const lettersOnlyRegex = /^[a-zA-Z\u0590-\u05FF\s]+$/;

    // Check if first name is empty or contains invalid characters
    if (formData.firstName.trim() === "") {
      setFirstNameError("First name is required.");
      return;
    }
    if (!lettersOnlyRegex.test(formData.firstName.trim())) {
      setFirstNameError("First name can only contain letters.");
      return;
    }

    // Check for last name (optional)
    if (formData.lastName.trim() !== "" && !lettersOnlyRegex.test(formData.lastName.trim())) {
      setLastNameError("Last name can only contain letters.");
      return;
    }

    // If all checks pass, continue
    updateRegistrationData(formData);
    navigate("/register/details");
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="row shadow bg-white rounded-4 overflow-hidden"
        style={{ width: "850px", maxWidth: "100%" }}
      >
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-start p-5 bg-white">
          <img src={logo} alt="Doar Logo" style={{ height: "80px", marginBottom: "10px" }} />
          <h3 className="fw-semibold">Create a Doar Account</h3>
          <p className="text-muted">Enter your name</p>
        </div>

        <div className="col-md-6 d-flex align-items-center p-5 bg-white">
          <form className="w-100" onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className={`form-control ${firstNameError ? "is-invalid" : ""}`}
              />
              {firstNameError && <div className="text-danger mt-1">{firstNameError}</div>}
            </div>

            <div className="mb-3">
              <input
                type="text"
                name="lastName"
                placeholder="Last name (optional)"
                value={formData.lastName}
                onChange={handleChange}
                className={`form-control ${lastNameError ? "is-invalid" : ""}`}
              />
              {lastNameError && <div className="text-danger mt-1">{lastNameError}</div>}
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
