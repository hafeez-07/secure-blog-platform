import User from "../models/user.js";

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
