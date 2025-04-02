//src/modules/auth/routes/authRoutes.js

const router = require("express").Router();
const authController = require("../controllers/authController");
const authValidation = require("../validations/authValidation");
const validate = require("../../../middleware/validatorMiddleware");
const authenticate = require("../../../middleware/authMiddleware");

router.post(
  "/register",
  validate(authValidation.register),
  authController.register
);

router.post(
  "/login/email",
  validate(authValidation.login),
  authController.loginByEmail
);

router.post(
  "/login/phone",
  validate(authValidation.login),
  authController.loginByPhone
);

router.post(
  "/refresh-tokens",
  validate(authValidation.refreshTokens),
  authController.refreshToken
);

router.post(
  "/forgot-password",
  validate(authValidation.forgotPassword),
  authController.sendForgotPasswordEmail
);

router.post(
  "/set-password",
  authenticate,
  validate(authValidation.setPassword),
  authController.setPassword
);

router.post(
  "/forgot-password-verify",
  validate(authValidation.forgotPasswordVerify),
  authController.forgotPassword
);

router.post(
  "/change-password",
  authenticate,
  validate(authValidation.changePassword),
  authController.changePassword
);

router.post(
  "/send-verify-email",
  validate(authValidation.sendVerificationEmail),
  authController.sendVerificationEmail
);

router.post(
  "/verify-email",
  validate(authValidation.verifyEmail),
  authController.verifyEmail
);

router.get("/me", authenticate, authController.me);

module.exports = router;
