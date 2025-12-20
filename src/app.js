import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
});


export default app;
