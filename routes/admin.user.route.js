import express from "express";
import User from "../models/user.model.js";
import { handleRouterError } from "../helper/error-handling.js";
import { adminOnly } from "../middleware/roles.middleware.js";
import {
  updateValidation,
  handleValidationErrors,
} from "../validators/auth.validator.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Validation middleware for creating users
const createUserValidation = [
  body("email")
    .isEmail()
    .withMessage((value, { req }) => req.t("enterValidEmail")),
  body("password")
    .isLength({ min: 6 })
    .withMessage((value, { req }) => req.t("passwordMinLength")),
  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage((value, { req }) => req.t("invalidRole")),
  body("userName")
    .notEmpty()
    .withMessage((value, { req }) => req.t("userNameRequired")),
  body("city")
    .notEmpty()
    .withMessage((value, { req }) => req.t("cityRequired")),
  body("postalCode")
    .notEmpty()
    .withMessage((value, { req }) => req.t("postalCodeRequired")),
  body("addressLine1").notEmpty(),
  body("addressLine2").optional(),
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage("Phone number must contain 10 to 15 digits"),
];

// 📋 GET ALL USERS - with search, filter, and pagination
router.get("/", adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "" } = req.query;

    const pageNum = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 10;
    const skip = (pageNum - 1) * pageLimit;

    // Build filter
    const filter = {};

    // Search by userName, email, or phoneNumber
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by role
    if (role && ["admin", "user"].includes(role)) {
      filter.role = role;
    }

    // Get total count
    const totalUsers = await User.countDocuments(filter);

    // Get paginated users
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const totalPages = Math.ceil(totalUsers / pageLimit);

    res.json({
      success: true,
      message: req.t("usersFetchedSuccessfully"),
      data: users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        limit: pageLimit,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      filters: {
        search,
        role,
      },
    });
  } catch (error) {
    handleRouterError(error, res);
  }
});

// 👤 GET SINGLE USER BY ID
router.get("/:id", adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: req.t("userNotFound"),
      });
    }

    res.json({
      success: true,
      message: req.t("userFetchedSuccessfully"),
      data: user,
    });
  } catch (error) {
    handleRouterError(error, res);
  }
});

// ➕ CREATE NEW USER (Admin only)
router.post(
  "/",
  adminOnly,
  createUserValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: req.t("emailAlreadyExists"),
        });
      }

      // Create new user
      const newUser = new User(req.body);
      await newUser.save();

      res.status(201).json({
        success: true,
        message: req.t("userCreatedSuccessfully"),
        data: newUser.toJSON(),
      });
    } catch (error) {
      handleRouterError(error, res);
    }
  },
);

// ✏️ UPDATE USER DATA
router.patch(
  "/:id",
  adminOnly,
  updateValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.params.id;

      // Prevent updating _id
      delete req.body._id;

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: req.t("userNotFound"),
        });
      }

      // Check if email is being changed and if it already exists
      if (req.body.email && req.body.email !== user.email) {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: req.t("emailAlreadyExists"),
          });
        }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        message: req.t("userUpdatedSuccessfully"),
        data: updatedUser.toJSON(),
      });
    } catch (error) {
      handleRouterError(error, res);
    }
  },
);

// 🔄 CHANGE USER ROLE
router.patch("/:id/change-role", adminOnly, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: req.t("roleRequired"),
      });
    }

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: req.t("invalidRole"),
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: req.t("userNotFound"),
      });
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.auth.id && role === "user") {
      return res.status(400).json({
        success: false,
        message: "Cannot demote yourself from admin role",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    );

    res.json({
      success: true,
      message: "User role updated successfully",
      data: updatedUser.toJSON(),
    });
  } catch (error) {
    handleRouterError(error, res);
  }
});

// ❌ DELETE USER
router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.auth.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: req.t("userNotFound"),
      });
    }

    res.json({
      success: true,
      message: req.t("userDeletedSuccessfully"),
      data: user.toJSON(),
    });
  } catch (error) {
    handleRouterError(error, res);
  }
});

// 📊 GET USER STATISTICS (Bonus)
router.get("/stats/overview", adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "admin" });
    const userCount = await User.countDocuments({ role: "user" });

    res.json({
      success: true,
      message: "User statistics retrieved successfully",
      data: {
        totalUsers,
        adminCount,
        userCount,
      },
    });
  } catch (error) {
    handleRouterError(error, res);
  }
});

export default router;
