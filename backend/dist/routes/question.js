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
router.post("/", async (req, res) => {
    const body = req.body;
    try {
        if (!nodemailer) {
            nodemailer = (await Promise.resolve().then(() => __importStar(require("nodemailer")))).default;
        }
        const transporter = nodemailer.createTransport({
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
