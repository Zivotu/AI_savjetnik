"use strict";
// backend/src/utils/llm.ts
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
exports.getSolution = getSolution;
exports.summarizeConversation = summarizeConversation;
let openai = null;
/**
 * Vraća tekst rješenja (HR ili EN) + CTA
 */
async function getSolution(summary, lang) {
    const prompt = lang === "hr"
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
    if (!openai) {
        const { default: OpenAI } = await Promise.resolve().then(() => __importStar(require("openai")));
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
    });
    return {
        solutionText: res.choices[0].message.content?.trim() || "",
        cta: lang === "hr"
            ? "Nazovite nas na +385 91 30 66 505 ili pričekajte da Vam odgovorimo s konkretnijim prijedlogom putem elektroničke pošte."
            : "Call us at +385 91 30 66 505 or reply 'YES' and we'll call you.",
    };
}
async function summarizeConversation(transcript, lang) {
    const prompt = lang === "hr"
        ? `Sažmi sljedeći razgovor u 2-3 kratke rečenice na hrvatskom jeziku:\n${transcript}`
        : `Summarize the following conversation in 2-3 short sentences:\n${transcript}`;
    if (!openai) {
        const { default: OpenAI } = await Promise.resolve().then(() => __importStar(require("openai")));
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
    });
    return res.choices[0].message.content?.trim() || "";
}
