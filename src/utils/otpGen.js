//src/utils/otpGen.js

/**
 * Generates a four-digit OTP.
 * @returns {number} - A four-digit OTP.
 *
 */
const otpGen = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

module.exports = otpGen;
