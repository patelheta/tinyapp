const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail, urlsForUser, getUserLogin, getUserById, generateRandomString } = require("./helpers");
const { urlDatabase, users } = require("./database");
const { loginBeforeShortenUrlErrorResponse, loginRequireErrorResponse, accessDeniedError, idDoesNotExistError, invalidShortenUrlResponse } = require("./errorConstants");

const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey'],
}));
app.set("view engine", "ejs");

// ******************************************************************


// Shortening url index page
app.get("/urls", (req, res) => {
  let userId = req.session["user_id"];
  if (!userId) {
    return res.send(loginRequireErrorResponse);
  } else {
    const templateVars = { user: users[userId], urls: urlsForUser(userId, urlDatabase) };
    res.render("urls_index", templateVars);
  }
});
//POST : Create new url.
app.post("/urls", (req, res) => {
  let userId = req.session["user_id"];
  if (!userId) {
    return res.send(loginBeforeShortenUrlErrorResponse);
  } else {
    let id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.session["user_id"]
    };
    res.redirect(`/urls/${id}`);
  }
});

// GET : Create new url page.
app.get("/urls/new", (req, res) => {
  let userId = req.session["user_id"];
  if (!userId) {
    return res.redirect('/login');
  } else {
    const templateVars = { user: undefined };
    res.render("urls_new", templateVars);
  }
});
// Show your shorten url.
app.get("/urls/:id", (req, res) => {
  let userId = req.session["user_id"];
  if (!userId) {
    return res.send(loginRequireErrorResponse);
  } else {
    if (!urlDatabase[req.params.id]) {
      return res.send(invalidShortenUrlResponse);
    }
    if (urlDatabase[req.params.id]["userID"] !== userId) {
      return res.send(accessDeniedError);
    }
    const templateVars = { user: users[userId], id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
    res.render("urls_show", templateVars);
  }
});

// longURL redirection page.
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send(idDoesNotExistError);
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// POST : Delete existing url request.
app.post("/urls/:id/delete", (req, res) => {
  let userId = req.session["user_id"];
  if (!userId) {
    return res.send(loginRequireErrorResponse);
  } else {
    if (!urlDatabase[req.params.id]) {
      return res.send(invalidShortenUrlResponse);
    }
    if (urlDatabase[req.params.id]["userID"] !== userId) {
      return res.send(accessDeniedError);
    }
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

// POST : Update existing url request.
app.post("/urls/:id", (req, res) => {
  let userId = req.session["user_id"];
  if (!userId) {
    return res.send(loginRequireErrorResponse);
  } else {
    if (!urlDatabase[req.params.id]) {
      return res.send(invalidShortenUrlResponse);
    }
    if (urlDatabase[req.params.id]["userID"] !== userId) {
      return res.send(accessDeniedError);
    }
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});


// Register ************************************

// Return registration page.
app.get("/register", (req, res) => {
  let userId = req.session["user_id"];
  if (userId) {
    return res.redirect('/urls');
  } else {
    const templateVars = { user: undefined };
    res.render("user_register", templateVars);
  }
});

// Register new user.
app.post("/register", (req, res) => {
  if (!req.body.email && !req.body.password) {
    return res.status(400).send("Invalid Input");
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("Email already exist");
  }
  let id = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id: id,
    email: req.body.email,
    password: hashedPassword,
  };
  req.session['user_id'] = id;
  res.redirect("/urls");
});


// Login ***************************************
// Return login page.
app.get("/login", (req, res) => {
  if (getUserById(req.session["user_id"], users)) {
    return res.redirect("/urls");
  }
  const templateVars = { user: undefined };
  res.render("user_login", templateVars);
});

// Login existing user.
app.post("/login", (req, res) => {
  if (!getUserByEmail(req.body.email, users)) {
    return res.status(403).send("Email Address Not Found");
  }
  let userEmailPass = getUserLogin(req.body.email, req.body.password, users);
  if (!userEmailPass) {
    return res.status(403).send("Invalid Password!");
  }
  req.session['user_id'] = userEmailPass.id;
  res.redirect("/urls");
});

// Logout user.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
// Redirect user to home page.
app.get("/", (req, res) => {
  let userId = req.session["user_id"];
  if (!userId) {
    return res.redirect('/login');
  } else {
    return res.redirect('/urls');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});