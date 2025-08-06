import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";

interface QuestionBody {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  industry?: string;
  teamSize?: string;
  repetitiveTask?: string;
  aiUsage?: string;
  question: string;
  wantResponse: boolean;
  newsletter: boolean;
  language: string;
}

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const body = req.body as QuestionBody;

  try {
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
  } catch (err) {
    console.error("❌ Question email error:", err);
    res.status(500).json({ error: "email_failed" });
  }
});

export default router;
