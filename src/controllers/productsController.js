import db from "../config/db.js";

/* ======================
   GET ALL PRODUCTS
====================== */
export const getAllProducts = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM products ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/* ======================
   GET PRODUCT BY ID
====================== */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const result = await db.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET PRODUCT BY ID ERROR:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};



/* ======================
   ADD PRODUCT
====================== */
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price required" });
    }

    const result = await db.query(
      `
      INSERT INTO products (name, description, price, stock, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [name, description, price, stock ?? 0, imageUrl]
    );

    res.status(201).json({
      message: "Product added successfully",
      id: result.rows[0].id,
      image_url: imageUrl,
    });
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================
   UPDATE PRODUCT
====================== */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, stock } = req.body;

    // 1. Check product exists
    const existing = await db.query(
      "SELECT image_url FROM products WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const fields = [];
    const values = [];

    // 2. Conditionally add fields
    if (name !== undefined) {
      fields.push(`name = $${values.length + 1}`);
      values.push(name);
    }

    if (price !== undefined) {
      fields.push(`price = $${values.length + 1}`);
      values.push(price);
    }

    if (description !== undefined) {
      fields.push(`description = $${values.length + 1}`);
      values.push(description);
    }

    if (stock !== undefined) {
      fields.push(`stock = $${values.length + 1}`);
      values.push(stock);
    }

    // 3. Handle image (Cloudinary)
    if (req.file) {
      fields.push(`image_url = $${values.length + 1}`);
      values.push(req.file.path);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    // 4. Execute update
    await db.query(
      `
      UPDATE products
      SET ${fields.join(", ")}
      WHERE id = $${values.length + 1}
      `,
      [...values, id]
    );

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
};


/* ======================
   DELETE PRODUCT
====================== */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM products WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ error: "Failed to delete" });
  }
};
