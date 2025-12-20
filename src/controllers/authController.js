import bcrypt from "bcryptjs";
import db from "../config/db.js";
import { generateToken } from "../utils/token.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, is_admin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // check existing user
    const [exists] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (exists.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, is_admin || 0]
    );

    res.json({ message: "User registered" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
      id: user.id,
      is_admin: user.is_admin,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};
