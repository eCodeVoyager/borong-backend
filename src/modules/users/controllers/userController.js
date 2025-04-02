// src /modules/users/controllers/userController.js

const httpStatus = require("http-status");
const userService = require("../services/userService");
const ApiResponse = require("../../../utils/apiResponse");
const ApiError = require("../../../utils/apiError");
const { uploadFile } = require("../../../utils/cloudinaryUploader");

const getUsersByMess = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, name, ...filters } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: [
        { path: "role", select: "name" },
        { path: "customPermissions", select: "name" },
      ],
      sort: "-createdAt",
    };

    const query = {
      messId: req.params.messId,
      ...(name && { name: { $regex: name, $options: "i" } }),
      ...filters,
    };

    const users = await userService.getUsers(query, options);

    if (!users?.docs?.length) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Users not found"));
    }

    res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, "Users retrieved successfully", users)
      );
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, name, ...filters } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: [
        { path: "role", select: "name" },
        { path: "customPermissions", select: "name" },
      ],
      sort: "-createdAt",
    };

    const query = {
      ...(name && { name: { $regex: name, $options: "i" } }),
      ...filters,
    };

    const users = await userService.getUsers(query, options);

    res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, "Users retrieved successfully", users)
      );
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUser(req.params.id);
    if (!user) {
      return next(new ApiError(httpStatus.NOT_FOUND, "User not found "));
    }
    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, "User retrieved successfully", user)
      );
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (req.file) {
      const result = await uploadFile(req.file.path, {
        folder: "users",
        public_id: `user-${user._id}`,
      });
      user.profileImage = result.secure_url;
      await user.save();
    }
    return res
      .status(httpStatus.OK)
      .json(new ApiResponse(httpStatus.OK, "User updated successfully", user));
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return res
      .status(httpStatus.OK)
      .json(new ApiResponse(httpStatus.OK, "User deleted successfully"));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  getUsersByMess,
  updateUser,
  deleteUser,
};
