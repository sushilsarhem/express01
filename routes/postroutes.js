const express = require("express");
const router = express.Router();
const {
  uploadPicture,
  fetchAllPost,
  deletePost,
} = require("../controllers/postControllers");
const uploadFile = require("../middleware/cloudinary");

router.post("/upload-picture", uploadFile, uploadPicture);
router.get("/get-all-post", fetchAllPost);
router.post("/delete-post", deletePost);

module.exports = router;
