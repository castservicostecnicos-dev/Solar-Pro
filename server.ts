import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Solar Pitch & Proposal Executive Summary
app.post("/api/ai/pitch", async (req, res) => {
  try {
    const { clientName, systemKwp, monthlySavings, investment, paybackYears, roofType, state } = req.body;
    const ai = getAI();

    if (!ai) {
      // High-quality deterministic fallback
      const fallbackPitch = `Olá ${clientName || "Cliente"}! Com a instalação do seu sistema solar fotovoltaico de ${systemKwp || 5.5} kWp, você deixará de ser refém dos constantes aumentos tarifários e economizará cerca de R$ ${monthlySavings?.toLocaleString('pt-BR') || "650,00"} todos os meses na sua conta de energia. Com um retorno do investimento previsto em apenas ${paybackYears || "3,2"} anos e garantia de performance de 25 anos nos módulos, você transforma um custo fixo contínuo em patrimônio limpo e sustentável.`;
      return res.json({ text: fallbackPitch, source: "template" });
    }

    const prompt = `Você é um consultor sênior em engenharia de energia solar no Brasil.
Elabore um texto executivo de apresentação comercial persuasivo, transparente e profissional para a proposta do cliente ${clientName || "Cliente"}.
Dados do projeto:
- Potência do Sistema: ${systemKwp} kWp
- Economia Mensal Estimada: R$ ${monthlySavings}
- Investimento Total: R$ ${investment}
- Retorno estimado (Payback): ${paybackYears} anos
- Tipo de Telhado: ${roofType || "Cerâmico"}
- Estado/Região: ${state || "Brasil"}

O texto deve ter 2 parágrafos curtos:
1. Impacto financeiro imediato e proteção contra a inflação energética.
2. Segurança do investimento, qualidade técnica e sustentabilidade.
Tom: amigável, técnico, consultivo e focado em valor real.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ text: response.text || "", source: "gemini" });
  } catch (error: any) {
    console.error("AI pitch generation error:", error);
    res.status(500).json({ error: error.message || "Erro ao gerar apresentação com IA" });
  }
});

// AI Automated Follow-up script generator (WhatsApp & Email)
app.post("/api/ai/followup", async (req, res) => {
  try {
    const { clientName, daysSinceSent, proposalValue, status, objection } = req.body;
    const ai = getAI();

    if (!ai) {
      let defaultMsg = `Olá ${clientName}, tudo bem? Aqui é da SolarPro. Estou passando para saber se você conseguiu analisar a nossa proposta solar. O estudo foi personalizado para gerar a máxima economia para você! Se tiver alguma dúvida sobre o financiamento em até 72x ou prazos de instalação, me avise!`;
      if (status === 'negotiating') {
        defaultMsg = `Olá ${clientName}! Conversamos recentemente sobre o seu projeto fotovoltaico. Conseguimos uma condição especial de parcelamento bancário com carência de 90 dias que se encaixa perfeitamente na sua economia mensal. Podemos conversar 5 minutinhos hoje?`;
      }
      return res.json({ message: defaultMsg, source: "template" });
    }

    const prompt = `Você é um especialista em vendas consultivas e CRM de energia solar fotovoltaica.
Gere uma mensagem concisa, altamente eficaz e educada para WhatsApp de follow-up para o cliente ${clientName}.
Contexto:
- Dias desde envio da proposta: ${daysSinceSent || 2} dias
- Valor da proposta: R$ ${proposalValue}
- Status atual no CRM: ${status}
${objection ? `- Objeção ou observação registrada: "${objection}"` : ''}

Diretrizes:
- Mensagem humanizada para WhatsApp com emojis moderados.
- Chamada para ação (CTA) simples e sem pressão.
- Destacar benefícios tangíveis (parcela que substitui a conta de luz, carência, ou homologação rápida).
Retorne apenas o texto da mensagem pronta para envio.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ message: response.text || "", source: "gemini" });
  } catch (error: any) {
    console.error("AI followup error:", error);
    res.status(500).json({ error: error.message || "Erro ao gerar follow-up com IA" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SolarPro Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
