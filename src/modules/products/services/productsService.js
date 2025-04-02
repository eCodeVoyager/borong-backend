const productModel = require("../models/productsModel");

const createProduct = async (body) => {
  try {
    const product = await productModel.create(body);
    return product;
  } catch (error) {
    throw error;
  }
};

const getProducts = async (filter, options) => {
  try {
    const products = await productModel.paginate(filter, options);
    return products;
  } catch (error) {
    throw error;
  }
};

const getProduct = async (productId) => {
  try {
    const product = await productModel.findById(productId);
    return product;
  } catch (error) {
    throw error;
  }
};

const updateProduct = async (productId, body) => {
  try {
    const product = await productModel.findByIdAndUpdate(productId, body, {
      new: true,
    });
    return product;
  } catch (error) {
    throw error;
  }
};
const deleteProduct = async (productId) => {
  try {
    const product = await productModel.findByIdAndDelete(productId);
    return product;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
