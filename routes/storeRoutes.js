const express = require("express");
const router = express.Router();
const {
  storeConfig,
  fetchStore,
  addProduct,
  fetchProducts,
  deletProduct,
  findStore,
  storeBanner,
} = require("../controllers/storeControllers");
const uploadFile = require("../middleware/cloudinary");

router.post("/store-config", storeConfig);
router.post("/store-banner", uploadFile, storeBanner);
router.get("/fetch-store", fetchStore);
router.post("/add-product", uploadFile, addProduct);
router.get("/fetch-products", fetchProducts);
router.post("/delete-product", deletProduct);
router.post("/find-store", findStore);

module.exports = router; // ✅ NOT `{ router }`
