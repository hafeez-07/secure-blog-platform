import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

//register user
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, age } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    //check if user already exist
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        msg: "User already exist , please login",
      });
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
    const token = jwt.sign(
      { id: createdUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });

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
      return res.status(400).json({
        error: "User does not exist , please sign up",
      });
    }

    //if he is present , match password

    const isMatch = await bcrypt.compare(password, user.password);

    //if password does not match
    if (!isMatch) {
      return res.status(400).json({
        error: "Password mismatch , try again",
      });
    }

    //create a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });

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
  res.redirect("/");
};
