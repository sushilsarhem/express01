const mongoose = require("mongoose");

const picturePostSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // optional but helpful for population
      required: true,
    },
    albumType: {
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
  },
  {
    timestamps: true, // ✅ this is required for createdAt & updatedAt
  }
);

const PicturePost = mongoose.model("PicturePost", picturePostSchema);

module.exports = { PicturePost };
