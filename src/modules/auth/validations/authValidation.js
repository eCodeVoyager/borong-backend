//src/modules/auth/validations/authValidation.js

const Joi = require("joi");

const register = {
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      phone: Joi.string(),
      role: Joi.string().hex().length(24).required(),
    })
    .xor("email", "phone"),
};

const login = {
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      phone: Joi.string(),
      password: Joi.string().required(),
    })
    .xor("email", "phone"),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};
const forgotPasswordVerify = {
  body: Joi.object().keys({
    otp: Joi.number().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};
const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
  }),
};

const sendVerificationEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    otp: Joi.number().required(),
    email: Joi.string().email().required(),
  }),
};

const setPassword = {
  body: Joi.object().keys({
    password: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  refreshTokens,
  forgotPassword,
  changePassword,
  verifyEmail,
  forgotPasswordVerify,
  sendVerificationEmail,
  setPassword,
};
