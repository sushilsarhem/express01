const express = require("express");
const router = express.Router();
const {
  changePicture,
  fecthPicture,
  changeInfo,
  FindUser,
  FetchUserDetails,
  makeFriends,
  ifConnected,
  fetchFriendsWithPost,
  followingFriendList,
  followerFriendList,
  fetchAbout,
} = require("../controllers/userController");
const uploadFile = require("../middleware/cloudinary");

router.post("/change-pro-picture", uploadFile, changePicture);
router.get("/fetch-pro-picture", fecthPicture);
router.post("/change-info", changeInfo);
router.post("/find-user", FindUser);
router.get("/fetch-pro-info", FetchUserDetails);
router.post("/make-friends", makeFriends);
router.get("/fetch-friends-following", followingFriendList);
router.get("/fetch-friends-follower", followerFriendList);

router.get("/fetch-friends-post", fetchFriendsWithPost);
router.get("/if-connected", ifConnected);
router.get("/fetch-about", fetchAbout);

module.exports = router;
