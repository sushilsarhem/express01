const jwt = require("jsonwebtoken");

const expiresAge = 5 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expiresAge });
};

const verifyToken = async (req, res, next) => {
  const receivedToken = req.headers.authorization;

  if (!receivedToken || !receivedToken.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, error: "Authorization token missing" });
  }

  try {
    const token = receivedToken.split(" ")[1];
    const jwtVerified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT verified:", jwtVerified);
    req.user = jwtVerified;
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);

    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      details: error.message,
    });
  }
};

module.exports = { createToken, expiresAge, verifyToken };
