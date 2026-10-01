const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = async (req, res, next) => {
 try {
 let token;
 const header = req.headers.authorization;
 if (header && header.startsWith("Bearer ")) {
 token = header.split(" ")[1];
 }
 if (!token) {
 return res.status(401).json({ message: "Not authorized, no token" });
 }
 const decoded = jwt.verify(token, process.env.JWT_SECRET);
 const user = await User.findById(decoded.id);
 if (!user) {
 return res.status(401).json({ message: "User no longer exists" });
 }
 req.user = user; // available in every controller after this
 next();
 } catch (error) {
 res.status(401).json({ message: "Not authorized, token failed" });
 }
};
module.exports = { protect };

