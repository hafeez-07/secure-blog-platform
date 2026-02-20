import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import connectDb from "./models/db.js";
import User from "./models/user.js";
import Post from "./models/post.js";

import { fileURLToPath } from "url";
import { match } from "assert";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import uploads from "./config/multerConfig.js";

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

connectDb();

const protect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = decoded;
  next();
};

//register form
app.get("/", (req, res) => {
  res.render("index");
});

//register user
app.post("/register", async (req, res) => {
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
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
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
});

app.get("/home", protect, async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId).populate("posts");
  res.render("home", { user });
});

app.post("/post", protect, async (req, res) => {
  try {
    const content = req.body.content;
    const userId = req.user.id;
    const user = await User.findById(userId);
    const newPost = await Post.create({
      user: user._id,
      content,
    });
    await User.findByIdAndUpdate(userId, {
      $push: { posts: newPost._id },
    });
    res.status(200).redirect("/home");
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/blogs", protect, async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  const posts = await Post.find().populate("user", " _id username profilePic");
  res.render("blogs", { posts, user });
});

app.get("/post/:id", protect, async (req, res) => {
  try {
    const postId = req.params.id;
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!postId) {
      res.status(400).json({
        msg: `No post with id :${postid} exist`,
      });
    }
    res.redirect("/home");
  } catch (err) {
    res.json(500).json({
      error: err.message,
    });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.get("/edit/:postId", protect, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    res.render("edit", { post });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/update/:postId", protect, async (req, res) => {
  try {
    const postId = req.params.postId;
    const { content } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(postId, { content });
    res.redirect("/home");
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

//like
app.get("/like/:id", protect, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({
        err: "Could not find post",
      });
    }

    if (post.likes.some((id) => id.toString() === userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.redirect(req.get("Referer") || "/blogs");
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/profile", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.render("profile", { user });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/profile/upload", protect, (req, res) => {
  try {
    res.render("profileUpload");
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post(
  "/profile/uploadImage",
  protect,
  uploads.single("profilePic"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({
          error: "please log in",
        });
      }
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
        });
      }
      const user = await User.updateOne(
        { _id: userId },
        {
          profilePic: `/images/uploads/${req.file.filename}`,
        },
      );

      res.redirect("/profile");
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  },
);

app.post(
  "/profile/update",
  protect,

  async (req, res) => {
    try {
      const userId = req.user.id;

      const { username, name, email, age } = req.body;

      const updatedUser = await User.updateOne(
        { _id: userId },
        {
          username,
          name,
          email,
          age,
        },
      );

      res.redirect("/profile");
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.listen(process.env.PORT || 3000, () => {
  console.log("App running in localhost:3000");
});
