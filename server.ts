import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';

// Example usage:
// curl -X POST http://localhost:3000/api/agent \
//  -H "Content-Type: application/json" \
//  -d '{"conversationId":"123","role":"user","text":"hello"}'

const app = express();

// Placing express.json first ensures req.body is parsed before route handlers
app.use(express.json({ strict: true }));

// Basic logger to inspect incoming payloads
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(req.method, req.url, req.body);
  next();
});

// POST /api/agent expects properly formatted JSON
app.post('/api/agent', (req: Request, res: Response) => {
  const { conversationId, role, text } = req.body as {
    conversationId?: string;
    role?: 'user' | 'assistant';
    text?: string;
  };

  if (!conversationId || !role || !text) {
    return res.status(400).json({ error: 'Missing conversationId, role, or text' });
  }

  console.log('POST /api/agent', req.body);
  // No further work, just acknowledge the request
  res.status(204).end();
});

// Error handler to catch JSON parsing issues
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Malformed JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

/*
Common causes of JSON parse errors:
- Missing or incorrect Content-Type header
- Trailing commas or invalid syntax
- UTF-8 BOM or other invisible characters
This setup places express.json before routes and has a global error handler
so malformed bodies return a clear 400 message instead of crashing the app.
*/
