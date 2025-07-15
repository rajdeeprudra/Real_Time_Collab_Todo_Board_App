const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ msg: "User not found." });

    req.user = {
      id: user._id.toString(),
      name: user.username, 
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token." });
  }
};

module.exports = auth;
