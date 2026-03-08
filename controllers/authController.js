import User from "../models/user.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

//register user
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, age } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    //check if user already exist
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      if (existingUser.email == email) {
        req.flash("error", "Email already registered");
        return res.redirect("/");
      }
      if (existingUser.username == username) {
        req.flash("error", "Username already taken");
        return res.redirect("/");
      }
    }

    //if he does not exist , create a new user
    const createdUser = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      age,
    });

    //create a token
    generateToken(res, createdUser._id);

    res.redirect("/home");
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

//login user

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    //if user is not present
    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }

    //if he is present , match password

    const isMatch = await bcrypt.compare(password, user.password);

    //if password does not match
    if (!isMatch) {
      req.flash("error", "Invalid username or password");
      return res.redirect("/login");
    }

    //create a token
    generateToken(res, user._id);

    res.redirect("/home");
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

//logout user
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  req.flash("success", "logged out succesfully");
  res.redirect("/login");
};
