// src/modules/users/services/userService.js

const userModel = require("../models/userModel");

const getUser = async (filter, select) => {
  try {
    return await userModel
      .findOne(filter)
      .select(select)
      .populate([
        {
          path: "role",
          select: "name",
        },
        {
          path: "customPermissions",
          select: "name",
        },
      ]);
  } catch (error) {
    throw error;
  }
};

const getUserWithPermissions = async (id) => {
  try {
    return await userModel
      .findById(id)
      .populate({
        path: "role",
        populate: {
          path: "permissions",
        },
      })
      .populate("customPermissions");
  } catch (error) {
    throw error;
  }
};

const getUsers = async (filter, options) => {
  try {
    return await userModel.paginate(filter, options);
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, user) => {
  try {
    return await userModel.findByIdAndUpdate(id, user, {
      new: true,
    });
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    return await userModel.softDeleteById(id);
  } catch (error) {
    throw error;
  }
};

const removeRoleFromUsers = async (roleId) => {
  try {
    return await userModel.updateMany(
      { role: roleId },
      { $unset: { role: "" } }
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  removeRoleFromUsers,
  getUserWithPermissions,
};
