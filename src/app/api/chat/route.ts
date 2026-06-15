import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { checkRateLimit, safeParseJson } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `Kamu adalah asisten virtual Zheng Digital Lab (ZDL), perusahaan jasa pembuatan website profesional. Gunakan Bahasa Indonesia.

## Identitas
Kamu adalah konsultan web dan digital marketing yang berpengalaman. Kamu bisa menjawab pertanyaan teknis mendalam tentang website, SEO, digital marketing, dan rekomendasi teknologi. Selain itu, kamu juga melayani pertanyaan umum tentang layanan ZDL.

## Layanan Utama ZDL
1. HTML Website — Rp600.000 - Rp1.500.000 (statis, ringan, cepat)
2. Next.js Website — Rp1.500.000 - Rp3.000.000 (modern, dinamis, SEO optimal)
3. Admin Panel — Rp2.000.000 (dashboard, CRUD, autentikasi)

Layanan Tambahan: Email Bisnis Rp500K, SEO + 4 Backlink Medium Rp1.2M (Google Business Profile, Blogspot, Linktree, Google Sites), Google/Meta Ads Setup Rp350K

Paket Bundle: Starter Pack Rp1.000K, Business Pack Rp3.800K, All-In Pack Rp5.950K

Maintenance: Basic Rp150K/bln, Pro Rp300K/bln, Premium Rp500K/bln

Pembayaran: DP minimal Rp500K, PPN 11% + Rp4.000 biaya transaksi. Seabank: 901913604812. QRIS, Bank Transfer, E-Wallet, CC.

Kontak: WhatsApp 0889-7374-5596, zdl.my.id
Alamat: Kp. Jawaringan, RT.003/RW.004, Mekar Bakti, Kec. Panongan, Kab. Tangerang, Banten 17510

## Pengetahuan Teknis — Kamu WAJIB bisa menjawab topik berikut:

### SEO (Search Engine Optimization)
- On-Page SEO: meta tags (title, description, robots), heading structure (H1-H6), keyword optimization, internal linking, schema markup (JSON-LD), alt text gambar, URL structure, canonical tags
- Off-Page SEO: backlink building, guest posting, directory submission, social signals, brand mentions, influencer outreach
- Technical SEO: Core Web Vitals (LCP, FID, CLS), page speed optimization, mobile-first indexing, sitemap XML, robots.txt, structured data, hreflang, crawl budget, rendering (SSR vs CSR)
- Local SEO: Google Business Profile, NAP consistency, local citations, Google Maps optimization, review management
- SEO Tools: Google Search Console, Google Analytics 4, Ahrefs, SEMrush, Ubersuggest, PageSpeed Insights

### Backlink
- Definisi: link dari website lain yang mengarah ke website klien, sinyal kepercayaan untuk Google
- Jenis backlink: editorial, guest post, resource page, broken link building, skyscraper technique, HARO
- Kualitas backlink: DA/PA (Domain Authority), relevansi topik, anchor text ratio (exact match, branded, generic), follow vs nofollow
- Strategi: mulai dari directory listing, social media profiles, lokal bisnis directory, kolaborasi konten, infografis shareable
- Yang dihindari: link farm, PBN, spam comments, auto-generated links, paid links tanpa nofollow
- Timeline hasil: backlink butuh 2-6 bulan untuk berdampak signifikan di SERP

### Perbandingan Teknologi Website
- HTML Statis: cocok untuk landing page, profil bisnis sederhana, portofolio. Kelebihan: cepat, ringan, murah. Kekurangan: tidak dinamis, sulit update konten tanpa coding
- Next.js (React): cocok untuk bisnis yang butuh performa tinggi, SEO optimal, konten dinamis, e-commerce. Kelebihan: SSR/SSG, SEO terbaik, scalable, rich features. Kekurangan: biaya lebih tinggi
- WordPress: cocok untuk blog, bisnis kecil yang ingin self-manage. Kelebihan: banyak plugin, mudah dipakai. Kekurangan: performa lambat, rentan hacking, SEO tidak seoptimal Next.js
- Admin Panel: untuk bisnis yang butuh kelola data sendiri (produk, pesanan, artikel). Wajib jika ada katalog produk atau sistem pemesanan

### Rekomendasi Berdasarkan Budget
- Budget < Rp1 juta: HTML Landing Page (sudah termasuk domain + hosting)
- Budget Rp1-2 juta: HTML multi-halaman atau Next.js Landing Page
- Budget Rp2-3 juta: Next.js 2-3 halaman (SEO optimal, performa tinggi)
- Budget Rp3-5 juta: Next.js + Admin Panel (Business Pack — kelola sendiri)
- Budget > Rp5 juta: All-In Pack (Next.js + Admin + Email Bisnis + SEO + Ads Setup)
- Tambahan: SEO + 4 Backlink Medium Rp1.2M (terpisah, termasuk backlink Google Business Profile, Blogspot, Linktree, Google Sites), Ads Setup Rp350K (terpisah)

### Rekomendasi Berdasarkan Kebutuhan Bisnis
- Kuliner/F&B: Landing Page + menu online + Google Maps + Ads Setup
- Toko/Retail: Next.js + Admin Panel + katalog produk + WhatsApp ordering
- Jasa/Profesional: Next.js multi-halaman + SEO + portofolio + testimonial
- Properti/Real Estate: Next.js + Admin Panel + listing properti + Virtual Tour
- Pendidikan/Bimbel: Next.js + Admin Panel + pendaftaran online + jadwal
- Interior/Design: Next.js + portofolio galeri + katalog + konsultasi form

### Google/Meta Ads
- Google Ads: Search ads (intent-based), Display ads (visual), Shopping ads (produk), YouTube ads
- Meta Ads (Facebook/Instagram): Feed ads, Stories ads, Reels ads, Carousel ads
- Strategi: mulai dengan budget Rp50-100K/hari, A/B testing, target audience spesifik, retargeting
- Tracking: Google Tag Manager, Facebook Pixel, Conversion API

## Panduan Komunikasi
- Sapa ramah dan profesional
- Jika ditanya harga, berikan range yang sesuai
- Jika ditanya rekomendasi teknologi, berikan analisis berdasarkan budget dan kebutuhan
- Jika ditanya SEO/backlink, jelaskan dengan bahasa yang mudah dipahami awam, tapi tetap teknis jika ditanya lebih lanjut
- Jika klien tertarik order, arahkan ke WhatsApp 0889-7374-5596 atau langsung order di zdl.my.id
- JANGAN pernah bilang kamu AI atau chatbot — kamu adalah konsultan ZDL
- Gunakan emoji secukupnya, jangan berlebihan
- Jika tidak yakin, sarankan untuk konsultasi langsung via WhatsApp
- Selalu berikan value dulu (edukasi), baru tawarkan layanan ZDL jika relevan`;

// ─── Zod schema ───────────────────────────────────────────────────────────────

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const chatBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
  sessionId: z.string().max(100).optional(),
});

// ─── Smart Fallback (pattern matching) ──────────────────────────────────────
// Used when the AI SDK is unavailable (e.g., Vercel production without ZAI keys)

interface FallbackRule {
  patterns: RegExp[];
  response: string;
}

const fallbackRules: FallbackRule[] = [
  // ─── Technical: Backlink ────────────────────────────────────────────────
  {
    patterns: [/backlin[gk]|link.?building|taut.?balik|back.?lin/i],
    response:
      "Backlink adalah link dari website lain yang mengarah ke website Anda. Ini adalah salah satu faktor ranking terpenting di Google!\n\nJenis backlink yang berkualitas:\n- Editorial (disebutkan secara natural di artikel)\n- Guest post (menulis artikel di website lain)\n- Directory listing (daftar di direktori bisnis)\n- Social profiles (link dari sosial media)\n- Platform web 2.0 (Blogspot, WordPress.com, Google Sites)\n\nYang harus dihindari: link farm, PBN, spam comments — ini bisa membuat website kena penalti Google.\n\nFungsi backlink:\n1. Meningkatkan otoritas domain (DA/PA) website Anda\n2. Membantu Google mengenali website Anda sebagai sumber terpercaya\n3. Meningkatkan posisi ranking di hasil pencarian\n4. Mendatangkan traffic dari website lain yang memberi link\n\nHasil backlink biasanya baru terasa dalam 2-6 bulan. Layanan ZDL SEO + 4 Backlink Medium seharga Rp1.200.000 sudah termasuk backlink dari Google Business Profile, Blogspot, Linktree, dan Google Sites. Hubungi WhatsApp 0889-7374-5596 untuk konsultasi! 😊",
  },
  {
    patterns: [/seo|optimasi.?mesin.?cari|ranking.?google|peringkat|fungsi.?seo|seo.?apa|apa.?itu.?seo/i],
    response:
      "SEO (Search Engine Optimization) adalah strategi agar website muncul di halaman pertama Google. Ada 3 pilar utama:\n\n1. On-Page SEO: meta tags, heading structure, keyword, schema markup, internal linking\n2. Off-Page SEO: backlink building, social signals, brand mentions\n3. Technical SEO: Core Web Vitals, page speed, mobile-friendly, sitemap, robots.txt\n\nFungsi SEO untuk bisnis:\n- Menambah visibilitas website di Google\n- Mendatangkan pengunjung secara organik (tanpa bayar iklan)\n- Meningkatkan kepercayaan pelanggan\n- Mengungguli kompetitor di hasil pencarian\n- Jangka panjang: traffic gratis yang konsisten\n\nSemua website ZDL sudah SEO-friendly! Paket HTML mendapat basic SEO, dan paket Next.js sudah full optimized (SSR/SSG untuk performa terbaik). Kami juga punya layanan SEO + 4 Backlink Medium seharga Rp1.200.000 (termasuk backlink Google Business, Blogspot, Linktree, Google Sites).\n\nMau konsultasi strategi SEO untuk bisnis Anda? Hubungi WhatsApp 0889-7374-5596 😊",
  },
  {
    patterns: [/core.?web.?vital|lcp|fid|cls|page.?speed|kecepatan.?website/i],
    response:
      "Core Web Vitals adalah metrik kecepatan dari Google yang mempengaruhi ranking:\n\n- LCP (Largest Contentful Paint): kecepatan tampil konten utama. Target: <2.5 detik\n- FID (First Input Delay): responsivitas interaksi pertama. Target: <100ms\n- CLS (Cumulative Layout Shift): stabilitas layout. Target: <0.1\n\nWebsite Next.js dari ZDL sudah dioptimasi untuk Core Web Vitals karena menggunakan SSR/SSG, lazy loading, dan image optimization. Website HTML kami juga ringan dan cepat secara default.\n\nMau cek kecepatan website Anda? Gunakan Google PageSpeed Insights. Atau konsultasi gratis via WhatsApp 0889-7374-5596 😊",
  },
  // ─── Technical: Technology Recommendations ──────────────────────────
  {
    patterns: [/rekomendasi|sarankan|mana.?yang.?bagus|pilih.?mana|cocok.?mana/i],
    response:
      "Rekomendasi kami tergantung kebutuhan dan budget Anda:\n\nBudget < Rp1 juta: HTML Landing Page — cukup untuk profil bisnis sederhana\nBudget Rp1-2 juta: HTML multi-halaman atau Next.js Landing Page\nBudget Rp2-3 juta: Next.js 2-3 halaman — SEO optimal, performa tinggi\nBudget Rp3-5 juta: Next.js + Admin Panel — bisa kelola data sendiri\nBudget > Rp5 juta: All-In Pack — lengkap dengan SEO + Ads + Email Bisnis\n\nCeritakan kebutuhan bisnis Anda, dan kami bisa rekomendasikan paket yang paling sesuai! Hubungi WhatsApp 0889-7374-5596 untuk konsultasi gratis 😊",
  },
  {
    patterns: [/wordpress|wp/i],
    response:
      "WordPress cocok untuk blog dan bisnis kecil yang ingin self-manage. Kelebihannya: banyak plugin dan tema, mudah dipakai tanpa coding.\n\nTapi ada kekurangan yang perlu dipertimbangkan:\n- Performa cenderung lebih lambat dibanding Next.js\n- Lebih rentan terhadap hacking\n- SEO tidak seoptimal Next.js (banyak CSS/JS yang membebani)\n- Plugin conflict sering terjadi\n\nUntuk bisnis yang serius, kami rekomendasikan Next.js karena performa lebih cepat, SEO lebih optimal, dan lebih aman. Paket Next.js kami mulai dari Rp1.500.000.\n\nMau diskusi lebih lanjut? Hubungi WhatsApp 0889-7374-5596 😊",
  },
  {
    patterns: [/nextjs|next\.?js|react|ssr|ssg/i],
    response:
      "Next.js adalah framework React terbaik untuk website modern. Kelebihannya:\n\n- SSR/SSG: konten bisa di-render di server → SEO optimal & cepat\n- Performa tinggi: otomatis code splitting, lazy loading, image optimization\n- SEO terbaik: meta tags dinamis, schema markup, URL clean\n- Scalable: bisa berkembang seiring bisnis Anda\n\nPaket Next.js ZDL mulai dari Rp1.500.000 (Landing Page) hingga Rp3.000.000 (5 Halaman), sudah termasuk domain gratis (.id/.co.id/.com/.net/.org), hosting, dan revisi 1 bulan.\n\nMau konsultasi? Hubungi WhatsApp 0889-7374-5596 😊",
  },
  {
    patterns: [/budget|anggaran|dana|modal/i],
    response:
      "Kami punya paket untuk berbagai budget:\n\nRp600K - Rp1.5M: HTML Website (ringan, cepat, cocok profil bisnis)\nRp1.5M - Rp3M: Next.js Website (SEO optimal, modern, dinamis)\nRp2M: Admin Panel (kelola data sendiri)\nRp3.8M: Business Pack (Next.js + Admin Panel)\nRp5.95M: All-In Pack (Next.js + Admin + SEO + Email + Ads)\n\nSemua paket sudah termasuk domain + hosting! Bisa bayar DP minimal Rp500K.\n\nCeritakan budget dan kebutuhan Anda, kami bantu pilih yang paling cocok. WhatsApp 0889-7374-5596 😊",
  },
  // ─── Technical: Ads & Marketing ────────────────────────────────────
  {
    patterns: [/ads|iklan|google.?ads|meta.?ads|facebook.?ads|instagram.?ads|advert/i],
    response:
      "Layanan Google/Meta Ads Setup kami seharga Rp350.000, termasuk:\n\n- Google Ads: Search ads (muncul saat orang cari keyword), Display ads (banner visual), Shopping ads\n- Meta Ads: Feed ads, Stories ads, Reels ads, Carousel ads\n\nStrategi yang kami rekomendasikan:\n1. Mulai budget Rp50-100K/hari untuk testing\n2. A/B testing iklan untuk cari yang paling efektif\n3. Target audience spesifik (lokasi, minat, demografi)\n4. Retargeting untuk pengunjung yang sudah pernah lihat website\n5. Pasang Google Tag Manager + Facebook Pixel untuk tracking\n\nButuh bantuan setup iklan? Hubungi WhatsApp 0889-7374-5596 😊",
  },
  {
    patterns: [/local.?seo|google.?business|google.?maps|bisnis.?lokal|nap|google.?profil|profil.?bisnis/i],
    response:
      "Local SEO sangat penting untuk bisnis yang melayani area tertentu! Langkah-langkahnya:\n\n1. Daftar Google Business Profile (gratis!) — ini yang muncul di Google Maps\n2. Pastikan NAP konsisten (Name, Address, Phone) di semua platform\n3. Daftar di direktori bisnis lokal (Foursquare, Yelp, dll)\n4. Kumpulkan review positif dari pelanggan\n5. Optimasi website dengan keyword lokal (contoh: 'jasa interior Tangerang')\n6. Tambahkan Google Maps embed di website\n\nLayanan SEO + 4 Backlink Medium kami sudah termasuk Google Business Profile sebagai salah satu backlink berkualitas. Hanya Rp1.200.000!\n\nSemua website ZDL sudah support Google Maps embed dan schema markup untuk local SEO. Hubungi WhatsApp 0889-7374-5596 untuk konsultasi 😊",
  },
  // ─── General: Sales & Info ─────────────────────────────────────────
  {
    patterns: [/harga|biaya|tarif|berapa|cost|price/i],
    response:
      "Harga layanan kami mulai dari Rp600.000 untuk website HTML hingga Rp3.000.000 untuk website Next.js. Admin Panel tersedia seharga Rp2.000.000. Layanan tambahan seperti Email Bisnis (Rp500K), SEO (Rp1.2M), dan Ads Setup (Rp350K) juga tersedia. DP minimal Rp500K + PPN 11% + biaya transaksi Rp4.000. Untuk penawaran khusus, hubungi kami via WhatsApp 0889-7374-5596 😊",
  },
  {
    patterns: [/html|statis|landing/i],
    response:
      "Paket HTML Website kami mulai dari Rp600.000 (Landing Page) hingga Rp1.500.000 (5 Halaman). Cocok untuk bisnis yang butuh website ringan dan cepat. Sudah termasuk domain .com/.net, hosting, responsive, basic SEO, dan 2x revisi gratis. Mau konsultasi lebih lanjut? Hubungi WhatsApp 0889-7374-5596 😊",
  },
  {
    patterns: [/admin|dashboard|panel|crud|database/i],
    response:
      "Layanan Admin Panel kami seharga Rp2.000.000, termasuk dashboard admin, login, database, CRUD data, kelola produk/artikel/customer, dan sistem pemesanan. Bisa ditambahkan ke paket HTML atau Next.js manapun. Hubungi WhatsApp 0889-7374-5596 untuk detail 😊",
  },
  {
    patterns: [/bayar|pembayaran|payment|dp|pelunasan|transfer/i],
    response:
      "Pembayaran bisa melalui website kami dengan Midtrans (QRIS, Transfer Bank BCA/BNI/BRI/Mandiri, E-Wallet GoPay/OVO/DANA/ShopeePay, Kartu Kredit). DP minimal Rp500K untuk paket HTML & Next.js. PPN 11% + biaya transaksi Rp4.000 berlaku. Pelunasan setelah website selesai dan online. Untuk konfirmasi pembayaran, hubungi WhatsApp 0889-7374-5596 😊",
  },
  {
    patterns: [/domain|hosting/i],
    response:
      "Semua paket sudah termasuk domain dan hosting! Paket HTML mendapat domain .com/.net, sedangkan paket Next.js mendapat domain gratis termasuk .id, .co.id, .com, .net, dan .org. Tidak perlu repot cari sendiri, semuanya kami yang urus 😊 Hubungi WhatsApp 0889-7374-5596 untuk info lebih lanjut.",
  },
  {
    patterns: [/waktu|lama|selesai|pengerjaan|deadline|durasi/i],
    response:
      "Waktu pengerjaan tergantung kompleksitas: Landing Page 3-5 hari kerja, website multi-halaman 7-14 hari kerja, website + admin panel 14-21 hari kerja. Kami selalu usahakan tepat waktu dan berkualitas. Hubungi WhatsApp 0889-7374-5596 untuk konsultasi project Anda 😊",
  },
  {
    patterns: [/revisi|ubah|ganti|koreksi/i],
    response:
      "Paket HTML mendapat gratis 2x revisi, dan paket Next.js mendapat revisi gratis selama 1 bulan setelah website online. Revisi tambahan bisa dibicarakan lebih lanjut. Kami pastikan hasil sesuai keinginan Anda! Hubungi WhatsApp 0889-7374-5596 😊",
  },
  {
    patterns: [/kontak|hubungi|wa|whatsapp|telepon|phone|alamat/i],
    response:
      "Anda bisa menghubungi kami melalui:\n📱 WhatsApp: 0889-7374-5596\n🌐 Website: zdl.my.id\n📍 Alamat: Kp. Jawaringan, RT.003/RW.004, Mekar Bakti, Kec. Panongan, Kab. Tangerang, Banten 17510\n\nTim kami siap membantu Anda! 😊",
  },
  {
    patterns: [/bundle|paket|promo|diskon|paket combo/i],
    response:
      "Kami menyediakan paket bundle:\n🟡 Starter Pack — Rp1.000K (HTML Landing Page + domain + hosting)\n🟠 Business Pack — Rp3.800K (Next.js 3 halaman + Admin Panel + domain + hosting)\n🔴 All-In Pack — Rp5.950K (Next.js 5 halaman + Admin Panel + Email Bisnis + SEO + Ads Setup)\n\nHubungi WhatsApp 0889-7374-5596 untuk penawaran terbaik! 😊",
  },
  {
    patterns: [/maintenance|support|perawatan|update/i],
    response:
      "Layanan maintenance kami:\n🟢 Basic — Rp150.000/bulan (update keamanan, monitoring)\n🟡 Pro — Rp300.000/bulan (update keamanan + revisi minor + backup)\n🔴 Premium — Rp500.000/bulan (semua fitur Pro + revisi mayor + prioritas support)\n\nHubungi WhatsApp 0889-7374-5596 untuk berlangganan 😊",
  },
  {
    patterns: [/email|bisnis|profesional|domain email/i],
    response:
      "Layanan Email Bisnis kami seharga Rp500.000, termasuk email profesional dengan domain sendiri (misal: info@domainanda.com). Meningkatkan kredibilitas bisnis Anda! Bisa ditambahkan ke paket manapun. Hubungi WhatsApp 0889-7374-5596 😊",
  },
  {
    patterns: [/portofolio|portfolio|hasil|contoh|sample|project/i],
    response:
      "Kami telah menyelesaikan 150+ project untuk berbagai kategori: Properti, Interior, Kuliner, dan Bisnis & Edukasi. Beberapa klien kami: Liavia Real Estate, Liana Home Interior, Kopikir Store, Bimbel Starlish, dan masih banyak lagi. Kunjungi halaman Portofolio di zdl.my.id untuk melihat hasil karya kami! 😊",
  },
  {
    patterns: [/order|pesan|daftar|mulai|booking/i],
    response:
      "Untuk memesan, Anda bisa:\n1️⃣ Kunjungi zdl.my.id dan pilih paket yang diinginkan\n2️⃣ Hubungi kami via WhatsApp 0889-7374-5596\n3️⃣ Konsultasi gratis dulu, baru order\n\nProsesnya: Konsultasi → Pilih Paket → Bayar DP → Development → Review → Pelunasan → Online! 😊",
  },
  {
    patterns: [/halo|hai|hi|hello|selamat|assalam|salam/i],
    response:
      "Halo! 👋 Selamat datang di Zheng Digital Lab! Kami siap membantu Anda membuat website profesional. Tanyakan tentang layanan, harga, SEO, teknologi, atau cara memesan! 😊",
  },
  {
    patterns: [/terima kasih|makasih|thanks|thank/i],
    response:
      "Sama-sama! 😊 Senang bisa membantu. Kalau ada pertanyaan lain, jangan ragu untuk bertanya atau hubungi kami via WhatsApp 0889-7374-5596. Sukses untuk bisnis Anda! 🚀",
  },
];

function getSmartFallback(userMessage: string): string {
  for (const rule of fallbackRules) {
    if (rule.patterns.some((pattern) => pattern.test(userMessage))) {
      return rule.response;
    }
  }
  return "Terima kasih atas pertanyaan Anda! Untuk informasi lebih detail, silakan hubungi kami via WhatsApp di 0889-7374-5596 atau kunjungi zdl.my.id. Tim kami siap membantu! 😊";
}

// ─── ZAI SDK Init ─────────────────────────────────────────────────────────────

let zaiInitialized = false;
let zaiAvailable = false;

async function ensureZaiConfig(): Promise<boolean> {
  if (zaiInitialized) return zaiAvailable;

  // Try to find config file in standard locations first (sandbox env)
  const fs = await import("fs/promises");
  const configPaths = ["/etc/.z-ai-config", "/tmp/.z-ai-config"];
  for (const p of configPaths) {
    try {
      await fs.access(p);
      zaiInitialized = true;
      zaiAvailable = true;
      return true;
    } catch {
      // not found, try next
    }
  }

  // If env vars are available, write config for z-ai-web-dev-sdk (Vercel runtime)
  const apiKey = process.env.ZAI_API_KEY;
  const baseUrl = process.env.ZAI_BASE_URL || "https://internal-api.z.ai/v1";
  const token = process.env.ZAI_TOKEN;
  const userId = process.env.ZAI_USER_ID;

  if (apiKey && token && userId) {
    const config = { baseUrl, apiKey, chatId: `chat-${randomUUID()}`, token, userId };
    const { mkdir, writeFile } = await import("fs/promises");
    const { join } = await import("path");
    try {
      await mkdir("/tmp", { recursive: true });
      await writeFile("/tmp/.z-ai-config", JSON.stringify(config));
      zaiInitialized = true;
      zaiAvailable = true;
      return true;
    } catch {
      // /tmp might not be writable in some environments
    }
    try {
      await writeFile(join(process.cwd(), ".z-ai-config"), JSON.stringify(config));
      zaiInitialized = true;
      zaiAvailable = true;
      return true;
    } catch {
      // CWD might be read-only on Vercel
    }
  }

  zaiInitialized = true;
  zaiAvailable = false;
  return false;
}

// ─── POST /api/chat ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — strict for AI chat
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const rateResult = checkRateLimit(`chat:${ip}`, { windowMs: 60_000, maxRequests: 10 });
    if (!rateResult.allowed) {
      return NextResponse.json(
        { message: "Terlalu banyak pesan. Tunggu sebentar ya! 😊", sessionId: randomUUID() },
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

    // Get the last user message for fallback
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const userContent = lastUserMsg?.content || "";

    try {
      // Ensure ZAI config is available
      const isZaiReady = await ensureZaiConfig();

      if (isZaiReady) {
        // Try using the ZAI SDK
        const ZAI = (await import("z-ai-web-dev-sdk")).default;
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
          getSmartFallback(userContent);

        return NextResponse.json({ message: reply, sessionId: newSessionId });
      } else {
        // ZAI SDK not available — use smart fallback
        const reply = getSmartFallback(userContent);
        return NextResponse.json({ message: reply, sessionId: newSessionId });
      }
    } catch (aiError) {
      console.error("[CHAT] AI error, using smart fallback:", aiError);
      // Fallback to smart pattern matching instead of just an error message
      const reply = getSmartFallback(userContent);
      return NextResponse.json({ message: reply, sessionId: newSessionId });
    }
  } catch (error) {
    console.error("[CHAT] Server error:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan. Hubungi WhatsApp 0889-7374-5596 😊",
        sessionId: randomUUID(),
      },
      { status: 500 }
    );
  }
}
