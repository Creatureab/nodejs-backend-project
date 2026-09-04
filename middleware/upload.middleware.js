import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage Engine
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `product-${uniqueSuffix}`;
    }
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 10, // Max 10 files per upload
  },
});

const uploadSingle = upload.single("image");

const uploadMultiple = upload.fields([
  { name: "image", maxCount: 10 },
  { name: "images", maxCount: 10 },
]);

const getFileURL = (file) => {
  if (!file) return null;
  return file.path || file.secure_url || null;
};

// Cloudinary Image Deletion Helper Functions
const getPublicIDFromURL = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/upload/')[1];
    if (!parts) return null;
    const withoutVersion = parts.replace(/^v\d+\//, '');
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

const deleteCloudinaryImage = async (url) => {
  const publicId = getPublicIDFromURL(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary destroy failed:", error.message);
  }
};

const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: req.t("fileSizeLimit5MB"),
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: req.t("fileCountLimit10Files"),
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: req.t("unexpectedFile"),
        });
      default:
        return res.status(400).json({
          success: false,
          message: req.t("uploadError"),
        });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  next();
};

export { 
  handleUploadError, 
  uploadSingle, 
  uploadMultiple, 
  getFileURL, 
  deleteCloudinaryImage,
  getPublicIDFromURL 
};
