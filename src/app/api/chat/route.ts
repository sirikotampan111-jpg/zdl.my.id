import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { randomUUID } from "crypto";
import { chatSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

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

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — per IP
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`chat:${ip}`, RATE_LIMITS.chat);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Terlalu banyak pesan. Tunggu sebentar ya! 😊" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    const rawBody = await request.json();

    // Validate with Zod
    const parseResult = chatSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Pesan tidak valid" },
        { status: 400 }
      );
    }

    const { messages, sessionId: rawSessionId } = parseResult.data;

    // Validate sessionId format if provided
    let sessionId: string;
    if (rawSessionId && /^[0-9a-f-]{1,100}$/i.test(rawSessionId)) {
      sessionId = rawSessionId;
    } else {
      sessionId = randomUUID();
    }

    // Limit conversation history to prevent context overflow
    const recentMessages = messages.slice(-20);

    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...recentMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
      });

      const reply =
        completion.choices?.[0]?.message?.content ||
        "Maaf, saya tidak bisa memproses permintaan Anda. Hubungi WhatsApp 0889-7374-5596 😊";

      return NextResponse.json({ message: reply, sessionId });
    } catch {
      return NextResponse.json({
        message:
          "Maaf, gangguan teknis. Hubungi WhatsApp 0889-7374-5596 😊",
        sessionId,
      });
    }
  } catch {
    return NextResponse.json(
      {
        message: "Terjadi kesalahan. Hubungi WhatsApp 0889-7374-5596 😊",
        sessionId: randomUUID(),
      },
      { status: 500 }
    );
  }
}
