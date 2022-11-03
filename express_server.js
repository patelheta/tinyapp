const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
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

const users = {
  userRandomID: {
    id: "aJ48lW",
    email: "test@user.com",
    password: "123",
  }
};

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 7);
};

const getUserByEmail = function(email) {
  for (let key in users) {
    if (users[key]["email"] === email) {
      return true;
    }
  }
  return false;
};

const getUserById = function(id) {
  for (let key in users) {
    if (users[key]["id"] === id) {
      return true;
    }
  }
  return false;
};

const getUserLogin = function(email, password) {
  for (let key in users) {
    if (users[key]["email"] === email && users[key]["password"] === password) {
      return users[key];
    }
  }
  return null;
};

const urlsForUser = function(id) {
  let urls = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId]["userID"] === id) {
      urls[urlId] = urlDatabase[urlId];
    }
  }
  return urls;
};

// ******************************************************************

app.get("/urls", (req, res) => {
  let userId = req.cookies["user_id"];
  if (!userId) {
    return res.send(`<html><body>
    <div style="text-align: center; font-size: x-large;
    ">
    Please <b><a href='/login'>Login</a></b> or <b><a href='/register'>Register</a></b>
    </div>
    </body>
    </html>\n`);
  }
  const templateVars = { user: users[userId], urls: urlsForUser(userId) };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!getUserById(req.cookies["user_id"])) {
    return res.send("<html><body>Please login before shorten Urls <b><a href='/login'>Click here to Login</a></b></body></html>\n");
  }
  console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };
  res.redirect(`/urls/${id}`); // Respond with 'Ok' (we will replace this)
});

// Create new URL
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
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
  let userId = req.cookies["user_id"];
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
  let userId = req.cookies["user_id"];
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
  let userId = req.cookies["user_id"];
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
  if (getUserById(req.cookies["user_id"])) {
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


// Login ***************************************

app.get("/login", (req, res) => {
  if (getUserById(req.cookies["user_id"])) {
    return res.redirect("/urls");
  }
  const templateVars = { user: undefined };
  res.render("user_login", templateVars);
});


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

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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