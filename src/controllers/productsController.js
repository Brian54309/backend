import db from "../config/db.js";

export const getAllProducts = async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
};

export const addProduct = async (req, res) => {
    try {
        const { name, price, description, image_url } = req.body;

        await db.execute(
            "INSERT INTO products (name, price, description, image_url) VALUES (?, ?, ?, ?)",
            [name, price, description, image_url]
        );

        res.json({ message: "Product added" });
    } catch (err) {
        res.status(500).json({ error: "Failed to add product" });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, image_url } = req.body;

        await db.execute(
            "UPDATE products SET name=?, price=?, description=?, image_url=? WHERE id=?",
            [name, price, description, image_url, id]
        );

        res.json({ message: "Product updated" });
    } catch {
        res.status(500).json({ error: "Failed to update" });
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
