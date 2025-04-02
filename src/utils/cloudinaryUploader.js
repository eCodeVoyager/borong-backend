const fs = require("fs");
const cloudinary = require("../config/cloudinary");

/**
 * Uploads a file to Cloudinary.
 * @param {string} filePath - The path to the file.
 * @param {Object} options - Options for Cloudinary upload (e.g., resource_type).
 * @returns {Promise<Object>} The promise object that represents the Cloudinary response.
 */
const uploadFile = (filePath, options = {}) => {
  const upload = cloudinary.uploader.upload(filePath, options);
  return upload.then((result) => {
    fs.unlinkSync(filePath);
    return result;
  });
};

/**
 * Uploads multiple files to Cloudinary.
 * @param {Array} files - Array of file paths.
 * @param {Object} options - Options for Cloudinary upload (e.g., resource_type).
 * @returns {Promise<Array>} The promise object that represents the array of Cloudinary responses.
 */
const uploadMultipleFiles = (files, options = {}) => {
  const uploadPromises = files.map((file) => uploadFile(file.path, options));
  Promise.all(uploadPromises).then(() => {
    files.forEach((file) => {
      fs.unlinkSync(file.path);
    });
  });
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
};
