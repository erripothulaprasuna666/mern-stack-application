const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
 {
 name: { type: String, required: [true, "Name is required"], trim: true },
 email: {
 type: String,
 required: [true, "Email is required"],
 unique: true,
 lowercase: true,
 trim: true,
 },
 password: {
 type: String,
 required: [true, "Password is required"],
 minlength: [6, "Password must be at least 6 characters"],
 select: false, // do not send the password when reading users
 },
 },
 { timestamps: true } // adds createdAt and updatedAt automatically
);
// Runs before saving: hash the password if it is new or changed
userSchema.pre("save", async function () {
 if (!this.isModified("password")) return;
 this.password = await bcrypt.hash(this.password, 10);
});
// Compare the typed password with the hashed one
userSchema.methods.matchPassword = function (enteredPassword) {
 return bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model("User", userSchema);

