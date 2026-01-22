"use client";

import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState("dark fantasy in una città decadente");
  const [tone, setTone] = useState("teso, investigativo, con horror leggero");
  const [length, setLength] = useState<"breve" | "media" | "lunga">("media");

  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canDownload = useMemo(() => story.trim().length > 0, [story]);

  async function generate() {
    setErr(null);
    setLoading(true);
    setStory("");

    try {
      const res = await fetch("/api/genera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, theme, tone, length }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data?.error || "Errore");
        return;
      }

      setStory(data.story || "");
    } catch (e: any) {
      setErr(e?.message ?? "Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  function downloadPdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;

    doc.setFont("times", "normal");
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(story, maxWidth);
    let y = margin;

    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 16;
    }

    doc.save("avventura-dnd.pdf");
  }

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundImage: "url('/bg.jpg')", // cambia se il file ha altro nome/estensione
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay leggero + gradiente per leggibilità senza scurire troppo */}
      <div className="min-h-screen bg-gradient-to-b from-white/35 via-white/15 to-black/10">
        {/* Un secondo velo leggerissimo per uniformare l'immagine */}
        <div className="min-h-screen bg-black/10">
          <div className="mx-auto w-full max-w-md px-4 py-7">
            {/* Header */}
            <div className="mb-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/45 px-3 py-1 text-xs font-medium text-zinc-900 backdrop-blur-md border border-white/40 shadow-sm">
                DM Toolkit
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 drop-shadow-sm">
                Story Forge
              </h1>

              <p className="mt-1 text-sm text-zinc-900/80">
                Genera un’avventura pronta da masterare — ottimizzata per mobile.
              </p>
            </div>

            {/* Card Accesso/Impostazioni */}
            <Card className="bg-white/60 border-white/40 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-zinc-900">Impostazioni</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-900/80">Password</label>
                  <Input
                    type="password"
                    placeholder="Password del party"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 bg-white/70 border-white/50 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-black/10"
                  />
                </div>

                <div className="grid gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-900/80">Tema</label>
                    <Input
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="mt-1 bg-white/70 border-white/50 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-black/10"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-900/80">Tono</label>
                    <Input
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="mt-1 bg-white/70 border-white/50 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-black/10"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-900/80">Lunghezza</label>
                    <div className="mt-2 flex gap-2">
                      {(["breve", "media", "lunga"] as const).map((opt) => {
                        const active = length === opt;
                        return (
                          <Button
                            key={opt}
                            type="button"
                            variant={active ? "default" : "outline"}
                            onClick={() => setLength(opt)}
                            className={
                              active
                                ? "flex-1"
                                : "flex-1 bg-white/55 border-white/50 text-zinc-900 hover:bg-white/75"
                            }
                          >
                            {opt}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={generate}
                  disabled={loading || password.trim().length === 0}
                  className="w-full h-11 text-base"
                >
                  {loading ? "Sto evocando la storia…" : "Genera storia"}
                </Button>

                {err && (
                  <div className="rounded-lg border border-red-200/70 bg-red-50/70 p-3 text-sm text-red-800">
                    {err}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="mt-5 bg-white/60 border-white/40 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base text-zinc-900">Avventura</CardTitle>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canDownload}
                    onClick={downloadPdf}
                    className="bg-white/55 border-white/50 text-zinc-900 hover:bg-white/75"
                  >
                    PDF
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <Textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Qui comparirà la tua avventura…"
                  className="min-h-[360px] bg-white/70 border-white/50 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-black/10"
                />

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-zinc-900/70">
                    Puoi modificare il testo prima di esportare.
                  </p>

                  <p className="text-xs text-zinc-900/55">🔒 solo party</p>
                </div>
              </CardContent>
            </Card>

            {/* Footer minimale */}
            <div className="mt-5 text-center">
              <span className="inline-flex items-center rounded-full bg-white/45 px-3 py-1 text-xs text-zinc-900/70 backdrop-blur-md border border-white/40">
                Buona sessione 🎲
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
