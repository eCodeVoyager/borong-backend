const authLoggerModel = require("../model/authLoggerModel");

const logAuth = async ({ userId, ip, method, userAgent, success, message }) => {
  try {
    return authLoggerModel.create({
      user: userId ? userId : null,
      ip: ip || null,
      userAgent: userAgent || null,
      logInBy: method || "email",
      successful: success || false,
      message: message || "Unknown error",
    });
  } catch (error) {
    console.error("Error logging auth attempt:", error);
    throw new Error("Logging failed");
  }
};

module.exports = {
  logAuth,
};
