require('dotenv').config();
const jwt = require('jsonwebtoken');
const sessions = require('../models/sessions');
const { addUser, findUserById, getUserByUsername, getAllUsers } = require('../models/userModel');
const { getLoggedInUser } = require('../utils/mailUtils');

console.log("JWT_SECRET =", process.env.JWT_SECRET);
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

function registerUser(req, res) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      status: "error",
      message: "Missing or invalid request body."
    });
  }

  let {
    firstName,
    lastName,
    username,
    password,
    picture,
    phone,
    birthday,
    gender,
  } = req.body;

  if (!username.includes("@")) {
    username = `${username}@doar.com`;
  }

  if (!username.endsWith("@doar.com")) {
    return res.status(400).json({
      status: "error",
      message: "Only '@doar.com' emails are allowed for registration."
    });
  }

  if (typeof firstName !== 'string' || typeof lastName !== 'string') {
    return res.status(400).json({
      status: "error",
      message: "First name and last name must be strings."
    });
  }

  const allowedFields = ['firstName', 'lastName', 'username', 'password', 'picture', 'phone', 'birthday', 'gender'];
  for (const key of Object.keys(req.body)) {
    if (!allowedFields.includes(key)) {
      return res.status(400).json({
        status: "error",
        message: `Unexpected field in request: ${key}`
      });
    }
  }

  if (!firstName || !lastName || !username || !password) {
    return res.status(400).json({
      status: "error",
      message: "First name, last name, username (email), and password are required."
    });
  }

  if (gender && !["male", "female", "other"].includes(gender.toLowerCase())) {
    return res.status(400).json({
      status: "error",
      message: "Invalid gender. Must be 'male', 'female', or 'other'."
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid email format."
    });
  }

  const exists = getUserByUsername(username);
  if (exists) {
    return res.status(409).json({
      status: "error",
      message: "Username (email) is already in use."
    });
  }

  const phoneRegex = /^05\d{8}$/;
  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid phone number format. Use Israeli mobile format like 0501234567."
    });
  }

  if (birthday) {
    const birthDate = new Date(birthday);
    if (isNaN(birthDate) || birthDate > new Date()) {
      return res.status(400).json({
        status: "error",
        message: "Invalid birthday. Must be a past date in YYYY-MM-DD format."
      });
    }
  }

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
    password,
    picture: picture || null,
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
    return res.status(400).json({
      status: "error",
      message: "Missing or invalid request body."
    });
  }

  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: "error",
      message: "Username and password are required."
    });
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
    return res.status(404).json({
      status: "error",
      message: "User not found."
    });
  }

  if (user.password !== password) {
    return res.status(401).json({
      status: "error",
      message: "Incorrect username or password."
    });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    jwtSecret,
    { expiresIn: jwtExpiry }
  );



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

  const cleanSentMails = requestedUser.sent.map(({ id, from, to, subject, bodyPreview, date, time, status }) => ({
    id, from, to, subject, bodyPreview, date, time, status
  }));

  const cleanReceivedMails = requestedUser.inbox.map(({ id, from, to, subject, bodyPreview, date, time, status }) => ({
    id, from, to, subject, bodyPreview, date, time, status
  }));

  const cleanDraftMails = requestedUser.drafts.map(({ id, from, to, subject, bodyPreview, date, time, status }) => ({
    id, from, to, subject, bodyPreview, date, time, status
  }));

  const { id, firstName, lastName, username, picture, phone, birthday, labels, gender } = requestedUser;

  const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const cleanTrash = (requestedUser.trash || [])
    .filter(mail => now - mail.deletedAt < FIFTEEN_DAYS)
    .map(({ deletedAt, ...rest }) => rest);

  res.status(200).json({
    status: "success",
    user: {
      id, firstName, lastName, username, picture, phone, birthday, gender,
      inbox: cleanReceivedMails,
      sent: cleanSentMails,
      drafts: cleanDraftMails,
      labels,
      starred: requestedUser.starred || [],
      spam: requestedUser.spam || [],
      trash: cleanTrash
    }
  });

}

module.exports = { registerUser, loginUser, getUserById };
