const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: [
      "fruit",
      "vegetable",
      "dairy",
      "poachery",
      "mushroom",
      "nut",
      "grain",
    ],
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
