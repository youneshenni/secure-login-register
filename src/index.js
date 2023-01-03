const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
const { z } = require("zod");
const { validateRequestBody } = require("zod-express-middleware");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const exists = fs.existsSync("./data.json");
if (!exists) {
  fs.writeFileSync("./data.json", JSON.stringify([]));
}

const app = express();

app.use(bodyParser.urlencoded());

app.use(express.static("src/static"));
app.set("view engine", "ejs");
app.set("views", "src/views");

app.use(cookieParser());

app.get("/", (req, res) => {
  return res.render("index");
});

app.get("/login", (req, res) => {
  res.redirect("/login.html");
});

// const authMiddleware = (req, res, next) => {
//   const cookie = req.cookies.name;
//   if (!cookie) return res.status(401).send("Unauthorized");
//   try {
//     const payload = jwt.verify(cookie, "SEAu-zRvN");
//     req.user = payload;
//     return next();
//   } catch (e) {
//     return res.status(403).send("Hacker detected");
//   }
// };

app.post("/login", (req, res) => {
  try {
    const buffer = fs.readFileSync("./data.json");
    const data = JSON.parse(buffer.toString());
    const { email, password } = req.body;
    const user = data.find(
      (user) =>
        user.email === email && bcrypt.compareSync(password, user.password)
    );
    if (user) {
      res.cookie("name", jwt.sign(user.name, "SEAu-zRvN"));
      res.redirect("/bienvenue");
    } else res.render("register", { error: "Email ou mot de passe incorrect" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
  res.redirect("/login.html");
});

app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

app.post("/register", (req, res) => {
  try {
    const { name, email, password } = req.body;
    const buffer = fs.readFileSync("./data.json");
    const data = JSON.parse(buffer.toString());
    fs.writeFileSync(
      "./data.json",
      JSON.stringify([
        ...data,
        { name, email, password: bcrypt.hashSync(password, 10) },
      ])
    );
    res.redirect("/");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/bienvenue", (req, res) => {
  if (!req.cookies.name) res.redirect("/");
  try {
    res.render("bienvenue", {
      name: jwt.verify(req.cookies.name, "SEAu-zRvN"),
    });
  } catch (e) {
    return res.status(403).send("Hacker detected");
  }
});

app.get("/logout", (req, res) => {
  currentUser = null;
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
