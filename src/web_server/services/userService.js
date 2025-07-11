const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiry = process.env.JWT_EXPIRES_IN || '1d';

const User = require('../models/userModel');

const getUserByPhone = async (phone) => {
  return await User.findOne({ phone }).lean();
};

function isValidPassword(password) {
  const length = password.length >= 8;
  const upper = /[A-Z]/.test(password);
  const lower = /[a-z]/.test(password);
  const number = /\d/.test(password);
  const special = /[!@#$%^&*]/.test(password);
  return length && upper && lower && number && special;
}

async function registerUserService(userData, profilePictureFile) {
  const {
    firstName,
    lastName,
    username: rawUsername,
    password,
    phone,
    birthday,
    gender
  } = userData;

  let username = rawUsername;

  // Validate required string fields
  if (!firstName || typeof firstName !== 'string' ||
    !username || typeof username !== 'string' ||
    !password || typeof password !== 'string') {
    throw { status: 400, message: 'Missing or invalid required fields: firstName, username, password.' };
  }

  // Auto-complete email
  if (!username.includes('@')) {
    username = `${username}@doar.com`;
  }
  username = username.trim().toLowerCase();

  if (!username.endsWith('@doar.com')) {
    throw { status: 400, message: "Only '@doar.com' emails are allowed for registration." };
  }

  const allowedFields = ['firstName', 'lastName', 'username', 'password', 'phone', 'birthday', 'gender'];
  for (const key of Object.keys(userData)) {
    if (!allowedFields.includes(key)) {
      throw { status: 400, message: `Unexpected field in request: ${key}` };
    }
  }

  if (gender && !["male", "female", "other", "prefer_not_to_say"].includes(gender.toLowerCase())) {
    throw { status: 400, message: 'Invalid gender.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(username)) {
    throw { status: 400, message: 'Invalid email format.' };
  }

  if (phone && !/^05\d{8}$/.test(phone)) {
    throw { status: 400, message: 'Invalid phone number. Use format like 0501234567.' };
  }

  if (birthday) {
    const birthDate = new Date(birthday);
    if (isNaN(birthDate) || birthDate > new Date()) {
      throw { status: 400, message: 'Invalid birthday. Must be a past date.' };
    }
  }

  if (!isValidPassword(password)) {
    throw {
      status: 400,
      message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
    };
  }

  const existing = await User.findOne({ username }).lean();
  if (existing) {
    throw { status: 409, message: 'Username (email) is already in use.' };
  }

  const picture = profilePictureFile ? `/uploads/${profilePictureFile.filename}` : null;

  const user = new User({
    firstName,
    lastName,
    username,
    password,
    phone: phone || null,
    birthday: birthday || null,
    gender: gender || null,
    picture
  });

  await user.save();

  const { password: _, ...safeUser } = user.toObject();
  return safeUser;
}


async function loginUserService({ username, password }) {
  if (!username || !password) {
    throw { status: 400, message: "Username and password are required." };
  }

  const phoneRegex = /^05\d{8}$/;
  let user;

  if (phoneRegex.test(username)) {
    user = await User.findOne({ phone: username }).lean();
  } else {
    if (!username.includes('@')) {
      username = `${username}@doar.com`;
    }
    username = username.trim().toLowerCase();
    user = await User.findOne({ username }).lean();
  }

  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  if (user.password !== password) {
    throw { status: 401, message: "Incorrect username or password." };
  }

  const token = jwt.sign({ id: user._id, username: user.username }, jwtSecret, {
    expiresIn: jwtExpiry
  });

  return { token, username: user.username };
}

async function getUserByIdService(requestedUserId, loggedInUserId) {
  const user = await User.findById(requestedUserId).lean();
  if (!user) {
    throw { status: 404, message: 'User not found.' };
  }

  if (requestedUserId !== loggedInUserId) {
    throw { status: 403, message: 'Access denied: can only view your own profile.' };
  }

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    picture: user.picture || null,
    phone: user.phone || null,
    birthday: user.birthday || null,
    gender: user.gender || null
  };
}
async function findUserById(id) {
  // very simple lookup; returns null if not found
  return await User.findById(id).lean();
}

module.exports = {
  getUserByPhone,
  isValidPassword,
  loginUserService,
  getUserByIdService,
  registerUserService,
  findUserById
};