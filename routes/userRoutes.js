import express from "express";
const router = express.Router();
import {
  deleteUser,
  getHome,
  getProfile,
  profileUpdate,
  profileUpload,
} from "../controllers/userController.js";

import protect from "../middlewares/protect.js";
import uploads from "../middlewares/uploadMiddleware.js";
import profileImageHandler from "../middlewares/profileImageHandler.js";

router.get("/home", protect, getHome);
router.get("/profile", protect, getProfile);
router.post("/profile/update", protect, profileUpdate);
router.post(
  "/profile/uploadImage",
  protect,
  profileImageHandler,
  uploads.single("profilePic"),
  profileUpload,
);
router.get("/deleteAccount", protect, deleteUser);

export default router;
