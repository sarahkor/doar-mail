const users = [];

const addUser = (user) => users.push(user);
const findUserById = (id) => users.find(u => u.id === id);
const getUserByUsername = (username) => users.find(u => u.username === username);
const getAllUsers = () => users;

module.exports = { addUser, findUserById, getUserByUsername, getAllUsers };