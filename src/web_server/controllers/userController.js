const { registerUserService, loginUserService, getUserByIdService } = require('../services/userService');
const mongoose = require('mongoose');

exports.registerUser = async (req, res) => {
  try {
    console.log('Received file:', req.file); // Log file info
    const user = await registerUserService(req.body, req.file);
    res.status(201).json({
      status: "success",
      message: "Account created successfully.",
      user
    });
  } catch (err) {
    res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Registration failed."
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { token, username } = await loginUserService(req.body);
    return res.status(200).json({
      status: "success",
      message: "Login successful.",
      token,
      username
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Login failed."
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await getUserByIdService(req.params.id, req.user.id);
    res.status(200).json({ status: 'success', user });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Unexpected error' });
  }
};
