import Post from "../models/post.js";
import User from "../models/user.js";

//post a blog
export const postBlog = async (req, res) => {
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
};

//read all blogs
export const allBlog = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  const posts = await Post.find().populate("user", " _id username profilePic");
  res.render("blogs", { posts, user });
};

//delete a blog
export const deleteBlog = async (req, res) => {
  try {
    const postId = req.params.postId;
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
};

//edit blog
export const editBlog = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    res.render("edit", { post });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

//update blog
export const updateBlog = async (req, res) => {
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
};

//like blog
export const likeBlog = async (req, res) => {
  try {
    const postId = req.params.postId;
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
};

//get users who liked ur post
export const likedUsers = async (req, res) => {
  try {
    console.log("likedUser cntroller");
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId).populate("likes", "username profilePic");

    console.log(post);

    res.render("likes", { post });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
