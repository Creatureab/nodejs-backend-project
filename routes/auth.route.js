import express from "express";
import User from "../models/user.model.js";
import {
  registerValidation,
  handleValidationErrors,
  loginValidation,
  updateValidation,
} from "../validators/auth.validator.js";
import { genenrateToken } from "../helper/jwt.js";
import { body } from "express-validator";
import { handleRouterError } from "../helper/error-handling.js";

const router = express.Router();

router.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const user = new User(req.body);

      const { email } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: req.t("emailAlreadyExists"),
        });
      }
      await user.save();

      const token = genenrateToken(user);

      res.status(201).json({
        success: true,
        message: req.t("userRegisteredSuccessfully"),
        data: user.toJSON(),
        token: token,
      });
    } catch (error) {
      handleRouterError(error, res);
    }
  },
);
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const userData = await User.findOne({ email });

      //if user not exists

      if (!userData) {
        return res.status(401).json({
          success: false,
          message: req.t("userNotFound"),
        });
      }

      const isPasswordCorrect = await userData.comparePassword(password);

      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: req.t("incorrectPassword"),
        });
      }
      const token = genenrateToken(userData);
      res.json({
        success: true,
        message: req.t("loginSuccessFull"),
        data: {
          user: userData.toJSON(),
          token: token,
        },
      });
    } catch (error) {
      handleRouterError(error, res);
    }
  },
);

router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.auth.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: req.t("userNotFound"),
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    handleRouterError(error, res);
  }
});
router.put(
  "/profile",
  updateValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const userId = req.auth.id;
      const updateBody = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: req.t("userNotFound"),
        });
      }

      if (updateBody.email) {
        const existingUserByEmail = await User.findOne({
          email: updateBody.email,
          _id: { $ne: userId },
        });

        if (existingUserByEmail) {
          return res.status(400).json({
            success: false,
            message: req.t("emailAlreadyExists"),
          });
        }
      }

      Object.assign(user, updateBody);
      await user.save();

      res.json({
        success: true,
        message: req.t("profileUpdatedSuccessfully"),
        data: user,
      });
    } catch (error) {
      handleRouterError(error, res);
    }
  },
);
export default router;
