const productsController = require("./controllers/productsController");
const productsModel = require("./models/productsModel");
const productsRoutes = require("./routes/productsRoutes");
const productsService = require("./services/productsService");
const productsValidation = require("./validations/productsValidation");

module.exports = {
  productsController,
  productsModel,
  productsRoutes,
  productsService,
  productsValidation,
};
