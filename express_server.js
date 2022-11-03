const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");



const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 7);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});


///register---
app.get("/register", (req, res) => {
  const templateVars = { user: undefined };
  res.render("user_register", templateVars);
});

const getUserByEmail = function(email) {
  for (let key in users) {
    if (users[key]["email"] === email) {
      return true;
    }
  }
  return false;
};
app.post("/register", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  if (!req.body.email && !req.body.password) {
    return res.status(400).send("Invalid Input");
  }
  if (getUserByEmail(req.body.email)) {
    return res.status(400).send("Email already exist");
  }
  let id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie('user_id', id);
  res.redirect("/urls");
});

//login---
app.get("/login", (req, res) => {
  const templateVars = { user: undefined };
  res.render("user_login", templateVars);
});
const getUserLogin = function(email, password) {
  for (let key in users) {
    if (users[key]["email"] === email && users[key]["password"] === password) {
      return users[key];
    }
  }
  return null;
};

app.post("/login", (req, res) => {
  if (!getUserByEmail(req.body.email)) {
    return res.status(403).send("Email Address Not Found");
  }
  let userEmailPass = getUserLogin(req.body.email, req.body.password);
  if (!userEmailPass) {
    return res.status(403).send("Invalid Password!");
  }
  res.cookie('user_id', userEmailPass.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});



app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let userId = req.cookies["user_id"];
  const templateVars = { user: users[userId], id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  let userId = req.cookies["user_id"];
  const templateVars = { user: users[userId], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
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