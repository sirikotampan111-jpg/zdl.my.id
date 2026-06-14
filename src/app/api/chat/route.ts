import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { randomUUID } from "crypto";
import { z } from "zod";
import { checkRateLimit, safeParseJson, auditLog } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `Kamu adalah asisten virtual Zheng Digital Lab (ZDL), perusahaan jasa pembuatan website profesional. Gunakan Bahasa Indonesia.

Layanan Utama:
1. HTML Website — Rp600.000 - Rp1.500.000 (statis, ringan, cepat)
2. Next.js Website — Rp1.500.000 - Rp3.000.000 (modern, dinamis, SEO optimal)
3. Admin Panel — Rp2.000.000 (dashboard, CRUD, autentikasi)

Layanan Tambahan: Email Bisnis Rp500K, SEO Rp1.2M, Google/Meta Ads Setup Rp350K

Paket Bundle: Starter Pack Rp1.000K, Business Pack Rp3.800K, All-In Pack Rp5.950K

Maintenance: Basic Rp150K/bln, Pro Rp300K/bln, Premium Rp500K/bln

Pembayaran: DP minimal Rp500K, PPN 11% + Rp4.000 biaya transaksi. Seabank: 901913604812. QRIS, Bank Transfer, E-Wallet, CC.

Kontak: WhatsApp 0889-7374-5596, zdl.my.id
Alamat: Kp. Jawaringan, RT.003/RW.004, Mekar Bakti, Kec. Panongan, Kab. Tangerang, Banten 17510

Panduan: Sapa ramah, jika ditanya harga berikan range, jika mau order arahkan ke WhatsApp, gunakan emoji secukupnya.`;

// ─── Zod schema ───────────────────────────────────────────────────────────────

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const chatBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
  sessionId: z.string().max(100).optional(),
});

// ─── POST /api/chat ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — strict for AI chat
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const rateResult = checkRateLimit(`chat:${ip}`, { windowMs: 60_000, maxRequests: 10 });
    if (!rateResult.allowed) {
      return NextResponse.json(
        { message: "Terlalu banyak pesan. Tunggu sebentar ya!", sessionId: randomUUID() },
        { status: 429 }
      );
    }

    // Safe JSON parse
    const { data: body, error: parseError } = await safeParseJson(request);
    if (parseError) return parseError;

    // Zod validation
    const parseResult = chatBodySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { messages, sessionId } = parseResult.data;
    const newSessionId = sessionId || randomUUID();

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
      });

      const reply =
        completion.choices?.[0]?.message?.content ||
        "Maaf, saya tidak bisa memproses permintaan Anda. Hubungi WhatsApp 0889-7374-5596 😊";

      return NextResponse.json({ message: reply, sessionId: newSessionId });
    } catch (aiError) {
      return NextResponse.json({
        message:
          "Maaf, gangguan teknis. Hubungi WhatsApp 0889-7374-5596 😊",
        sessionId: newSessionId,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Terjadi kesalahan. Hubungi WhatsApp 0889-7374-5596 😊",
        sessionId: randomUUID(),
      },
      { status: 500 }
    );
  }
}
