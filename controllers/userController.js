import User from "../models/user.js";
import Post from "../models/post.js";
import fs from "fs/promises";
import path from "path";

export const getHome = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("posts");
    res.render("home", { user });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.render("profile", { user });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const profileUpdate = async (req, res) => {
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
};

export const profileUpload = async (req, res) => {
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
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    //if user is not logged in

    if (!userId) {
      return res.status(400).json({
        error: "Please log in first",
      });
    }

    //remove likes user gave
    await Post.updateMany(
      { likes: userId },
      {
        $pull: { likes: userId },
      },
    );

    //deleted users post
    await Post.deleteMany({ user: userId });

    //delete user's stored profile

    //get profile name
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    const profileImage = user.profilePic;

    if (profileImage && !profileImage.includes("defaultProfile.webp")) {
      try {
        const imagePath = path.join(process.cwd(), "public", profileImage);
        await fs.unlink(imagePath);
      } catch (err) {
        console.log("could not delete image", err.message);
      }
    }

    await User.findByIdAndDelete(userId);

    res.redirect("/logout");
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
