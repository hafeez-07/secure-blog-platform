import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: Number,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  profilePic: { type: String, default: "/images/uploads/defaultProfile.webp" },
});

const User = mongoose.model("User", userSchema);
export default User;
