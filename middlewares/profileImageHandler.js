import fs from "fs/promises";
import path from "path";
import User from "../models/user.js";

const profileImageHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;

    //get user
    const user = await User.findById(userId);

    if (!user || !user.profilePic) {
      return next();
    }

    //if the user has default image , do not delete
    if (user.profilePic.includes("/images/defaultProfile.webp")) {
      return next();
    }

    //get absolute url
    const imageUrl = path.join(process.cwd(), "public", user.profilePic);

    try {
      await fs.unlink(imageUrl);
    } catch (err) {
      if (err.code != "ENOENT") {
        throw err;
      }
    }

    next();
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export default profileImageHandler;
