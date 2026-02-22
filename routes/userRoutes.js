import express from "express";
const router = express.Router();
import {
  getHome,
  getProfile,
  profileUpdate,
  profileUpload,
} from "../controllers/userController.js";

import protect from "../middlewares/protect.js";
import uploads from "../middlewares/uploadMiddleware.js";

router.get("/home", protect, getHome);
router.get("/profile", protect, getProfile);
router.post("/profile/update", protect, profileUpdate);
router.post(
  "/profile/uploadImage",
  protect,
  uploads.single("profilePic"),
  profileUpload,
);

export default router;
