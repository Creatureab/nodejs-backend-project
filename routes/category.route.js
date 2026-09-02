import express from "express";
import { Category } from "../models/category.js";
import { adminOnly } from "../middleware/roles.middleware.js";

const router = express.Router();

router.post("/", adminOnly, async (req, res) => {
  try {
    if (!req.body.name || req.body.name.trim().length < 5) {
      return res.status(400).send({
        message: req.t("categoryNameValidation"),
      });
    }

    const newCategory = await Category.create({
      name: req.body.name,
    });

    return res.status(201).send(newCategory);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const categoriesList = await Category.find();
    return res.send(categoriesList);
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
});

router.delete("/:id", adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).send({ message: req.t("categoryNotFound") });
    }

    return res
      .status(200)
      .send({ message: req.t("categoryDeletedSuccessfully") });
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

router.put("/:id", adminOnly, async (req, res) => {
  try {
    if (!req.body.name || req.body.name.trim().length < 5) {
      return res.status(400).send({
        message: req.t("categoryNameValidation"),
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true },
    );

    if (!category) {
      return res.status(404).send({ message: req.t("categoryNotFound") });
    }

    return res.status(200).send({
      message: req.t("categoryUpdatedSuccessfully"),
      data: category,
    });
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

export default router;
