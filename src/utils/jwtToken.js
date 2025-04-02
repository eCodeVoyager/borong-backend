//src/utils/jwtToken.js

const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    phone: user.phone,
    role: user.role.name,
    messId: user.messId ? user.messId : null,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFE,
  });
};

const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    phone: user.phone,
    role: user.role.name,
    messId: user.messId ? user.messId : null,
  };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_LIFE,
  });
};
const genInviteToken = (user) => {
  const payload = {
    memberId: user.memberId,
    managerId: user.managerId,
    messId: user.messId ? user.messId : null,
    email: user.email,
    phone: user.phone,
    roleId: user.roleId,
  };
  return jwt.sign(payload, process.env.INVITE_TOKEN_SECRET, {
    expiresIn: process.env.INVITE_TOKEN_LIFE,
  });
};
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

const verifyInviteToken = (token) => {
  return jwt.verify(token, process.env.INVITE_TOKEN_SECRET);
};

const genTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
};
module.exports = {
  genTokens,
  genInviteToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyInviteToken,
};
