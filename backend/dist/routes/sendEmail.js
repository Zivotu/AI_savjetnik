"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
/**
 * POST  /api/sendEmail
 * Body: { email, phone, painPoints[], proposal }
 */
router.post("/", async (req, res) => {
    /*  cast → avoids “implicit any” without generics */
    const { email, phone, painPoints = [], proposal } = req.body;
    try {
        /* 1) Nodemailer transporter */
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true", // 465
            requireTLS: process.env.SMTP_REQUIRE_TLS === "true", // 587 + STARTTLS
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
            // tls: { rejectUnauthorized: false } // ← samo za self-signed cert
        });
        /* 2) Send e-mail */
        await transporter.sendMail({
            from: `"NeuroBiz Bot" <${process.env.SMTP_USER}>`,
            to: "info@neurobiz.me",
            subject: "Novi lead s NeuroBiz weba",
            html: `
        <h2>Novi lead</h2>
        <p><b>Email:</b> ${email}</p>
        <p><b>Telefon:</b> ${phone}</p>
        <p><b>Bolne točke:</b> ${painPoints.join(", ")}</p>
        <p><b>Prijedlog:</b> ${proposal ?? ""}</p>
      `
        });
        res.json({ status: "ok" });
    }
    catch (err) {
        console.error("❌ Email error:", err);
        res.status(500).json({ error: "email_failed" });
    }
});
exports.default = router;
