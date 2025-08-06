"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
let nodemailer;
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
        if (!nodemailer) {
            nodemailer = (await Promise.resolve().then(() => __importStar(require("nodemailer")))).default;
        }
        const transporter = nodemailer.createTransport({
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
