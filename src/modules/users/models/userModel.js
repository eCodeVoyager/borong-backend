const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String },
    password: { type: String, select: false },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

/**
 * Password hashing before saving the user
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Check if the password is valid
 */
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * Change password securely
 */
userSchema.methods.changePassword = async function (oldPassword, newPassword) {
  const isValid = await this.comparePassword(oldPassword);
  if (!isValid) return false;

  this.password = newPassword;
  await this.save();

  return true;
};

module.exports = mongoose.model("User", userSchema);
