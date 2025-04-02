// src/modules/auth/controllers/authController.js

const jwt = require("../../../utils/jwtToken");
const httpStatus = require("http-status");
const otpGen = require("../../../utils/otpGen");
const ApiError = require("../../../utils/apiError");
const authService = require("../services/authService");
const ApiResponse = require("../../../utils/apiResponse");
const sendEmail = require("../../email/services/emailService");
const userService = require("../../users/services/userService");
const rolesService = require("../../roles/services/roleService");
const authLoggerService = require("../../auth/services/authLoggerService");

const register = async (req, res, next) => {
  try {
    if (req.body.email) {
      const isEmailExist = await userService.getUser({
        email: req.body.email,
      });
      if (isEmailExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
      }
    }
    if (req.body.phone && req.body.phone.length > 0) {
      const isPhoneExist = await userService.getUser({
        phone: req.body.phone,
      });
      if (isPhoneExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Phone already exists");
      }
    }
    const roles = await rolesService.getRole(req.body.role);
    if (!roles) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Role not found");
    }
    if (roles.name === "superAdmin") {
      throw new ApiError(httpStatus.BAD_REQUEST, "Cannot create this role");
    }

    const user = await authService.register(req.body);

    const { accessToken, refreshToken } = jwt.genTokens(user);

    const otp = otpGen();

    await authService.sendVerificationEmail(user, otp);

    await sendEmail(user.email, "Email Verification", "verifyEmail", {
      otp,
    });

    return res.status(httpStatus.CREATED).json(
      new ApiResponse(
        httpStatus.CREATED,
        {
          accessToken,
          refreshToken,
          ...user,
        },
        "User registered successfully and verification email sent"
      )
    );
  } catch (error) {
    return next(error);
  }
};

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

const loginByPhone = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const { phone, password } = req.body;

  try {
    const user = await authService.loginByPhone(phone, password);

    if (!user) {
      await authLoggerService.logAuth({
        userId: null,
        ip,
        method: "phone",
        userAgent,
        success: false,
        message: "Invalid phone number or password",
      });
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials"));
    }

    const { accessToken, refreshToken } = jwt.genTokens(user);

    await authLoggerService.logAuth({
      userId: user._id,
      ip,
      method: "phone",
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
      method: "phone",
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
const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.query.Token;
    const token = jwt.verifyRefreshToken(refreshToken);
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token or expired");
    }
    const user = await authService.refreshToken(refreshToken);
    const { accessToken, newRefreshToken } = jwt.genTokens(user);
    return res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        {
          accessToken,
          refreshToken: newRefreshToken,
        },
        "Token refreshed successfully"
      )
    );
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

const sendVerificationEmail = async (req, res, next) => {
  try {
    let user = await userService.getUser({ email: req.body.email });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found ");
    }
    if (user.isVerified) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already verified");
    }

    const otp = otpGen();
    await authService.sendVerificationEmail(user, otp);
    await sendEmail(user.email, "Email Verification", "verifyEmail", {
      otp,
    });

    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(
          httpStatus.OK,
          null,
          "Verification email sent successfully"
        )
      );
  } catch (error) {
    return next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.body.otp, req.body.email);

    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, null, "Email verified successfully")
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
  register,
  loginByEmail,
  loginByPhone,
  sendForgotPasswordEmail,
  forgotPassword,
  setPassword,
  refreshToken,
  changePassword,
  sendVerificationEmail,
  verifyEmail,
  me,
};
