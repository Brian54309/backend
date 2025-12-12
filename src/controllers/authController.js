import bcrypt from "bcryptjs";
import db from "../config/db.js";
import { generateToken } from "../utils/token.js";

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        // check existing user
        const [exists] = await db.execute("SELECT email FROM users WHERE email = ?", [email]);
        if (exists.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        await db.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashed, role || "user"]
        );

        res.json({ message: "User registered" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

        if (rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
