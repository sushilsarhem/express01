const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postroutes");
const storeRoutes = require("./routes/storeRoutes");
const { verifyToken } = require("./middleware/jsonToken");

const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is live");
});

app.use("/auth", authRoutes);
app.use("/user", verifyToken, userRoutes);
app.use("/post", verifyToken, postRoutes);
app.use("/store", verifyToken, storeRoutes);

app.use("/auth/dashboard", verifyToken, (req, res) => {
  const user = req.user;
  res.send({ message: "you are verified!", user });
});

// database and server setup area
const startConnection = async () => {
  try {
    const connection = await mongoose.connect(process.env.DB_URI);

    console.log(`✅ MongoDB connected: ${connection.connection.host}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server is now live on port: ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB.");
    console.error("Error message:", error.message);
    process.exit(1);
  }
};

startConnection();
