const httpStatus = require("http-status");
const otpModel = require("../../auth/model/otpModel");
const ApiError = require("../../../utils/apiError");
const userModel = require("../../users/models/userModel");

const loginByEmail = async (email, password) => {
  try {
    let user = await userModel.findOne({ email }, "+password");

    if (!user || user.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect email & password");
    }
    user = user.toObject();
    delete user.password;

    return user;
  } catch (error) {
    throw error;
  }
};

const sendForgotPasswordEmail = async (user, otp) => {
  try {
    await otpModel.deleteMany({ userId: user._id });
    const otpInfo = await otpModel.create({ otp: otp, userId: user._id });
    return otpInfo;
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (body) => {
  try {
    const otpInfo = await otpModel
      .findOne({ otp: body.otp })
      .populate("userId");

    if (!otpInfo) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP ");
    }

    const user = otpInfo.userId;

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    if (user.email !== body.email) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
    }

    user.password = body.password;
    await user.save();
    await otpModel.findByIdAndDelete(otpInfo._id);

    return user;
  } catch (error) {
    throw error;
  }
};
const getUser = async (query, select = "") => {
  try {
    const user = await userModel.findOne(query).select(select).lean();
    return user || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Unable to fetch user");
  }
};

module.exports = {
  loginByEmail,
  sendForgotPasswordEmail,
  forgotPassword,
  getUser,
};
