const bcrypt = require("bcryptjs");
const e = require("express");


const getUserByEmail = function(email, database) {
  if (!email) {
    return false;
  }
  for (let key in database) {
    if (database[key]["email"] === email) {
      return true;
    }
  }
  return false;
};

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 7);
};

const getUserById = function(id, users) {
  if (!id) {
    return false;
  }
  for (let key in users) {
    if (users[key]["id"] === id) {
      return true;
    }
  }
  return false;
};

const getUserLogin = function(email, password, users) {
  if (!email && !password) {
    return null;
  }
  for (let key in users) {
    if (users[key]["email"] === email && bcrypt.compareSync(password, users[key]["password"])) {
      return users[key];
    }
  }
  return null;
};

const urlsForUser = function(id, urlDatabase) {
  let urls = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId]["userID"] === id) {
      urls[urlId] = urlDatabase[urlId];
    }
  }
  return urls;
};

module.exports = { getUserByEmail, urlsForUser, getUserLogin, getUserById, generateRandomString };