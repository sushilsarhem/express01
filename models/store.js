const mongoose = require("mongoose");

const storeConfigSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  storename: {
    type: String,
  },
  district: {
    type: String,
  },
  address: {
    type: String,
  },
  pincode: {
    type: String,
  },
  image_public_id: {
    type: String,
    // required: true,
  },
  image_url: {
    type: String,
    // required: true,
  },
  thumbnail: {
    type: String,
    // required: true,
  },
});

const productSchema = new mongoose.Schema({
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  image_public_id: {
    type: String,
    required: true,
  },
  image_url: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
});

const Store = mongoose.model("StoreConfig", storeConfigSchema);
const Product = mongoose.model("Product", productSchema);
module.exports = { Store, Product };
