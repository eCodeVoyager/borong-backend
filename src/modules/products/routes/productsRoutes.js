const router = require("express").Router();
const productController = require("../controllers/productsController");
const authenticate = require("../../../middleware/authMiddleware");
const validator = require("../../../middleware/validatorMiddleware");
const productValidation = require("../validations/productsValidation");

router.post(
  "/",
  authenticate,
  validator(productValidation.createProduct),
  productController.createProduct
);

router.get("/", productController.getAllProducts);

router.get("/:id", productController.getProduct);

router.put(
  "/:id",
  authenticate,
  validator(productValidation.updateProduct),

  productController.updateProduct
);

router.delete(
  "/:id",
  authenticate,
  validator(productValidation.deleteProduct),
  productController.deleteProduct
);

module.exports = router;
