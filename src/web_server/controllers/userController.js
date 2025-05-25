const users = require('../models/userModel');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function registerUser(req, res) {
  const {
    firstName,
    lastName,
    username, // email
    password,
    picture,
    phone,
    birthday
  } = req.body;

  // Check required fields
  if (!firstName || !lastName || !username || !password) {
    return res.status(400).json({
      status: "error",
      message: "First name, last name, username (email), and password are required."
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid email format."
    });
  }

  //  Duplicate email check
  const exists = users.some(u => u.username === username);
  if (exists) {
    return res.status(409).json({
      status: "error",
      message: "Username (email) is already in use."
    });
  }

  // Phone validation
  const phoneRegex = /^05\d{8}$/;
  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid phone number format. Use Israeli mobile format like 0501234567."
    });
  }

  // Optional: Birthday validation
  if (birthday) {
    const birthDate = new Date(birthday);
    if (isNaN(birthDate) || birthDate > new Date()) {
      return res.status(400).json({
        status: "error",
        message: "Invalid birthday. Must be a past date in YYYY-MM-DD format."
      });
    }
  }

  // Optional: Password strength
  if (password.length < 6) {
    return res.status(400).json({
      status: "error",
      message: "Password must be at least 6 characters long."
    });
  }

  const newUser = {
    id: generateId(),
    firstName,
    lastName,
    username,
    picture: picture || null,
    phone: phone || null,
    birthday: birthday || null
  };

  users.push({ ...newUser, password });

  res.status(201).json({
    status: "success",
    message: "Account created successfully.",
    user: newUser
  });
}

function loginUser(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: "error",
      message: "Username and password are required."
    });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({
      status: "error",
      message: "Incorrect username or password."
    });
  }

  res.status(200).json({
    status: "success",
    message: "Login successful.",
    token: user.id
  });
}

function getUserById(req, res) {
  const userId = req.params.id;

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found."
    });
  }

  const { id, firstName, lastName, username, picture, phone, birthday } = user;
  res.status(200).json({
    status: "success",
    user: { id, firstName, lastName, username, picture, phone, birthday }
  });
}

module.exports = { registerUser, loginUser, getUserById };
