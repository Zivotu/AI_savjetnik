import { Router, Request, Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";

const router = Router();
const DIR = path.resolve(__dirname, "../../uploads");

// ensure directory exists
fs.mkdir(DIR, { recursive: true }).catch(() => {});

router.post("/", async (req: Request, res: Response) => {
  const ct = req.headers["content-type"];
  if (!ct || !ct.startsWith("multipart/form-data")) {
    return res.status(400).json({ error: "invalid_content_type" });
  }
  const boundary = ct.split("boundary=")[1];
  if (!boundary) return res.status(400).json({ error: "no_boundary" });

  const chunks: Buffer[] = [];
  req.on("data", (chunk: Buffer) => chunks.push(chunk));
  req.on("end", async () => {
    try {
      const buffer = Buffer.concat(chunks);
      const boundaryBuf = Buffer.from(`--${boundary}`);
      const start = buffer.indexOf(boundaryBuf) + boundaryBuf.length + 2; // skip boundary + CRLF
      const headerEnd = buffer.indexOf(Buffer.from("\r\n\r\n"), start);
      const header = buffer.toString("utf8", start, headerEnd);
      const filenameMatch = /filename="([^"]+)"/i.exec(header);
      const ext = filenameMatch ? path.extname(filenameMatch[1]) : ".png";
      const fileStart = headerEnd + 4; // skip CRLFCRLF
      const fileEnd = buffer.indexOf(boundaryBuf, fileStart) - 2; // remove trailing CRLF
      const fileBuffer = buffer.slice(fileStart, fileEnd);
      const filename = `${Date.now()}${ext}`;
      await fs.writeFile(path.join(DIR, filename), fileBuffer);
      res.json({ url: `/uploads/${filename}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "upload_failed" });
    }
  });
});

export default router;
