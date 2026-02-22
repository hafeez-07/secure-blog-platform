import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = decoded;
  next();
};

export default protect;
