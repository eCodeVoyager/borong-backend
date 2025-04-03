const productService = require("../services/productsService");
const ApiResponse = require("../../../utils/apiResponse");
const ApiError = require("../../../utils/apiError");
const httpStatus = require("http-status");

const getAllProducts = async (req, res, next) => {
  const filter = {};
  const options = {
    page: req.query.page || 1,
    limit: req.query.limit || 10,
    sort: req.query.sort || "-createdAt",
  };
  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: "i" };
  }
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.price) {
    const priceRange = req.query.price.split("-");
    filter.price = { $gte: priceRange[0], $lte: priceRange[1] };
  }

  try {
    const products = await productService.getProducts(filter, options);
    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(
          httpStatus.OK,
          products,
          "Products fetched successfully"
        )
      );
  } catch (error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return res
      .status(httpStatus.CREATED)
      .json(
        new ApiResponse(
          httpStatus.CREATED,
          product,
          "Product created successfully"
        )
      );
  } catch (error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProduct(req.params.id);
    if (!product) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Product not found"));
    }
    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, product, "Product fetched successfully")
      );
  } catch (error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Product not found"));
    }
    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, product, "Product updated successfully")
      );
  } catch (error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) {
      return next(new ApiError(httpStatus.NOT_FOUND, "Product not found"));
    }
    return res
      .status(httpStatus.OK)
      .json(
        new ApiResponse(httpStatus.OK, null, "Product deleted successfully")
      );
  } catch (error) {
    return next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message));
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};
