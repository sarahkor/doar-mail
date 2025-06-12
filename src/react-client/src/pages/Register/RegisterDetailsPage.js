// src/components/RegisterDetailsPage.js
import React, { useState, useRef, useEffect } from 'react';
import logo from "../../assets/images/doar-logo.png";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function RegisterDetailsPage() {
  const { registrationData, updateRegistrationData } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dob: registrationData.dob || '',
    gender: registrationData.gender || '',
    profilePicture: registrationData.profilePicture || null,
    profilePicturePreview: registrationData.profilePicture
      ? URL.createObjectURL(registrationData.profilePicture)
      : null,
  });

  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (formData.profilePicturePreview) {
        URL.revokeObjectURL(formData.profilePicturePreview);
      }
    };
  }, [formData.profilePicturePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file (e.g., JPEG, PNG, GIF).");
        setFormData(prev => ({ ...prev, profilePicture: null, profilePicturePreview: null }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB. Please upload a smaller image.");
        setFormData(prev => ({ ...prev, profilePicture: null, profilePicturePreview: null }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file),
      }));
      setError("");
    } else {
      setFormData(prev => ({ ...prev, profilePicture: null, profilePicturePreview: null }));
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.dob.trim() === "") {
      setError("Please enter your date of birth.");
      return;
    }

    const dobDate = new Date(formData.dob);
    if (isNaN(dobDate.getTime())) {
      setError("Please enter a valid date of birth.");
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 13) {
      setError("You must be at least 13 years old to create an account.");
      return;
    }

    if (formData.gender.trim() === "") {
      setError("Please select your gender.");
      return;
    }

    updateRegistrationData(formData);
    console.log("Passed validation");

    navigate("/login");

  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="row shadow bg-white rounded-4 overflow-hidden" style={{ width: "850px", maxWidth: "100%" }}>
        {/* Left section */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-start p-5 bg-white">
          <img src={logo} alt="Doar Logo" style={{ height: "80px", marginBottom: "10px" }} />
          <h3 className="fw-semibold">Create a Doar Account</h3>
          <p className="text-muted">Enter your details</p>
        </div>

        {/* Right section */}
        <div className="col-md-6 d-flex align-items-center p-5 bg-white">
          <form className="w-100" onSubmit={handleSubmit}>
            {/* Date of Birth */}
            <div className="mb-3">
              <label htmlFor="dob" className="form-label visually-hidden">Date of Birth</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`form-control ${error.includes("date of birth") ? "is-invalid" : ""}`}
                max={new Date().toISOString().split('T')[0]}
              />
              {error.includes("date of birth") && <div className="text-danger mt-1">{error}</div>}
            </div>

            {/* Gender */}
            <div className="mb-3">
              <label htmlFor="gender" className="form-label visually-hidden">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`form-select ${error.includes("gender") ? "is-invalid" : ""}`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              {error.includes("gender") && <div className="text-danger mt-1">{error}</div>}
            </div>

            {/* Profile Picture Upload */}
            <div className="mb-3">
              <label htmlFor="profilePicture" className="form-label">Profile Picture (optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="form-control d-none"
                accept="image/*"
              />
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={handleImageUploadClick}
              >
                Click to Choose Profile Picture
              </button>

              {formData.profilePicturePreview && (
                <div className="mt-2 text-center">
                  <img
                    src={formData.profilePicturePreview}
                    alt="Profile Preview"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "2px solid #ccc"
                    }}
                  />
                </div>
              )}

              {error.includes("file") && <div className="text-danger mt-1">{error}</div>}
            </div>

            {/* Navigation buttons */}
            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-link px-4"
                onClick={() => navigate('/')}
              >
                Back
              </button>
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

export default RegisterDetailsPage;
