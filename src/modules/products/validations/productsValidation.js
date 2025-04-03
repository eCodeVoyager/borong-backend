const Joi = require("joi");

const createProduct = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    "string.base": "Product name must be a string",
    "string.empty": "Product name cannot be empty",
    "string.min": "Product name must be at least 3 characters long",
    "string.max": "Product name must be at most 200 characters long",
    "any.required": "Product name is required",
  }),
  description: Joi.string().min(10).max(10000).required().messages({
    "string.base": "Description must be a string",
    "string.empty": "Description cannot be empty",
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description must be at most 10,000 characters long",
    "any.required": "Description is required",
  }),
  price: Joi.number().min(0).max(1000000000).required().messages({
    "number.base": "Price must be a valid number",
    "number.min": "Price cannot be less than 0",
    "number.max": "Price cannot exceed 1,000,000,000",
    "any.required": "Price is required",
  }),
  category: Joi.string().min(3).max(200).required().messages({
    "string.base": "Category must be a string",
    "string.empty": "Category cannot be empty",
    "string.min": "Category must be at least 3 characters long",
    "string.max": "Category must be at most 200 characters long",
    "any.required": "Category is required",
  }),
  stock: Joi.number().min(0).max(1000000).required().messages({
    "number.base": "Stock must be a valid number",
    "number.min": "Stock cannot be less than 0",
    "number.max": "Stock cannot exceed 1,000,000",
    "any.required": "Stock is required",
  }),
  image: Joi.string().uri().optional().messages({
    "string.base": "Image URL must be a string",
    "string.uri": "Image must be a valid URL",
  }),
  brand: Joi.string().min(2).max(100).optional().messages({
    "string.base": "Brand must be a string",
    "string.min": "Brand must be at least 2 characters long",
    "string.max": "Brand must be at most 100 characters long",
  }),
  color: Joi.string().min(3).max(100).optional().messages({
    "string.base": "Color must be a string",
    "string.min": "Color must be at least 3 characters long",
    "string.max": "Color must be at most 100 characters long",
  }),
  size: Joi.string().min(1).max(50).optional().messages({
    "string.base": "Size must be a string",
    "string.min": "Size must be at least 1 character long",
    "string.max": "Size must be at most 50 characters long",
  }),
  discount: Joi.number().min(0).max(100).optional().messages({
    "number.base": "Discount must be a valid number",
    "number.min": "Discount cannot be less than 0",
    "number.max": "Discount cannot exceed 100",
  }),
});

const updateProduct = createProduct.fork(
  [
    "name",
    "description",
    "price",
    "category",
    "stock",
    "image",
    "brand",
    "color",
    "size",
    "discount",
  ],
  (schema) => schema.optional()
);

const getProduct = Joi.object({
  id: Joi.string().length(24).required().messages({
    "string.base": "Product ID must be a string",
    "string.length": "Product ID must be exactly 24 characters long",
    "any.required": "Product ID is required",
  }),
});

const deleteProduct = Joi.object({
  id: Joi.string().length(24).required().messages({
    "string.base": "Product ID must be a string",
    "string.length": "Product ID must be exactly 24 characters long",
    "any.required": "Product ID is required",
  }),
});

const getProducts = Joi.object({
  page: Joi.number().min(1).optional().messages({
    "number.base": "Page number must be a valid number",
    "number.min": "Page number must be at least 1",
  }),
  limit: Joi.number().min(1).optional().messages({
    "number.base": "Limit must be a valid number",
    "number.min": "Limit must be at least 1",
  }),
  name: Joi.string().min(3).max(200).optional().messages({
    "string.base": "Name must be a string",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be at most 200 characters long",
  }),
  category: Joi.string().min(3).max(200).optional().messages({
    "string.base": "Category must be a string",
    "string.min": "Category must be at least 3 characters long",
    "string.max": "Category must be at most 200 characters long",
  }),
  price: Joi.number().min(0).max(1000000000).optional().messages({
    "number.base": "Price must be a valid number",
    "number.min": "Price cannot be less than 0",
    "number.max": "Price cannot exceed 1,000,000,000",
  }),
});

module.exports = {
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  getProducts,
};
