const httpStatus = require("http-status");
const ApiError = require("../utils/apiError");
const { verifyAccessToken } = require("../utils/jwtToken");
const userService = require("../modules/users/services/userService");

function extractToken(req) {
  return (
    req.cookies?.token ||
    req.headers["authorization"]?.split(" ")[1] ||
    req.headers["x-access-token"] ||
    null
  );
}

/**
 * The authentication middleware.
 * @param {Object} req - The request object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<Object>} The promise object that represents the next middleware function.
 */
const authenticate = async (req, _, next) => {
  const tokenRaw = extractToken(req);

  if (!tokenRaw) {
    return next(
      new ApiError(httpStatus.UNAUTHORIZED, "Access denied. No token provided")
    );
  }

  try {
    const decoded = verifyAccessToken(tokenRaw);
    // Fetch user data only if the token is valid
    const user = await userService.getUser({ _id: decoded.id });

    if (!user) {
      return next(
        new ApiError(httpStatus.UNAUTHORIZED, "Invalid token provided")
      );
    }

    req.user = user;
    next();
  } catch (err) {
    return next(
      new ApiError(httpStatus.UNAUTHORIZED, "Invalid token provided")
    );
  }
};

module.exports = authenticate;
