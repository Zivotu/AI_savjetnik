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
router.post("/", async (req, res) => {
    const body = req.body;
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === "true",
            requireTLS: process.env.SMTP_REQUIRE_TLS === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        await transporter.sendMail({
            from: `"NeuroBiz Bot" <${process.env.SMTP_USER}>`,
            to: "info@neurobiz.me",
            subject: "Novo pitanje s NeuroBiz weba",
            html: `
        <h2>Novo pitanje</h2>
        <p><b>Ime:</b> ${body.firstName} ${body.lastName}</p>
        <p><b>Email:</b> ${body.email}</p>
        <p><b>Tvrtka:</b> ${body.company ?? ""}</p>
        <p><b>Djelatnost:</b> ${body.industry ?? ""}</p>
        <p><b>Veličina tima:</b> ${body.teamSize ?? ""}</p>
        <p><b>Najveći repetitivni zadatak:</b> ${body.repetitiveTask ?? ""}</p>
        <p><b>Razina AI korištenja:</b> ${body.aiUsage ?? ""}</p>
        <p><b>Pitanje:</b> ${body.question}</p>
        <p><b>Želi odgovor:</b> ${body.wantResponse ? "da" : "ne"}</p>
        <p><b>Newsletter:</b> ${body.newsletter ? "da" : "ne"}</p>
        <p><b>Jezik:</b> ${body.language}</p>
      `,
        });
        res.json({ status: "ok" });
    }
    catch (err) {
        console.error("❌ Question email error:", err);
        res.status(500).json({ error: "email_failed" });
    }
});
exports.default = router;
