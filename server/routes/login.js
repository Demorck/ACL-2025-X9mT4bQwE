import fs from "fs";
import crypto from "crypto";

const db = "./server/database/accounts.json";

export function routeLogin(req, res) {
  res.render("login/login");
}

export function login(req, res) {
  const { username, password } = req.body;
  const user = getUser(username);
  if (user.password !== password) {
    return res.status(401).json({ status:"failed" });
  }

  const token = crypto.randomBytes(60).toString("base64url");
  setToken(user.login, token);

  return res.status(200).json({ status:"succes", token:token });
}

function getUser(login) {
  const users = JSON.parse(fs.readFileSync(db, "utf8"));
  for (const user of users) {
    if (user.login === login) return user;
  }
  return null;
}

function setToken(login, token) {
  const users = JSON.parse(fs.readFileSync(db, "utf8"));
  for (let i = 0; i < users.length; i++) {
    if (users[i].login === login) {
      users[i].token = token;
      fs.writeFileSync(db, JSON.stringify(users, null, 2), "utf8");
      return true;
    }
  }
  return false;
}
