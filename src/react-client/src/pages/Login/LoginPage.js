// Description: Login page component for the Doar application
import { useState } from "react";
import logo from "../../assets/images/doar-logo.png";
import { useNavigate, NavLink } from "react-router-dom";

// LoginPage component
function LoginPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when typing
  };

  // Handle next step in the login process
  // Validates the username and checks if it exists in the system
  const handleNext = async (e) => {
    e.preventDefault();
    if (formData.username.trim() === "") {
      setError("Please enter your email or phone");
      return;
    }
    const isPhone = /^05\d{8}$/.test(formData.username);
    const email = formData.username.includes("@") || isPhone
      ? formData.username
      : `${formData.username}@doar.com`;
    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: "__check__" })
      });
      if (response.status === 404) {
        setError("Couldn't find your Doar account");
      } else if (response.status === 401 || response.ok) {
        setError("");
        setStep(2);
      } else {
        const err = await response.json();
        setError(err.message || "Something went wrong");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  // Handle form submission for login
  // Validates the username and password, then logs in the user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Always reset previous session token for security
    sessionStorage.removeItem("token");

    const isPhone = /^05\d{8}$/.test(formData.username);
    const email = formData.username.includes("@") || isPhone
      ? formData.username
      : `${formData.username}@doar.com`;

    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: formData.password }),
      });
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("token", data.token);  // Use sessionStorage for session-based security
        navigate("/home");
      } else {
        const err = await response.json();
        setError(err.message || "Incorrect username or password");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  // Render the login page
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="row shadow-lg bg-white rounded overflow-hidden"
        style={{ width: "800px", maxWidth: "100%" }}
      >
        {/* Left column – branding */}
        <div className="col-md-6 p-5 d-flex flex-column justify-content-center bg-white text-start">
          <div className="d-flex align-items-center mb-4">
            <img
              src={logo}
              alt="Doar Logo"
              style={{ height: "80px", objectFit: "contain", marginRight: "10px" }}
            />
          </div>
          <h3 className="fw-semibold">Sign in</h3>
          <p className="text-muted">with your Doar account to continue</p>
        </div>
        {/* Right column – form */}
        <div className="col-md-6 p-5 bg-white">
          <form onSubmit={step === 1 ? handleNext : handleSubmit} style={{ marginTop: "7rem" }}>
            {step === 1 && (
              <>
                <input
                  type="text"
                  name="username"
                  className={`form-control mb-2 ${error ? "is-invalid" : ""}`}
                  placeholder="Email or phone"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                {error && <div className="text-danger mb-3">{error}</div>}
                <div className="d-flex justify-content-between align-items-center">
                  <NavLink to="/register" className="btn btn-link px-0">Create account</NavLink>
                  <button type="submit" className="btn btn-primary">Next</button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <p className="mb-2 fw-bold">
                  {/^05\d{8}$/.test(formData.username)
                    ? formData.username
                    : formData.username.includes("@")
                      ? formData.username
                      : `${formData.username}@doar.com`}
                </p>
                <input
                  type="password"
                  name="password"
                  className={`form-control mb-2 ${error ? "is-invalid" : ""}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {error && <div className="text-danger mb-3">{error}</div>}
                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary">Log In</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
