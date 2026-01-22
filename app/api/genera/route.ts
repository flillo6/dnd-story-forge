import OpenAI from "openai";

export const runtime = "nodejs";

type Body = {
  password: string;
  theme?: string;
  tone?: string;
  length?: "breve" | "media" | "lunga";
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    // Controlli base
    if (!process.env.PARTY_PASSWORD) {
      return Response.json(
        { error: "Configurazione mancante: PARTY_PASSWORD" },
        { status: 500 }
      );
    }
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Configurazione mancante: OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    // Protezione: password del party
    if (body.password !== process.env.PARTY_PASSWORD) {
      return Response.json({ error: "Password errata" }, { status: 401 });
    }

    const theme = body.theme?.trim() || "fantasy classico";
    const tone = body.tone?.trim() || "epico e misterioso";
    const length = body.length || "media";

    const targetWords =
      length === "breve"
        ? "500-700"
        : length === "lunga"
        ? "1600-2200"
        : "900-1300";

    const prompt = `
Sei un Dungeon Master professionista. Crea un'avventura pronta da giocare per D&D 5e.

Vincoli:
- Tema: ${theme}
- Tono: ${tone}
- Lunghezza: ${targetWords} parole circa
- Lingua: italiano
- Output ben formattato in sezioni Markdown con titoli H2.

Struttura:
## Titolo e pitch (2-3 righe)
## Setup (contesto + gancio iniziale)
## PNG principali (3-5 con motivazioni e segreti)
## Luoghi (3-5)
## Trama a scene (5-8 scene con obiettivi chiari)
## 3 colpi di scena
## Incontri suggeriti (bilanciati in modo generico, senza numeri precisi)
## Ricompense e agganci per continuare
`.trim();

    // ✅ ISTANZIA QUI (non a livello modulo)
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: "gpt-5.2",
      input: prompt,
    });

    const story = response.output_text?.trim() || "";
    return Response.json({ story });
  } catch (err: any) {
    return Response.json(
      { error: "Errore server", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
