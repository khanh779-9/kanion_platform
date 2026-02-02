import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db/pool.js";
import { config } from "../config.js";
import { logAuditAction, AUDIT_ACTIONS } from "../utils/auditLog.js";

import { requireAuth } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email("Invalid email").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255),
});

router.post("/register", async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: parse.error.flatten() });

  const { email, password } = parse.data;
  // const client = await db.pool.connect();
  try {
    await db.query("BEGIN");
    // Check email uniqueness
    const emailExists = await db.query(
      "SELECT 1 FROM account.users WHERE email=$1",
      [email.toLowerCase()],
    );
    if (emailExists.rowCount > 0) {
      await db.query("ROLLBACK");
      return res.status(409).json({ error: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 12);
    const insert = await db.query(
      "INSERT INTO account.users(email,password,status) VALUES($1,$2,'active') RETURNING id,email",
      [email.toLowerCase(), hash],
    );
    const user = insert.rows[0];

    // Tạo profile mặc định cho user mới (dùng email làm display_name tạm thời)
    await db.query(
      "INSERT INTO account.profiles (account_id, display_name) VALUES ($1, $2)",
      [user.id, user.email],
    );

    await db.query("COMMIT");

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: "7d" },
    );

    // Audit log (non-blocking)
    logAuditAction(
      user.id,
      AUDIT_ACTIONS.USER_REGISTERED,
      "user",
      user.id,
      {},
      req,
    ).catch((err) => console.error("Audit log error:", err));

    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    await db.query("ROLLBACK");
    console.error("Register error:", e.message, e.code, e.detail);
    res.status(500).json({ error: "Registration failed" });
  }
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: parse.error.flatten() });

  const { email, password } = parse.data;
  try {
    const result = await db.query(
      "SELECT id,email,password,status FROM account.users WHERE email=$1",
      [email.toLowerCase()],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Account does not exist" });
    }

    const user = result.rows[0];

    const status = (user.status || "").toLowerCase();
    if (status && status !== "active") {
      logAuditAction(
        null,
        AUDIT_ACTIONS.FAILED_LOGIN,
        "user",
        user.id,
        { reason: "inactive" },
        req,
      ).catch((err) => console.error("Audit log error:", err));
      return res.status(403).json({ error: "Account is not active" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      logAuditAction(
        null,
        AUDIT_ACTIONS.FAILED_LOGIN,
        "user",
        user.id,
        { reason: "wrong_password" },
        req,
      ).catch((err) => console.error("Audit log error:", err));
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: "7d" },
    );

    // Audit log (non-blocking)
    logAuditAction(
      user.id,
      AUDIT_ACTIONS.USER_LOGIN,
      "user",
      user.id,
      {},
      req,
    ).catch((err) => console.error("Audit log error:", err));

    // Notification: đăng nhập thành công
    try {
      const { parseUserAgent } = await import("../utils/userAgent.js");
      const ua = req.headers["user-agent"] || "";
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        "";
      const { browser, os, device } = parseUserAgent(ua);
      const content = `Trình duyệt: ${browser}\nThiết bị: ${device}\nHệ điều hành: ${os}\nIP: ${ip}`;
      await db.query(
        `INSERT INTO notification.items (account_id, type, title, content, created_at)
         VALUES ($1, 'info', 'Đăng nhập tài khoản', $2, now())`,
        [user.id, content],
      );
    } catch (e) {
      console.error("Notification error:", e.message);
    }

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    console.error("Login error:", e.message, e.code, e.detail);
    res.status(500).json({ error: "Login failed" });
  }
});

// Lấy 5 thông báo mới nhất
router.get("/user/notifications", requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, type, title, content, is_read, created_at FROM notification.items WHERE account_id=$1 ORDER BY created_at DESC LIMIT 5",
      [req.user.id],
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Lấy tất cả thông báo
router.get("/user/notifications/all", requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, type, title, content, is_read, created_at FROM notification.items WHERE account_id=$1 ORDER BY created_at DESC",
      [req.user.id],
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Đánh dấu thông báo là đã xem
router.patch("/user/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    const read_at = is_read ? 'NOW()' : 'NULL';
    const result = await db.query(
      `UPDATE notification.items SET is_read=$1, read_at=${read_at} WHERE id=$2 AND account_id=$3 RETURNING *`,
      [is_read, id, req.user.id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json({ success: true, notification: result.rows[0] });
  } catch (e) {
    console.error('Update notification error:', e);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

export default router;
