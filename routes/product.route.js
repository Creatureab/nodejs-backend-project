import express from "express";
import { ProductModel } from "../models/product.model.js";
import { handleRouterError } from "../helper/error-handling.js";
import {
  getFileURL,
  handleUploadError,
  uploadMultiple,
  deleteCloudinaryImage,
} from "../middleware/upload.middleware.js";
import { adminOnly, userAndAdmin } from "../middleware/roles.middleware.js";
import {
  createProductValidation,
  updateProductValidation,
  handleValidationErrors,
} from "../validators/product.validator.js";

const router = express.Router();

router.post(
  "/",
  adminOnly,
  uploadMultiple,
  handleUploadError,
  createProductValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      let imageURLs = [];
      // Handle both single image and multiple images fields
      const uploadedFiles = [];
      if (req.files) {
        if (req.files.image) {
          uploadedFiles.push(...req.files.image);
        }
        if (req.files.images) {
          uploadedFiles.push(...req.files.images);
        }
      }

      if (uploadedFiles.length > 0) {
        imageURLs = uploadedFiles.map((file) => getFileURL(file));
      }

      let newProduct = new ProductModel({
        title: req.body.title,
        price: parseFloat(req.body.price), // "1.6" => 1.6
        category: req.body.category,
        countInStock: parseInt(req.body.countInStock), // "1" => 1
        description: req.body.description,
        images: imageURLs,
      });

      newProduct = await newProduct.save();

      return res.status(201).json({
        success: true,
        message: req.t("productCreatedSuccessfully"),
        data: newProduct,
      });
    } catch (error) {
      handleRouterError(error, res);
    }
  },
);

router.get("/", async (req, res) => {
  try {
    const search = req.query.search;
    const categoryID = req.query.categoryID;

    // Pagination Params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (categoryID) {
      filter.category = categoryID;
    }

    const totalCount = await ProductModel.countDocuments(filter);

    const productsList = await ProductModel.find(filter)
      .populate("category")
      .skip(skip)
      .limit(limit);

    const sharedDataResponse = {
      search,
      categoryID,
      page,
      limit,
      totalProducts: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    };

    if (!productsList || productsList.length === 0) {
      return res.send({
        message: req.t("noProducts"),
        data: [],
        ...sharedDataResponse,
      });
    }

    res.send({
      data: productsList,
      ...sharedDataResponse,
    });
  } catch (error) {
    handleRouterError(error, res);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    ).populate("category");

    if (!product) {
      return res.status(401).send({ message: req.t("productNotFound") });
    }

    return res.send(product);
  } catch (error) {
    handleRouterError(error, res);
  }
});

router.put(
  "/:id",
  adminOnly,
  uploadMultiple,
  handleUploadError,
  updateProductValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      // Check if product exists
      const existingProduct = await ProductModel.findById(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: req.t("productNotFound"),
        });
      }

      // Prepare update data
      const updateData = {};

      // Only update fields that are provided in the request
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.price !== undefined)
        updateData.price = parseFloat(req.body.price);
      if (req.body.category !== undefined)
        updateData.category = req.body.category;
      if (req.body.countInStock !== undefined)
        updateData.countInStock = parseInt(req.body.countInStock);
      if (req.body.description !== undefined)
        updateData.description = req.body.description;

      // Handle image uploads
      const uploadedFiles = [];
      if (req.files) {
        if (req.files.image) {
          uploadedFiles.push(...req.files.image);
        }
        if (req.files.images) {
          uploadedFiles.push(...req.files.images);
        }
      }

      if (uploadedFiles.length > 0) {
        const imageURLs = uploadedFiles.map((file) => getFileURL(file));

        if (req.body.replaceImages === "true") {
          // Delete old images from Cloudinary
          await Promise.all(
            (existingProduct.images || []).map((url) =>
              deleteCloudinaryImage(url)
            )
          );
          updateData.images = imageURLs;
        } else {
          // Add to existing images
          updateData.images = [...existingProduct.images, ...imageURLs];
        }
      }

      // Update the product
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      ).populate("category");

      return res.status(200).json({
        success: true,
        message: req.t("productUpdatedSuccessfully"),
        data: updatedProduct,
      });
    } catch (error) {
      handleRouterError(error, res);
    }
  },
);

router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: req.t("productNotFound"),
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map((img) => deleteCloudinaryImage(img))
      );
    }

    return res.send({ message: req.t("productDeletedSuccessfully") });
  } catch (error) {
    handleRouterError(error, res);
  }
});

export default router;
