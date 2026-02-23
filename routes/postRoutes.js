import express from "express";
const router = express.Router();

import protect from "../middlewares/protect.js";
import {
  postBlog,
  allBlog,
  deleteBlog,
  editBlog,
  updateBlog,
  likeBlog,
} from "../controllers/postController.js";

router.post("/post", protect, postBlog);
router.get("/blogs", protect, allBlog);
router.get("/delete/:postId", protect, deleteBlog);
router.get("/edit/:postId", protect, editBlog);
router.post("/update/:postId", protect, updateBlog);
router.get("/like/:postId", protect, likeBlog);

export default router;
