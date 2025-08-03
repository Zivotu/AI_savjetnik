import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

/**
 * ElevenLabs server-tool webhook.
 * Body: { email: string, phone: string, painPoints: string[] }
 */
router.post("/", async (req: Request, res: Response) => {
  const { email, phone, painPoints } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true", // SSL (465) = true
      requireTLS: process.env.SMTP_REQUIRE_TLS === "true", // STARTTLS (587)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Ako koristiš shared hosting s lošim certifikatima:
      // tls: { rejectUnauthorized: false }
    });

    const mailContent = `
      <h2>Novi upit sa NeuroBiz asistenta</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telefon:</strong> ${phone}</p>
      <p><strong>Bolne točke:</strong> ${Array.isArray(painPoints) ? painPoints.join(", ") : ""}</p>
    `;

    await transporter.sendMail({
      from: `"NeuroBiz Bot" <${process.env.SMTP_USER}>`,
      to: "info@neurobiz.me", // Možeš staviti i više primatelja
      subject: "Novi lead s NeuroBiz weba",
      html: mailContent
    });

    res.json({ status: "ok" });
  } catch (err) {
    console.error("❌ Slanje maila nije uspjelo:", err);
    res.status(500).json({ error: "email_failed" });
  }
});

export default router;
