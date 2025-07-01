const cloudinary = require("cloudinary").v2;
const path = require("path");

// Function to get current date in "dd-mm-yyyy" format
const getCurrentDate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multer = require("multer");

// Set up multer for handling file upload
const storage = multer.memoryStorage(); // Use memory storage to handle file as buffer

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Only accept images
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Only image files are allowed!");
    }
  },
}).single("images"); // 'file' is the field name in your form

const uploadFile = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ message: err });
    }

    try {
      const albumtype = req.body.albumtype;

      const originalName = path.parse(req.file.originalname).name;
      const uniqueFileName = `${getCurrentDate()}-${originalName}`;
      const aspect_ratio_options = {
        slider: { width: 480, height: 270, a_ratio: "16:9" },
        timeline: { width: 200, height: 200, a_ratio: "1:1" },
        tags: { width: 200, height: 200, a_ratio: "1:1" },
        store: { width: 200, height: 200, a_ratio: "1:1" },
        banner: { width: 480, height: 270, a_ratio: "16:9" },
      };
      const aspect = aspect_ratio_options[albumtype] || {
        width: 200,
        height: 200,
        crop: "fill",
        a_ratio: "1:1",
      };
      console.log("Aspect ratio:", aspect);

      // Upload the image to Cloudinary from the buffer in req.file.buffer
      cloudinary.uploader
        .upload_stream(
          {
            folder: albumtype || "profile_pictures", // Optional folder name in Cloudinary
            public_id: uniqueFileName, // Unique public ID for the user
            resource_type: "image", // This is an image
            // ✅ Add this block for thumbnail
            eager: [
              {
                width: aspect.width,
                height: aspect.height,
                crop: "fill",
                aspect_ratio: aspect.a_ratio,
              },
            ],
          },
          (error, result) => {
            if (error) {
              return res.status(500).send({
                message: "Error uploading image to Cloudinary",
                error,
              });
            }

            // ✅ Log the full result
            console.log("Full Cloudinary upload result:", result);

            // console.log("Cloudinary upload result:", result.secure_url);
            // console.log("Thumbnail URL:", result.eager?.[0]?.secure_url); // ✅ access thumbnail

            req.image_uri = result.secure_url;
            req.image_public_id = result.public_id;
            req.image_thumb = result.eager?.[0]?.secure_url; // ✅ store thumbnail too
            next();
          }
        )
        .end(req.file.buffer); // Pass the image buffer to Cloudinary's upload stream
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      res.status(500).json({ message: "Error uploading image to Cloudinary" });
    }
  });
};

module.exports = uploadFile;
