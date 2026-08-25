// Script buat generate card_id baru + simpan ke database + bikin QR code-nya.
// Jalankan: node scripts/generate-card.mjs
// (pastikan .env.local sudah diisi, dan jalankan `npm install dotenv` kalau belum ada)
//
// Ini SATU-SATUNYA tempat card_id dibuat. QR code di-generate dari card_id
// yang sama persis dengan yang nanti kamu tulis ke chip NFC pakai app NFC Tools —
// supaya tidak ada typo/mismatch antara NFC dan QR di kartu yang sama.

import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; // contoh: https://ratey.site
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateCardId(length = 6) {
  // Huruf besar + angka, tanpa karakter yang gampang ketuker (0/O, 1/I) biar
  // gampang dibaca manusia kalau perlu dicatat manual untuk keperluan inventaris.
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

async function main() {
  if (!BASE_URL) {
    console.error("NEXT_PUBLIC_BASE_URL belum diisi di .env.local");
    process.exit(1);
  }

  const count = Number(process.argv[2] || 1); // node scripts/generate-card.mjs 5 -> generate 5 kartu
  const outDir = path.join(__dirname, "..", "generated-cards");
  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < count; i++) {
    let cardId = generateCardId();

    // Pastikan card_id belum dipakai (super jarang bentrok, tapi jaga-jaga)
    let { data: existing } = await supabase
      .from("cards")
      .select("card_id")
      .eq("card_id", cardId)
      .maybeSingle();

    while (existing) {
      cardId = generateCardId();
      const check = await supabase
        .from("cards")
        .select("card_id")
        .eq("card_id", cardId)
        .maybeSingle();
      existing = check.data;
    }

    const { error } = await supabase.from("cards").insert({ card_id: cardId });
    if (error) {
      console.error(`Gagal insert card ${cardId}:`, error.message);
      continue;
    }

    const url = `${BASE_URL}/c/${cardId}`;
    const qrPath = path.join(outDir, `${cardId}.png`);
    await QRCode.toFile(qrPath, url, { width: 600, margin: 2 });

    console.log(`✅ Kartu ${cardId} dibuat`);
    console.log(`   URL (tulis ini ke NFC pakai app "NFC Tools"): ${url}`);
    console.log(`   QR code disimpan di: ${qrPath}`);
    console.log("");
  }

  console.log(`Selesai. ${count} kartu baru siap diproduksi.`);
}

main();
