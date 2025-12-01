
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "profile_images",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        public_id: (req, file) => {
            return `profile_${Date.now()}`;
        },
    },
});

const upload = multer({ storage });

module.exports = upload;
