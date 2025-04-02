const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    profileImage: { type: String },
    address: { type: String },
    // user verfication fields
    nidNumber: { type: String },
    nidImage: { type: String },
    birthCertificateNumber: { type: String },
    birthCertificateImage: { type: String },
    birthDate: { type: Date },
    //system generated fields
    password: { type: String, select: false },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String, select: false },
    isActive: { type: Boolean, default: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    messId: { type: mongoose.Schema.Types.ObjectId, ref: "Mess" },
    customPermissions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Permission" },
    ],

    // Soft delete fields
    deletedAt: { type: Date },
    deleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

// Plugins
userSchema.plugin(mongoosePaginate);

/**
 * Automatically filter out deleted users for find queries
 */
userSchema.pre(/^find/, function (next) {
  this.where({ deleted: false });
  next();
});

/**
 * Ensure `updateOne`, `findOneAndUpdate`, and similar methods
 * do not modify deleted users and first find the document
 */
userSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (!doc || doc.deleted) {
    return next(new Error("User not found or has been deleted."));
  }
  next();
});

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

/**
 * Soft delete a user by ID
 */
userSchema.statics.softDeleteById = async function (id) {
  return this.findOneAndUpdate(
    { _id: id, deleted: false },
    { deletedAt: new Date(), deleted: true },
    { new: true }
  );
};

module.exports = mongoose.model("User", userSchema);
