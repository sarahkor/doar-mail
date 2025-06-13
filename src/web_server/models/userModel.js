const users = [];

const addUser = (user) => users.push(user);
const findUserById = (id) => users.find(u => u.id === id);
const getUserByUsername = (username) => {
  const clean = username.trim().toLowerCase();
  return users.find(u => u.username.toLowerCase() === clean);
};
const getAllUsers = () => users;

module.exports = { addUser, findUserById, getUserByUsername, getAllUsers };