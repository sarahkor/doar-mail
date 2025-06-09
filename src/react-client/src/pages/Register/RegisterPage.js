import { useState } from "react";
import logo from "../../assets/images/doar-logo.png";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.firstName.trim() === "") {
      setError("Please enter your first name");
      return;
    }

    console.log("Submitted:", formData);
    navigate("/register/details"); // Optional next step
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="row shadow bg-white rounded-4 overflow-hidden"
        style={{ width: "850px", maxWidth: "100%" }}
      >
        {/* Left section – Branding */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-start p-5 bg-white">
          <img src={logo} alt="Doar Logo" style={{ height: "80px", marginBottom: "10px" }} />
          <h3 className="fw-semibold">Create a Doar Account</h3>
          <p className="text-muted">Enter your name</p>
        </div>

        {/* Right section – Form */}
        <div className="col-md-6 d-flex align-items-center p-5 bg-white">
          <form className="w-100" onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className={`form-control ${error ? "is-invalid" : ""}`}
              />
            </div>

            <div className="mb-3">
              <input
                type="text"
                name="lastName"
                placeholder="Last name (optional)"
                value={formData.lastName}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {error && <div className="text-danger mb-3">{error}</div>}

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
