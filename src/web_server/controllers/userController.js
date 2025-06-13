require('dotenv').config();
const jwt = require('jsonwebtoken');
const sessions = require('../models/sessions');
const { addUser, findUserById, getUserByUsername, getAllUsers } = require('../models/userModel');
const { getLoggedInUser } = require('../utils/mailUtils');

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiry = process.env.JWT_EXPIRES_IN || '1d';

let counter = 0;

function generateId() {
  counter++;
  return Date.now().toString(36) + "-" + counter.toString(36);
}

function getUserByPhone(phone) {
  const users = getAllUsers();
  return users.find(u => u.phone === phone);
}

function isValidPassword(password) {
  const length = password.length >= 8;
  const upper = /[A-Z]/.test(password);
  const lower = /[a-z]/.test(password);
  const number = /\d/.test(password);
  const special = /[!@#$%^&*]/.test(password);
  return length && upper && lower && number && special;
}

function registerUser(req, res) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ status: "error", message: "Missing or invalid request body." });
  }

  let {
    firstName,
    lastName,
    username,
    password,
    phone,
    birthday,
    gender,
  } = req.body;

  const profilePictureFile = req.file;
  const picture = profilePictureFile ? `/uploads/${profilePictureFile.filename}` : null;

  // Validate required string fields
  if (!firstName || typeof firstName !== 'string' ||
    !username || typeof username !== 'string' ||
    !password || typeof password !== 'string') {
    return res.status(400).json({ status: "error", message: "Missing or invalid required fields: firstName, username, password." });
  }

  // Auto-complete email domain if missing
  if (!username.includes("@")) {
    username = `${username}@doar.com`;
  }
  username = username.trim().toLowerCase();

  if (!username.endsWith("@doar.com")) {
    return res.status(400).json({ status: "error", message: "Only '@doar.com' emails are allowed for registration." });
  }

  // Allow only known fields
  const allowedFields = ['firstName', 'lastName', 'username', 'password', 'phone', 'birthday', 'gender'];
  for (const key of Object.keys(req.body)) {
    if (!allowedFields.includes(key)) {
      return res.status(400).json({ status: "error", message: `Unexpected field in request: ${key}` });
    }
  }

  // Validate gender value
  if (gender && !["male", "female", "other"].includes(gender.toLowerCase())) {
    return res.status(400).json({ status: "error", message: "Invalid gender. Must be 'male', 'female', or 'other'." });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    return res.status(400).json({ status: "error", message: "Invalid email format." });
  }

  // Validate phone format
  if (phone && !/^05\d{8}$/.test(phone)) {
    return res.status(400).json({ status: "error", message: "Invalid phone number. Use format like 0501234567." });
  }

  // Validate birthday
  if (birthday) {
    const birthDate = new Date(birthday);
    if (isNaN(birthDate) || birthDate > new Date()) {
      return res.status(400).json({ status: "error", message: "Invalid birthday. Must be a past date." });
    }
  }

  // Validate password complexity
  if (!isValidPassword(password)) {
    return res.status(400).json({
      status: "error",
      message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
    });
  }

  // Check for username uniqueness
  if (getUserByUsername(username)) {
    return res.status(409).json({ status: "error", message: "Username (email) is already in use." });
  }

  const newUser = {
    id: generateId(),
    firstName,
    lastName,
    username,
    password,
    picture,
    phone: phone || null,
    birthday: birthday || null,
    gender: gender || null,
    inbox: [],
    sent: [],
    drafts: [],
    labels: [],
    starred: [],
    trash: [],
    spam: []
  };

  addUser(newUser);

  const { password: _, inbox, sent, drafts, labels, starred, trash, spam, ...safeUser } = newUser;
  res.status(201).json({
    status: "success",
    message: "Account created successfully.",
    user: safeUser
  });
}

function loginUser(req, res) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ status: "error", message: "Missing or invalid request body." });
  }

  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: "error", message: "Username and password are required." });
  }

  const phoneRegex = /^05\d{8}$/;
  let user;
  if (phoneRegex.test(username)) {
    user = getUserByPhone(username);
  } else {
    if (!username.includes("@")) {
      username = `${username}@doar.com`;
    }
    user = getUserByUsername(username);
  }

  if (!user) {
    return res.status(404).json({ status: "error", message: "User not found." });
  }

  if (user.password !== password) {
    return res.status(401).json({ status: "error", message: "Incorrect username or password." });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: jwtExpiry });

  return res.status(200).json({
    status: "success",
    message: "Login successful.",
    token,
    username: user.username
  });
}

function getUserById(req, res) {
  const loggedInUser = req.user;
  if (!loggedInUser) return;

  const requestedUserId = req.params.id;
  const requestedUser = findUserById(requestedUserId);

  if (!requestedUser) {
    return res.status(404).json({ error: "User not found." });
  }

  if (loggedInUser.id !== requestedUserId) {
    return res.status(403).json({ error: "Access denied: You can only view your own profile." });
  }

  const cleanMails = (arr) => arr.map(({ id, from, to, subject, bodyPreview, date, time, status }) => ({
    id, from, to, subject, bodyPreview, date, time, status
  }));

  const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const cleanTrash = (requestedUser.trash || [])
    .filter(mail => now - mail.deletedAt < FIFTEEN_DAYS)
    .map(({ deletedAt, ...rest }) => rest);

  const { id, firstName, lastName, username, picture, phone, birthday, labels, gender } = requestedUser;

  res.status(200).json({
    status: "success",
    user: {
      id, firstName, lastName, username, picture, phone, birthday, gender,
      inbox: cleanMails(requestedUser.inbox || []),
      sent: cleanMails(requestedUser.sent || []),
      drafts: cleanMails(requestedUser.drafts || []),
      labels: labels || [],
      starred: requestedUser.starred || [],
      spam: requestedUser.spam || [],
      trash: cleanTrash
    }
  });
}

module.exports = { registerUser, loginUser, getUserById };
