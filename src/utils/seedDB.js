require("dotenv").config();
const {
  permissionModel,
  actionModel,
} = require("../modules/permissions/models/permissionModel");
const Role = require("../modules/roles/models/roleModel");
const permissionsData = require("../config/Permissions");
const prePermissions = require("../config/prePermissions");
const User = require("../modules/users/models/userModel");
const ConnectDB = require("../config/db");

ConnectDB();

const seedPermissions = async () => {
  try {
    await actionModel.deleteMany();
    await permissionModel.deleteMany();

    const permissions = await Promise.all(
      permissionsData.map(async (permission) => {
        const actions = await actionModel.insertMany(permission.actions);
        const actionIds = actions.map((action) => action._id);

        const newPermission = new permissionModel({
          resource: permission.resource,
          actions: actionIds,
        });

        await newPermission.save();
        return newPermission;
      })
    );

    return permissions;
  } catch (error) {
    console.error("Error seeding permissions:", error);
    throw error;
  }
};

const seedUsers = async () => {
  try {
    await User.deleteMany();
    const superAdminRole = await Role.findOne({ name: "superAdmin" });

    const superAdmin = new User({
      name: "Default Super Admin",
      email: "defaultsuperadmin@system.com",
      password: "system404",
      role: superAdminRole._id,
    });

    await superAdmin.save();

    console.log("Users seeded successfully.");
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

const seedRolesAndUsers = async () => {
  try {
    await seedPermissions();
    const allActions = await actionModel.find();

    const roles = Object.entries(prePermissions).map(
      ([roleName, rolePermissions]) => {
        const permissions = rolePermissions.flatMap((permissionConfig) => {
          return allActions
            .filter(
              (action) =>
                action.resource === permissionConfig.resource &&
                permissionConfig.actions.includes(action.action)
            )
            .map((action) => action._id);
        });

        return {
          name: roleName,
          permissions,
        };
      }
    );

    for (const role of roles) {
      await Role.findOneAndUpdate(
        { name: role.name },
        { $set: role },
        { upsert: true, new: true }
      );
    }

    console.log("Roles and permissions seeded successfully.");
    await seedUsers();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding roles:", error);
    process.exit(1);
  }
};

seedRolesAndUsers();
