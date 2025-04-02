const Joi = require("joi");

const updateUser = {
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string().min(9).max(14),
    address: Joi.string(),
    role: Joi.string().hex().length(24),
    isActive: Joi.boolean(),
    customPermissions: Joi.array().items(Joi.string().hex().length(24)),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    page: Joi.number().min(1),
    limit: Joi.number().min(1),
    name: Joi.string(),
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

module.exports = {
  updateUser,
  getUsers,
  deleteUser,
};
