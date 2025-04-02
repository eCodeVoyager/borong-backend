const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

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

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Product", productSchema);
