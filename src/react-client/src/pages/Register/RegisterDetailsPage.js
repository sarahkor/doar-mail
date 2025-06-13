
// File: src/react-client/src/pages/Register/RegisterDetailsPage.js
// import necessary libraries and components
import React, { useState, useRef, useEffect } from 'react';
import logo from "../../assets/images/doar-logo.png";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// RegisterDetailsPage component for user registration details
function RegisterDetailsPage() {
  const { registrationData, updateRegistrationData } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dob: registrationData.dob || '',
    gender: registrationData.gender || '',
    phone: registrationData.phone || '',
    profilePicture: registrationData.profilePicture || null,
    profilePicturePreview: registrationData.profilePicture
      ? URL.createObjectURL(registrationData.profilePicture)
      : null,
  });
  const [dobError, setDobError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [fileError, setFileError] = useState("");
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
    if (name === "dob") setDobError("");
    if (name === "gender") setGenderError("");
    if (name === "phone") setPhoneError("");
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFileError("Please upload an image file (e.g., JPEG, PNG, GIF).");
        setFormData(prev => ({ ...prev, profilePicture: null, profilePicturePreview: null }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File size exceeds 5MB. Please upload a smaller image.");
        setFormData(prev => ({ ...prev, profilePicture: null, profilePicturePreview: null }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file),
      }));
    } else {
      setFormData(prev => ({ ...prev, profilePicture: null, profilePicturePreview: null }));
    }
  };
  const handleImageUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    let hasError = false;
    if (formData.dob.trim() === "") {
      setDobError("Please enter your date of birth.");
      hasError = true;
    } else {
      const dobDate = new Date(formData.dob);
      if (isNaN(dobDate.getTime())) {
        setDobError("Please enter a valid date of birth.");
        hasError = true;
      } else {
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        if (age < 13) {
          setDobError("You must be at least 13 years old to create an account.");
          hasError = true;
        }
      }
    }
    if (!formData.gender || formData.gender.trim() === "") {
      setGenderError("Please select your gender.");
      hasError = true;
    }
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setPhoneError("Please enter a valid 10-digit Israeli phone number.");
      hasError = true;
    }
    if (hasError) return;
    // Update registration data in context
    updateRegistrationData({
      dob: formData.dob,
      gender: formData.gender,
      phone: formData.phone,
      profilePicture: formData.profilePicture,
    });
    navigate("/register/password");
  };
  
  // Render the registration details form
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="row shadow bg-white rounded-4 overflow-hidden" style={{ width: "850px", maxWidth: "100%" }}>
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-start p-5 bg-white">
          <img src={logo} alt="Doar Logo" style={{ height: "80px", marginBottom: "10px" }} />
          <h3 className="fw-semibold">Create a Doar Account</h3>
          <p className="text-muted">Enter your details</p>
        </div>
        <div className="col-md-6 d-flex align-items-center p-5 bg-white">
          <form className="w-100" onSubmit={handleSubmit}>
            {/* Date of Birth */}
            <div className="mb-3">
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`form-control ${dobError ? "is-invalid" : ""}`}
                max={new Date().toISOString().split('T')[0]}
              />
              {dobError && <div className="text-danger mt-1">{dobError}</div>}
            </div>
            {/* Gender */}
            <div className="mb-3">
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`form-select ${genderError ? "is-invalid" : ""}`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              {genderError && <div className="text-danger mt-1">{genderError}</div>}
            </div>
            {/* Phone */}
            <div className="mb-3">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-control ${phoneError ? "is-invalid" : ""}`}
                placeholder="Phone number (e.g., 0501234567)"
              />
              {phoneError && <div className="text-danger mt-1">{phoneError}</div>}
            </div>
            {/* Profile Picture Upload */}
            <div className="mb-3">
              <label className="form-label">Profile Picture (optional)</label>
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
              {fileError && <div className="text-danger mt-1">{fileError}</div>}
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
