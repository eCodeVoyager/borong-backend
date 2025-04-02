
const authController = require("./controllers/authController");
const authRoutes = require("./routes/authRoutes");
const authService = require("./services/authService");
const authValidation = require("./validations/authValidation");

module.exports = {
  authController,
  authRoutes,
  authService,
  authValidation,
};
