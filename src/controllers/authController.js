import bcrypt from "bcryptjs";
import db from "../config/db.js"; // this should export pg Pool
import { generateToken } from "../utils/token.js";

/* ======================
   REGISTER
====================== */
export const register = async (req, res) => {
  try {
    const { name, email, password, is_admin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Check existing user
    const exists = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `
      INSERT INTO users (name, email, password_hash, is_admin)
      VALUES ($1, $2, $3, $4)
      `,
      [name, email, hashedPassword, is_admin ?? false]
    );

    res.json({ message: "User registered" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================
   LOGIN
====================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

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
