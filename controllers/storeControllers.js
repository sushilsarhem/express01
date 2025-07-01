const { Store, Product } = require("../models/store");
const cloudinary = require("cloudinary").v2;

const fetchStore = async (req, res) => {
  console.log("fetch store route");
  const { _id } = req.query;

  if (!_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const store = await Store.findOne({
      $or: [{ user_id: _id }, { _id: _id }],
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    return res.status(200).json({ message: "Store found", data: store });
  } catch (error) {
    console.error("Error fetching store:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const storeConfig = async (req, res) => {
  console.log("store route");
  console.log("Received body:", req.body);
  const { _id, label, value } = req.body;
  console.log("received data for change:", _id, label, value);
  if (!_id || !label || !value) {
    return res.status(400).json({ message: "invalid Parameters" });
  }
  try {
    let existingStore = await Store.findOne({ user_id: _id });
    if (existingStore) {
      existingStore[label] = value;

      await existingStore.save();

      return res
        .status(200)
        .json({ message: "Store updated", data: existingStore });
    } else {
      const result = await Store.create({
        user_id: _id,
        [label]: value,
      });
      console.log("result:", result);

      return res
        .status(201)
        .json({ message: "Store config saved", data: result });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const storeBanner = async (req, res) => {
  console.log("Store banner");

  const { store_id } = req.body;
  const image_uri = req.image_uri;
  const image_public_id = req.image_public_id;
  const thumbnail = req.image_thumb;

  try {
    if (!store_id || !image_uri || !image_public_id || !thumbnail) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    const store = await Store.findById(store_id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Optional: remove previous image from Cloudinary
    if (store.image_public_id) {
      await cloudinary.uploader.destroy(store.image_public_id);
      console.log("Previous banner image removed from Cloudinary");
    }

    // Update store's banner info
    store.image_url = image_uri;
    store.image_public_id = image_public_id;
    store.thumbnail = thumbnail;

    await store.save();

    return res.status(200).json({
      message: "Banner updated successfully!",
      data: store,
    });
  } catch (error) {
    console.error("Error updating banner:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const addProduct = async (req, res) => {
  console.log("Product route reached");
  const store_id = req.body.store_id;
  // const albumType = req.body.albumtype;
  const image_uri = req.image_uri;
  const image_public_id = req.image_public_id;
  const thumbnail = req.image_thumb;
  // console.log("album type:", albumType);

  try {
    if (!store_id && !image_uri && !albumType) {
      return res.status(400).json({ message: "invalid parameters" });
    }
    const newProduct = new Product({
      store_id: store_id,
      title: req.body.title,
      price: req.body.price,
      // albumType,
      image_public_id,
      image_url: image_uri,
      thumbnail: thumbnail,
    });
    await newProduct.save();
    return res.status(200).json({ message: "Posted successfully!" });
  } catch (error) {
    console.log(error);
  }
};

const fetchProducts = async (req, res) => {
  const { store_id } = req.query;
  console.log("fetch products:", store_id);

  if (!store_id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const products = await Product.find({ store_id: store_id });
    if (!products) {
      return res.status(404).json({ message: "products not found" });
    }
    console.log(products);

    return res.status(200).json({ message: "Products found", data: products });
  } catch (error) {
    console.error("Error fetching store:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const deletProduct = async (req, res) => {
  const { product_id, store_config_id, user_id } = req.body;
  console.log("delete route on store:", product_id, store_config_id);
  if (!product_id || !store_config_id) {
    return res.status(400).json({ message: "Missing product_id or user_id" });
  }
  try {
    const deleted = await Product.findOneAndDelete({
      _id: product_id,
      store_id: store_config_id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });
    }
    if (deleted.image_public_id) {
      await cloudinary.uploader.destroy(deleted.image_public_id);
      console.log("Previous existing picture removed from Cloudinary!");
    }

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const findStore = async (req, res) => {
  const { input } = req.body;
  console.log("find store:", input);
  const dataList = [];
  try {
    const store = await Store.find({
      storename: input,
    });
    if (store.length === 0) {
      console.log("store not found");
      return res.status(200).json(dataList);
    }

    console.log("Found store:", store);

    return res.status(200).json(store);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "something went wrong" });
  }
};

module.exports = {
  storeConfig,
  storeBanner,
  fetchStore,
  addProduct,
  fetchProducts,
  deletProduct,
  findStore,
};
