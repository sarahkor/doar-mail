import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/images/doar-logo.png";

function RegisterPasswordPage() {
  const { registrationData } = useAuth(); // הסרנו את updateRegistrationData
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: registrationData.username || "",
    password: registrationData.password || ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const validatePassword = (password) => {
    const length = password.length >= 8;
    const upper = /[A-Z]/.test(password);
    const lower = /[a-z]/.test(password);
    const number = /\d/.test(password);
    const special = /[!@#$%^&*]/.test(password);
    return length && upper && lower && number && special;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.endsWith("@doar.com")) {
      setError("Username must end with @doar.com");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    const fullData = {
      ...registrationData,
      ...formData
    };

    const formPayload = new FormData();
    formPayload.append("username", fullData.username);
    formPayload.append("password", fullData.password);
    formPayload.append("firstName", fullData.firstName || "");
    formPayload.append("lastName", fullData.lastName || "");
    formPayload.append("phone", fullData.phone || "");
    formPayload.append("birthday", fullData.dob || "");
    formPayload.append("gender", fullData.gender || "");

    if (fullData.profilePicture) {
      formPayload.append("profilePicture", fullData.profilePicture);
    }

    try {
      const response = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        body: formPayload
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.message || "Registration failed.");
        return;
      }

      navigate("/login");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="row shadow bg-white rounded-4 overflow-hidden" style={{ width: "850px" }}>
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-start p-5 bg-white">
          <img src={logo} alt="Doar Logo" style={{ height: "80px", marginBottom: "10px" }} />
          <h3 className="fw-semibold">Create a Doar Account</h3>
          <p className="text-muted">Set your login credentials</p>
        </div>

        <div className="col-md-6 d-flex align-items-center p-5 bg-white">
          <form className="w-100" onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                name="username"
                placeholder="Username (must end with @doar.com)"
                className={`form-control ${error.includes("Username") ? "is-invalid" : ""}`}
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className={`form-control ${error.includes("Password") ? "is-invalid" : ""}`}
                value={formData.password}
                onChange={handleChange}
              />
              <div className="form-text">
                Must be 8+ characters, include uppercase, lowercase, number, and special character.
              </div>
            </div>

            {error && <div className="text-danger mt-2">{error}</div>}

            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-link px-4"
                onClick={() => navigate("/register/details")}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary px-4">
                Finish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPasswordPage;