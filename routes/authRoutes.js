const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  verifyEmail,
} = require("../controllers/authControllers");

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/verify-email", verifyEmail);

module.exports = router;
