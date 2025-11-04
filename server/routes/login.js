import crypto from "crypto";
import { UserModel } from "../database/users.js";

export function routeLogin(req, res) {
  res.render("accounts/login");
}

export async function login(req, res) {
  const { username, password } = req.body;
  const user = await UserModel.findOne({ username });

  if(!user){
    return res.render("accounts/login", {exist: false});
  }

  if (user.password !== password) {
    return res.render("accounts/login", {exist: false});
  }

  const token = crypto.randomBytes(60).toString("base64url");
  user.token = token;
  await user.save();

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24,
  });

  return res.redirect("/calendar/week")
}