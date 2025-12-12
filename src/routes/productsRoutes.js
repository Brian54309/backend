import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

import {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/all", getAllProducts);

router.post("/add", authMiddleware, isAdmin, addProduct);
router.put("/edit/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteProduct);

export default router;
