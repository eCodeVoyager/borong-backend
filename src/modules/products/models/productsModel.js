const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseDelete = require("mongoose-delete");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    brand: {
      type: String,
    },
    color: {
      type: String,
    },
    size: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    stock: {
      type: Number,
    },
    category: {
      type: String,
    },
  },
  { timestamps: true }
);

const queryMiddleware = function () {
  this.where({ deleted: false });
};

productSchema.plugin(mongoosePaginate);
productSchema.plugin(mongooseDelete, {
  overrideMethods: "all",
  deletedAt: true,
  deletedBy: true,
  validateBeforeDelete: false,
});

const methods = [
  "find",
  "findOne",
  "findOneAndUpdate",
  "findById",
  "findByIdAndUpdate",
  "findByIdAndDelete",
];

methods.forEach((method) => {
  productSchema.pre(method, queryMiddleware);
});

productSchema.methods.softDelete = async function (productId) {
  try {
    const product = await this.findById(productId);
    if (!product) return null;

    await product.delete();
    return product;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("Product", productSchema);
