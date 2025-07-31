// backend/src/utils/llm.ts

import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Vraća tekst rješenja (HR ili EN) + CTA
 */
export async function getSolution(
  summary: string,
  lang: "hr" | "en"
): Promise<{ solutionText: string; cta: string }> {
  const prompt =
    lang === "hr"
      ? `Na temelju opisa problema: "${summary}"

1. Sažmi glavni izazov u jednoj rečenici.
2. Predloži JEDNO primjenjivo AI rješenje (alat, API ili automatizacija).
3. U 3 kratka bullet-a objasni korist (uštedu vremena, točnost, ROI).

Vrati samo čisti odgovor bez dodatnih oznaka.`
      : `Based on the following business pain point: "${summary}"

1. Summarize the core challenge in one sentence.
2. Propose ONE concrete AI solution (tool, API, or automation).
3. Explain the benefit in three concise bullet points.

Return plain text only.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return {
    solutionText: res.choices[0].message.content?.trim() || "",
    cta:
      lang === "hr"
        ? "Nazovite nas na +385 1 XXX XXX ili napišite 'DA' pa vas zovemo."
        : "Call us at +385 1 XXX XXX or reply 'YES' and we'll call you.",
  };
}

export async function summarizeConversation(transcript: string, lang: "hr" | "en"): Promise<string> {
  const prompt =
    lang === "hr"
      ? `Sažmi sljedeći razgovor u 2-3 kratke rečenice na hrvatskom jeziku:\n${transcript}`
      : `Summarize the following conversation in 2-3 short sentences:\n${transcript}`;
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  return res.choices[0].message.content?.trim() || "";
}
