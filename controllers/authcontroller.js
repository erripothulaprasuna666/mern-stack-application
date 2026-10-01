const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
// POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
 const { name, email, password } = req.body || {};
 if (!name || !email || !password) {
 res.status(400);
 throw new Error("Please provide name, email and password");
 }
 const exists = await User.findOne({ email });
 if (exists) {
 res.status(400);
 throw new Error("User already exists with this email");
 }
 const user = await User.create({ name, email, password });
 res.status(201).json({
 _id: user._id,
 name: user.name,
 email: user.email,
 token: generateToken(user._id),
 });
});
// POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
 const { email, password } = req.body || {};
 if (!email || !password) {
 res.status(400);
 throw new Error("Please provide email and password");
 }
 const user = await User.findOne({ email }).select("+password");
 if (!user || !(await user.matchPassword(password))) {
 res.status(401);
 throw new Error("Invalid email or password");
 }
 res.json({
 _id: user._id,
 name: user.name,
 email: user.email,
 token: generateToken(user._id),
 });
});
// GET /api/auth/me (protected)
const getMe = asyncHandler(async (req, res) => {
 res.json(req.user);
});
module.exports = { registerUser, loginUser, getMe };

