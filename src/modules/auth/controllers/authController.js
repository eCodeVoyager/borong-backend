// src/modules/auth/controllers/authController.js

const jwt = require("../../../utils/jwtToken");
const httpStatus = require("http-status");
const otpGen = require("../../../utils/otpGen");
const ApiError = require("../../../utils/apiError");
const authService = require("../services/authService");
const ApiResponse = require("../../../utils/apiResponse");
const sendEmail = require("../../email/services/emailService");
const userService = require("../../users/services/userService");
const authLoggerService = require("../../auth/services/authLoggerService");

const loginByEmail = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const { email, password } = req.body;

  try {
    const user = await authService.loginByEmail(email, password);

    if (!user) {
      await authLoggerService.logAuth({
        userId: null,
        ip,
        method: "email",
        userAgent,
        success: false,
        message: "Invalid email or password",
      });
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials"));
    }

    const { accessToken, refreshToken } = jwt.genTokens(user);

    await authLoggerService.logAuth({
      userId: user._id,
      ip,
      method: "email",
      userAgent,
      success: true,
      message: "Login successful",
    });

    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(
          httpStatus.OK,
          { accessToken, refreshToken, ...user },
          "Login successful"
        )
      );
  } catch (error) {
    await authLoggerService.logAuth({
      userId: null,
      ip,
      method: "email",
      userAgent,
      success: false,
      message: `Internal server error: ${error.message}`,
    });
    return next(error);
  }
};

const sendForgotPasswordEmail = async (req, res, next) => {
  try {
    let user = await userService.getUser({ email: req.body.email });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const otp = otpGen();
    await authService.sendForgotPasswordEmail(user, otp);
    await sendEmail(user.email, "Forgot Password", "resetPassword", {
      name: user.name,
      otp,
    });

    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(
          httpStatus.OK,
          null,
          "Forgot password email sent successfully"
        )
      );
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body);
    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, null, "Password reset successfully")
      );
  } catch (error) {
    return next(error);
  }
};

const setPassword = async (req, res, next) => {
  try {
    const user = await userService.getUser({ _id: req.user._id }, "+password");
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    if (user.password) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password already set");
    }
    user.password = req.body.password;
    const setPassword = await user.save();
    if (!setPassword) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to set password"
      );
    }

    return res
      .status(httpStatus.OK)
      .json(new ApiResponse(httpStatus.OK, null, "Password set successfully"));
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const user = await userService.getUser({ _id: req.user._id }, "+password");
    const changePassword = await user.changePassword(
      req.body.oldPassword,
      req.body.newPassword
    );

    if (!changePassword || changePassword === false) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid password");
    }
    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, null, "Password changed successfully")
      );
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await userService.getUser({ _id: req.user._id });
    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(
          httpStatus.OK,
          user,
          "Logged in user fetched successfully"
        )
      );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  loginByEmail,
  sendForgotPasswordEmail,
  forgotPassword,
  setPassword,
  changePassword,
  me,
};
