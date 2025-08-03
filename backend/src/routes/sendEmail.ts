import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

/** Shape of body ElevenLabs will POST */
interface SendEmailBody {
  email: string;
  phone: string;
  painPoints?: string[];
  proposal?: string;
}

/**
 * POST  /api/sendEmail
 * Body: { email, phone, painPoints[], proposal }
 */
router.post("/", async (req: Request, res: Response) => {
  /*  cast → avoids “implicit any” without generics */
  const { email, phone, painPoints = [], proposal } = req.body as SendEmailBody;

  try {
    /* 1) Nodemailer transporter */
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",          // 465
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
      to: "¸info@neurobiz.me",
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
  } catch (err) {
    console.error("❌ Email error:", err);
    res.status(500).json({ error: "email_failed" });
  }
});

export default router;
