const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail } = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "Please provide a valid email"],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      validate: {
        validator: function (v) {
          return /^\+?[0-9\s\-\(\)]{6,}$/.test(v); // Regex to validate 10-digit mobile number
        },
        message: "Please provide a valid mobile number",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Don't include the password in query results
    },

    dateOfBirth: {
      type: String,
      required: [true, "Date of birth is required"],
      validate: {
        validator: function (v) {
          // Optional: Validate format "DD-MM-YYYY"
          return /^\d{1,2}-\d{1,2}-\d{4}$/.test(v);
        },
        message: "Date of birth must be in DD-MM-YYYY format",
      },
    },

    verificationCode: {
      type: String,
      default: "",
      required: false,
      trim: true,
    },
    verificationStatus: {
      type: Boolean,
      default: false,
    },
    verificationAge: {
      type: Date,
      required: false,
    },
    about: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password; // automatically remove password when returning the user
        return ret;
      },
    },
  }
);

const profilePictureSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // optional but helpful for population
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
});

const makeFriendsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // optional but helpful for population
    required: true,
  },
  friend_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

// hash the password here before saving

userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified or if it's a new user
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
const ProfileImage = mongoose.model("ProfileImage", profilePictureSchema);
const MakeFriend = mongoose.model("MakeFriend", makeFriendsSchema);

module.exports = { User, ProfileImage, MakeFriend };
