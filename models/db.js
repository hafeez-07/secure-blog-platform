import mongoose from "mongoose";

const connectDb = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("mongoDb connected"))
    .catch(() => console.log("mongoDb connection failed"));
};

export default connectDb;
