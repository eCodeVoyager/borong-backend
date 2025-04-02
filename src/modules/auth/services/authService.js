const httpStatus = require("http-status");
const otpModel = require("../../auth/model/otpModel");
const userService = require("../../users/services/userService");
const ApiError = require("../../../utils/apiError");
const userModel = require("../../users/models/userModel");

const register = async (body) => {
  try {
    let user = await userModel.create(body);
    user = user.toObject();
    return user;
  } catch (error) {
    throw error;
  }
};

const loginByEmail = async (email, password) => {
  try {
    let user = await userService.getUser({ email }, "+password");
    console.log(user);

    if (!user || user.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const isMatch = await user.comparePassword(password);
    console.log(isMatch);
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

const loginByPhone = async (phone, password) => {
  try {
    let user = await userService.getUser({ phone }, "+password");
    if (!user || user.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect phone & password");
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

const refreshToken = async (refreshToken) => {
  try {
    const user = await userService.getUsers({ refreshToken });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const sendVerificationEmail = async (user, otp) => {
  try {
    const existingOtp = await otpModel.findOne({ userId: user._id });
    if (existingOtp) {
      await otpModel.findByIdAndDelete(existingOtp._id);
    }
    const otpInfo = await otpModel.create({ otp: otp, userId: user._id });

    return otpInfo;
  } catch (error) {
    throw error;
  }
};

const verifyEmail = async (otp, email) => {
  try {
    const otpInfo = await otpModel.findOne({ otp }).populate("userId");

    if (!otpInfo) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP ");
    }

    const user = otpInfo.userId;

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid OTP");
    }

    if (user.email !== email) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
    }

    user.isVerified = true;

    await user.save();

    await otpModel.findByIdAndDelete(otpInfo._id);

    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  loginByEmail,
  loginByPhone,
  sendForgotPasswordEmail,
  forgotPassword,
  refreshToken,
  sendVerificationEmail,
  verifyEmail,
};
