import express from "express";
const router = express.Router();

import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authController.js";

//register form
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

export default router;
