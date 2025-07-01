const { User } = require("../models/user");
const { createToken, expiresAge } = require("../middleware/jsonToken");
const bcrypt = require("bcrypt");
const generateCode = require("../middleware/generateVerificationCode");
const { transporter } = require("../middleware/mailer");

const signup = async (req, res) => {
  console.log("BODY RECEIVED:", req.body);

  const { firstname, lastname, email, mobile, password, dateOfBirth } =
    req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Save the user
    const newUser = await User.create({
      firstname,
      lastname,
      email,
      mobile,
      password,
      dateOfBirth,
    });
    if (newUser) {
      const token = createToken(newUser._id);
      const verificationCode = generateCode();
      newUser.verificationCode = verificationCode;
      await newUser.save();

      // res.status(201).json({
      //   message: "User created successfully",
      //   _id: newUser._id,
      //   email: newUser.email,
      //   token,
      // });
      res.status(201).json({
        message: "User created successfully",
        _id: newUser._id,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        mobile: newUser.mobile,
        dateOfBirth: newUser.dateOfBirth,
        token,
      });

      // Send verification email
      try {
        const info = await transporter.sendMail({
          from: process.env.NODE_MAILER_SENDER_EMAIL,
          to: email,
          subject: "Verification Code",
          html: `<h1>${verificationCode}</h1>`,
        });
        newUser.verificationAge = new Date();
        await newUser.save();

        console.log("Verification email sent:", info.response);
      } catch (mailError) {
        console.error("Error sending email:", mailError);
        return res
          .status(500)
          .json({ message: "Error sending verification email" });
      }
    }

    console.log("returned value from backend signup:", newUser);

    // console.log({ token: token });

    // res.cookie("jwt", token, {
    //   httpOnly: true,
    //   maxAge: expiresAge * 1000,
    //   sameSite: "Lax",
    // }); // For web clients

    // Send success response
  } catch (error) {
    // ValidationError
    if (error.name === "ValidationError") {
      // Extracting only fields with errors
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }

      console.log(Object.values(errors));

      return res.status(400).json({ errors });
    }

    // Other unexpected errors
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, "login pwd:", password);

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw Error("no user found for the email!");

    const verified = await bcrypt.compare(password, user.password);
    console.log(verified);
    console.log("saved passsword:", user.password);

    if (!verified) throw Error("incorrect password!");

    if (user && verified) {
      const token = createToken(user._id);
      res.status(201).json({
        message: "Signin successfull",
        _id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        mobile: user.mobile,
        dateOfBirth: user.dateOfBirth,
        token,
      });
    }
    // console.log("signin success");

    // return res.status(200).json({ user: user._id, message: "signin success" }); // ✅ return here to prevent further execution
  } catch (error) {
    console.log(error.message);

    return res.status(400).json({ error: error.message });

    // Other unexpected errors
    // res.status(500).json({ message: "Server error", error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { _id, code } = req.body;
  console.log(_id, code);

  try {
    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { verificationCode, verificationStatus, verificationAge } =
      existingUser;

    if (verificationStatus) {
      return res
        .status(400)
        .json({ success: false, message: "You are already verified!" });
    }

    console.log("verificationAge:", verificationAge);
    console.log("Date.now():", Date.now());
    console.log(
      "verificationAge.getTime():",
      new Date(verificationAge).getTime()
    );
    console.log(
      "difference:",
      Date.now() - new Date(verificationAge).getTime()
    );

    if (Date.now() - new Date(verificationAge).getTime() > 5 * 60 * 1000) {
      console.log("code expired");

      return res
        .status(400)
        .json({ success: false, message: "Code has expired!" });
    }
    console.log(
      "checing for date format:",
      Date.now(),
      new Date(verificationAge).getTime()
    );

    if (verificationCode === code) {
      existingUser.verificationStatus = true;
      existingUser.verificationAge = undefined;
      existingUser.verificationCode = undefined;

      await existingUser.save(); // 🔥 This was missing

      console.log("CODE MATCHED");
      return res.status(200).json({ status: true, message: "Email verified!" });
    } else {
      console.log("Invalid code");
      return res.status(400).json({ status: false, message: "Invalid code!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports = { signup, signin, verifyEmail };
