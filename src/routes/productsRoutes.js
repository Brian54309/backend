import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import upload from "../middleware/upload.js";
import {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/all", getAllProducts);

router.get("/:id", getProductById);

router.post(
  "/add",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  addProduct
);

router.patch(
  "/edit/:id",
  authMiddleware,
  isAdmin,
  upload.single("image"), // 👈 REQUIRED
  updateProduct
);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteProduct);

export default router;
