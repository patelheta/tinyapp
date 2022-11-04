const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail, urlsForUser, getUserLogin, getUserById, generateRandomString } = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey'],
  // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {};

// ******************************************************************

app.get("/urls", (req, res) => {
  let userId = req.session["user_id"];
  if (!getUserById(userId, users)) {
    return res.send(`<html><body>
    <div style="text-align: center; font-size: x-large;
    ">
    Please <b><a href='/login'>Login</a></b> or <b><a href='/register'>Register</a></b>
    </div>
    </body>
    </html>\n`);
  }
  const templateVars = { user: users[userId], urls: urlsForUser(userId, urlDatabase) };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!getUserById(req.session["user_id"], users)) {
    return res.send("<html><body>Please login before shorten Urls <b><a href='/login'>Click here to Login</a></b></body></html>\n");
  }
  console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  };
  res.redirect(`/urls/${id}`); // Respond with 'Ok' (we will replace this)
});

// Create new URL
app.get("/urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect('/login');
  }
  const templateVars = { user: undefined };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send(`<html><body>
    <div style="text-align: center; font-size: x-large;
    ">
    Invalid shorten url. Please recheck!
    </div>
    </body>
    </html>\n`);
  }
  let userId = req.session["user_id"];
  if (!userId) {
    return res.send(`<html><body>
    <div style="text-align: center; font-size: x-large;
    ">
    Please <b><a href='/login'>Login</a></b> or <b><a href='/register'>Register</a></b>
    </div>
    </body>
    </html>\n`);
  }
  if (urlDatabase[req.params.id]["userID"] !== userId) {
    return res.send(`<html><body>
    <div style="text-align: center; font-size: x-large;
    ">
    Do not have access to this Url
    </div>
    </body>
    </html>\n`);
  }
  const templateVars = { user: users[userId], id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  res.render("urls_show", templateVars);
});

// longURL redirect
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("<html><body>Requested Id doesn't Exist</body></html>\n");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// Delete
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send(`<html><body>
    <div style="text-align: center; font-size: x-large;
    ">
    Invalid shorten url. Please recheck!
    </div>
    </body>
    </html>\n`);
  }
  let userId = req.session["user_id"];
  if (!userId) {
    return res.send(`<html><body>
    <div style="text-align: center; font-size: x-large;
    ">
    Please <b><a href='/login'>Login</a></b> or <b><a href='/register'>Register</a></b>
    </div>
    </body>
    </html>\n`);
  }
  if (urlDatabase[req.params.id]["userID"] !== userId) {
    return res.send(`<html><body>
    <div style="text-align: center; font-size: x-large;
    ">
    Do not have access to this Url
    </div>
    </body>
    </html>\n`);
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Update
app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send(`<html><body>
    <div style="text-align: center; font-size: x-large;
    ">
    Invalid shorten url. Please recheck!
    </div>
    </body>
    </html>\n`);
  }
  let userId = req.session["user_id"];
  if (!userId) {
    return res.send(`<html><body>
    <div style="text-align: center; font-size: x-large;
    ">
    Please <b><a href='/login'>Login</a></b> or <b><a href='/register'>Register</a></b>
    </div>
    </body>
    </html>\n`);
  }
  if (urlDatabase[req.params.id]["userID"] !== userId) {
    return res.send(`<html><body>
    <div style="text-align: center; font-size: x-large;
    ">
    Do not have access to this Url
    </div>
    </body>
    </html>\n`);
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});


// Register ************************************

app.get("/register", (req, res) => {
  if (getUserById(req.session["user_id"], users)) {
    return res.redirect("/urls");
  }
  const templateVars = { user: undefined };
  res.render("user_register", templateVars);
});


app.post("/register", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  if (!req.body.email && !req.body.password) {
    return res.status(400).send("Invalid Input");
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("Email already exist");
  }
  let id = generateRandomString();
  const password = req.body.password; // found in the req.body object
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id: id,
    email: req.body.email,
    password: hashedPassword,
  };
  console.log(users);
  req.session['user_id'] = id;
  res.redirect("/urls");
});


// Login ***************************************

app.get("/login", (req, res) => {
  if (getUserById(req.session["user_id"], users)) {
    return res.redirect("/urls");
  }
  const templateVars = { user: undefined };
  res.render("user_login", templateVars);
});


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

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/", (req, res) => {
  res.send("Hello TinyApp!");
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