const { User, ProfileImage, MakeFriend } = require("../models/user");
const { PicturePost } = require("../models/post");
const cloudinary = require("cloudinary").v2;

// Controller function to change the profile picture
const changePicture = async (req, res) => {
  const _id = req.body._id;
  const image_url = req.image_uri;
  const image_public_id = req.image_public_id;
  console.log("user info:", _id);

  try {
    if (_id && image_url) {
      //check if the user id is valid
      const userValid = await User.findById(_id);
      if (!userValid) {
        return res.status(404).json({ message: "User not found" });
      }
      // if user is valid then check if profile picture already exist
      const picture_exist = await ProfileImage.findOne({ user_id: _id });
      console.log("picture retrieved:", picture_exist);
      if (picture_exist && picture_exist.image_url) {
        // if already exists, the picture should updated and delete the previous picture
        const existing_picture_id = picture_exist.image_public_id;
        // delete from cloudinary
        if (existing_picture_id) {
          try {
            await cloudinary.uploader.destroy(existing_picture_id);
            console.log("Previous existing picture removed from Cloudinary!");
          } catch (err) {
            console.warn(
              "Failed to delete old image from Cloudinary:",
              err.message
            );
          }
        }
        picture_exist.image_url = image_url;
        picture_exist.image_public_id = image_public_id;
        await picture_exist.save();
        console.log("image updated successfully!");
        return res.status(200).json({ message: "image updated successfully!" });
      } else {
        // create a new image if no picture exists

        const profile_pic = await ProfileImage.create({
          user_id: _id,
          image_url,
          image_public_id,
        });
        console.log("new image uploaded successfully!");
        return res
          .status(200)
          .json({ message: "image uploaded successfully!" });
      }
    }
    // console.log("logging image url from controller:", image_url);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// fetching profile picture
const fecthPicture = async (req, res) => {
  const _id = req.query._id;

  try {
    const result = await ProfileImage.findOne({ user_id: _id });
    if (!result) {
      return res.status(404).json({ message: "No profile picture found" });
    }
    const image_uri = result.image_url;
    return res.status(200).json({ image_url: image_uri });
  } catch (error) {
    console.log("Error fetching profile picture:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const changeInfo = async (req, res) => {
  const { _id, label, value } = req.body;
  console.log("received data for change:", _id, label, value);
  try {
    const userValid = await User.findById(_id);
    console.log("the existing user is:", userValid[label]);

    if (!userValid) {
      return res.status(404).json({ message: "User not found" });
    }
    userValid[label] = value;
    await userValid.save();
    return res
      .status(200)
      .json({ message: `${label} updated successfully`, label, value });
  } catch (error) {
    console.log("Error in changeInfo:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const FindUser = async (req, res) => {
  const inputData = req.body.input;
  console.log("search route reached", inputData);
  const dataList = [];
  try {
    const users = await User.find({
      $or: [{ firstname: inputData }, { lastname: inputData }],
    });
    if (users.length === 0) {
      console.log("no ID found");
      return res.status(200).json(dataList);
    }

    const _id = users[0]._id.toString(); //found user ID
    for (const user of users) {
      const picData = await ProfileImage.findOne({ user_id: user._id });
      dataList.push({
        _id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        image_url: picData?.image_url || null, // fallback to null if not found
      });
    }

    // console.log("Match result:", users);
    // console.log("Matched pic:", image_uri);
    console.log("Found users:", dataList);

    return res.status(200).json(dataList);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "something went wrong" });
  }
};

const FetchUserDetails = async (req, res) => {
  const _id = req.query._id;

  console.log("info endpoint");
  try {
    const user = await User.findById(_id);

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "something went wrong" });
  }
};

const ifConnected = async (req, res) => {
  console.log("if-connected");

  const { senderId, receiverId } = req.query;
  if (!senderId || !receiverId) {
    return res.status(400).json({ message: "invalid parameters" });
  }
  try {
    const ifAlreadyFriends = await MakeFriend.findOne({
      user_id: senderId,
      friend_id: receiverId,
    });
    if (ifAlreadyFriends) {
      return res.status(200).json({ success: true, alreadyFriends: true });
    } else {
      return res.status(500).json({ success: true, alreadyFriends: false });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

const makeFriends = async (req, res) => {
  console.log("make friends");
  const { senderId, receiverId } = req.body;
  console.log(senderId, receiverId);
  if (!senderId || !receiverId) {
    return res.status(400).json({ message: "invalid parameters" });
  }
  try {
    // disconnect if already connected
    const ifAlreadyFriends = await MakeFriend.findOne({
      user_id: senderId,
      friend_id: receiverId,
    });
    if (ifAlreadyFriends) {
      const deleteFriend = await MakeFriend.findOneAndDelete({
        user_id: senderId,
        friend_id: receiverId,
      });
      console.log("deleted data:", deleteFriend);

      return res.status(200).json({ success: true, alreadyFriends: false });
    }

    const receivingUser = await User.findById(receiverId);
    if (!receivingUser) {
      return res.status(400).json({ message: "something went wrong" });
    }
    const result = await MakeFriend.create({
      user_id: senderId,
      friend_id: receiverId,
    });
    return res.status(200).json({
      success: true,
      message: "Friend added successfully",
      data: result,
      alreadyFriends: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

const fetchFriendsWithPost = async (req, res) => {
  console.log("fetchFriends:", req.query._id);

  const _id = req.query._id; // current user ID

  try {
    // 1. Find all friends of the user
    const friends = await MakeFriend.find({ user_id: _id });

    // include user's own posts too
    const friendIds = friends.map((friend) => friend.friend_id.toString());
    friendIds.push(_id); // include current user

    const posts = await PicturePost.find({
      user_id: { $in: friendIds },
      albumType: "timeline",
    }).sort({ createdAt: -1 });

    // 2. For each post, get user info and profilePic
    const mergedData = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findById(post.user_id);
        const pic = await ProfileImage.findOne({ user_id: post.user_id });

        return {
          ...post.toObject(),
          profilePic: pic?.image_url || null,
          firstname: user?.firstname || "Unknown",
          lastname: user?.lastname || "",
        };
      })
    );
    console.log(mergedData);

    return res.status(200).json({ posts: mergedData });
  } catch (error) {
    console.error("Error in getTimelinePosts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const followingFriendList = async (req, res) => {
  const _id = req.query._id; // current user ID
  console.log("Fetching friend list for:", _id);

  try {
    // 1. Find all friend connections
    const friends = await MakeFriend.find({ user_id: _id });

    // 2. Extract friend IDs
    const friendIds = friends.map((f) => f.friend_id.toString());

    // 3. Fetch user info and profile pic for each friend
    const friendDetails = await Promise.all(
      friendIds.map(async (friendId) => {
        const user = await User.findById(friendId);
        const pic = await ProfileImage.findOne({ user_id: friendId });

        if (!user) return null;

        return {
          user_id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          profilePic: pic?.image_url || null,
        };
      })
    );

    // 4. Filter out nulls (e.g. missing users)
    const filteredFriends = friendDetails.filter(Boolean);

    return res.status(200).json({ friends: filteredFriends });
  } catch (error) {
    console.error("Error in friendList:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const followerFriendList = async (req, res) => {
  console.log("follower");
  const _id = req.query._id; // current user ID
  console.log("Fetching follower list for:", _id);

  try {
    // 1. Find all friend connections
    const friends = await MakeFriend.find({ friend_id: _id });

    // 2. Extract friend IDs
    const friendIds = friends.map((f) => f.user_id.toString());

    // 3. Fetch user info and profile pic for each friend
    const friendDetails = await Promise.all(
      friendIds.map(async (friendId) => {
        const user = await User.findById(friendId);
        const pic = await ProfileImage.findOne({ user_id: friendId });

        if (!user) return null;

        return {
          user_id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          profilePic: pic?.image_url || null,
        };
      })
    );

    // 4. Filter out nulls (e.g. missing users)
    const filteredFriends = friendDetails.filter(Boolean);

    return res.status(200).json({ friends: filteredFriends });
  } catch (error) {
    console.error("Error in friendList:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const fetchAbout = async (req, res) => {
  const _id = req.query._id;
  try {
    const result = await User.findById(_id);
    console.log("Users about:", result.about);
    return res.status(200).json(result.about);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  changePicture,
  fecthPicture,
  changeInfo,
  FindUser,
  FetchUserDetails,
  makeFriends,
  fetchFriendsWithPost,
  ifConnected,
  followingFriendList,
  followerFriendList,
  fetchAbout,
};
