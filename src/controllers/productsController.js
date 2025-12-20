import db from "../config/db.js";

export const getAllProducts = async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
};

export const addProduct = async (req, res) => {
  try {

    const { name, description, price, stock } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!name || !price) {
      return res.status(400).json({ error: "Name and price required" });
    }

    const [result] = await db.execute(
      `
      INSERT INTO products (name, description, price, stock, image_url)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, description, price, stock || 0, imageUrl]
    );

    return res.status(201).json({
      message: "Product added successfully",
      id: result.insertId,
      image_url: imageUrl,
    });

  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};



export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, stock } = req.body;

    // 1. Check product exists
    const [existing] = await db.execute(
      "SELECT image_url FROM products WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 2. Use new image if uploaded, otherwise keep old one
    const imageUrl = req.file ? req.file.path : existing[0].image_url;

    // 3. Update
    const [result] = await db.execute(
      `
      UPDATE products
      SET name = ?, price = ?, description = ?, stock = ?, image_url = ?
      WHERE id = ?
      `,
      [name, price, description, stock, imageUrl, id]
    );

    // 4. Check affected rows
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Nothing updated" });
    }

    res.json({ message: "Product updated successfully" });

  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
};


export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await db.execute("DELETE FROM products WHERE id = ?", [id]);

        res.json({ message: "Product deleted" });
    } catch {
        res.status(500).json({ error: "Failed to delete" });
    }
};
