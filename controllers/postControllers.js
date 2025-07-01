const { PicturePost } = require("../models/post");

const cloudinary = require("cloudinary").v2;

const uploadPicture = async (req, res) => {
  console.log("album type:", req.body.albumtype);

  const _id = req.body._id;
  const albumType = req.body.albumtype;
  const image_uri = req.image_uri;
  const image_public_id = req.image_public_id;
  const thumbnail = req.image_thumb;
  console.log("album type:", albumType);

  try {
    if (!_id && !image_uri && !albumType) {
      return res.status(400).json({ message: "invalid parameters" });
    }
    const newPost = new PicturePost({
      user_id: _id,
      albumType,
      image_public_id,
      image_url: image_uri,
      thumbnail: thumbnail,
    });
    await newPost.save();
    return res.status(200).json({ message: "Posted successfully!" });
  } catch (error) {
    console.log(error);
  }
};

const fetchAllPost = async (req, res) => {
  const _id = req.query._id; // user ID
  const albumType = req.query.albumType;
  console.log(_id);
  console.log("album type:", albumType);

  try {
    const allPost = await PicturePost.find({
      user_id: _id,
      albumType: albumType,
    });

    if (!allPost || allPost.length === 0) {
      return res.status(200).json({ message: "no posts found!", allPost: [] });
    }

    // console.log("fetching all post :", allPost);
    return res.status(200).json({ message: "Fetching success", allPost });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "There was an error fetching post" });
  }
};

const deletePost = async (req, res) => {
  const _id = req.body._id;
  const user_id = req.body.user_id;
  console.log("you hit delete", _id, user_id);

  if (!_id || !user_id) {
    return res.status(400).json({ message: "Missing _id or user_id" });
  }

  try {
    const result = await PicturePost.findOneAndDelete({
      _id,
      user_id,
    });
    await cloudinary.uploader.destroy(result.image_public_id);
    console.log("Previous existing picture removed from Cloudinary!");
    if (!result) {
      return res
        .status(404)
        .json({ message: "Post not found or not authorized" });
    }
    console.log("deleted data:", result);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { uploadPicture, fetchAllPost, deletePost };
