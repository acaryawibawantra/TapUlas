import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

function generateCardId(length = 6) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40);
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const body = await req.json();
    const {
      secretKey,
      action,
      cardId,
      count,
      clientSlug,
      tableNum,
      tableQrId,
    } = body || {};
    const adminSecret = process.env.ADMIN_SECRET_KEY || "ratey-admin-secret-2026";

    // Support both header authorization and JSON body secretKey
    const providedKey = authHeader ? authHeader.replace("Bearer ", "") : secretKey;

    if (!providedKey || providedKey !== adminSecret) {
      return NextResponse.json({ error: "Akses ditolak. Secret key salah." }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ratey.site";
    const baseUrl = rawBaseUrl.trim().replace(/\/+$/, "");

    // ─────────────────────────────────────────────────────────────────────
    // 1. RESET CARD (Set back to unactivated status)
    // ─────────────────────────────────────────────────────────────────────
    if (action === "reset") {
      if (!cardId) {
        return NextResponse.json({ error: "Card ID wajib diisi." }, { status: 400 });
      }

      const { error } = await supabase
        .from("cards")
        .update({
          business_name: null,
          place_id: null,
          google_review_url: null,
          pin_hash: null,
          is_active: false,
          activated_at: null,
        })
        .eq("card_id", cardId.toUpperCase());

      if (error) {
        return NextResponse.json({ error: "Gagal mereset kartu." }, { status: 500 });
      }

      return NextResponse.json({ ok: true, message: `Kartu ${cardId} berhasil di-reset.` });
    }

    // ─────────────────────────────────────────────────────────────────────
    // 2. DELETE CARD
    // ─────────────────────────────────────────────────────────────────────
    if (action === "delete") {
      if (!cardId) {
        return NextResponse.json({ error: "Card ID wajib diisi." }, { status: 400 });
      }

      const { error } = await supabase
        .from("cards")
        .delete()
        .eq("card_id", cardId.toUpperCase());

      if (error) {
        return NextResponse.json({ error: "Gagal menghapus kartu." }, { status: 500 });
      }

      return NextResponse.json({ ok: true, message: `Kartu ${cardId} berhasil dihapus.` });
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3. INSTANT GENERATE CARDS FROM BROWSER
    // ─────────────────────────────────────────────────────────────────────
    if (action === "generate") {
      const cardCount = Math.min(Math.max(Number(count) || 1, 1), 50);
      const generatedCards: Array<{ card_id: string; url: string }> = [];

      for (let i = 0; i < cardCount; i++) {
        let newId = generateCardId();

        // Ensure uniqueness
        let { data: existing } = await supabase
          .from("cards")
          .select("card_id")
          .eq("card_id", newId)
          .maybeSingle();

        while (existing) {
          newId = generateCardId();
          const check = await supabase
            .from("cards")
            .select("card_id")
            .eq("card_id", newId)
            .maybeSingle();
          existing = check.data;
        }

        const { error } = await supabase.from("cards").insert({ card_id: newId });
        if (error) {
          console.error(`Gagal insert card ${newId}:`, error.message);
          continue;
        }

        generatedCards.push({
          card_id: newId,
          url: `${baseUrl}/c/${newId}`,
        });
      }

      return NextResponse.json({
        ok: true,
        message: `Berhasil men-generate ${generatedCards.length} kartu baru.`,
        generatedCards,
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // 4. GENERATE TABLE QR (Custom Meja Cafe) — BATCH INSERT ke DB
    //    Skip existing (client_slug + table_num yang sudah ada tidak overwrite)
    // ─────────────────────────────────────────────────────────────────────
    if (action === "generate_table_qr") {
      const slug = sanitizeSlug(clientSlug || "");
      if (!slug) {
        return NextResponse.json(
          { error: "Client Slug tidak valid (hanya huruf kecil, angka, strip, underscore)." },
          { status: 400 }
        );
      }
      const tableCount = Math.min(Math.max(Number(count) || 1, 1), 500);

      // 1) Fetch existing meja untuk client ini (buat di-skip)
      const { data: existingRows, error: fetchError } = await supabase
        .from("table_qrs")
        .select("table_num")
        .eq("client_slug", slug);

      if (fetchError) {
        console.error("fetch table_qrs error:", fetchError.message);
        return NextResponse.json({ error: "Gagal cek data meja existing." }, { status: 500 });
      }

      const existingSet = new Set((existingRows || []).map((r: any) => r.table_num));
      const newlyCreated: Array<{ id: number; client_slug: string; table_num: string; url: string }> = [];
      let skipped = 0;

      // 2) Loop & upsert (skip existing)
      for (let i = 1; i <= tableCount; i++) {
        const num = String(i).padStart(2, "0");
        if (existingSet.has(num)) { skipped++; continue; }

        const url = `${baseUrl}/${slug}?table=${num}`;
        const { data: inserted, error: insError } = await supabase
          .from("table_qrs")
          .insert({ client_slug: slug, table_num: num, url })
          .select("id, client_slug, table_num, url")
          .maybeSingle();

        if (insError) {
          // Unique violation (race condition) — skip dengan aman
          if ((insError as any)?.code === "23505") { skipped++; continue; }
          console.error(`insert table_qr error for ${slug}/${num}:`, insError.message);
          continue;
        }
        if (inserted) newlyCreated.push(inserted as any);
      }

      return NextResponse.json({
        ok: true,
        message: `Selesai. Baru dibuat: ${newlyCreated.length}. Di-skip (sudah ada): ${skipped}.`,
        clientSlug: slug,
        newlyCreated,
        skippedCount: skipped,
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // 5. DELETE SINGLE TABLE QR (by id)
    // ─────────────────────────────────────────────────────────────────────
    if (action === "delete_table_qr") {
      const id = Number(tableQrId);
      if (!Number.isFinite(id) || id <= 0) {
        return NextResponse.json({ error: "ID Table QR tidak valid." }, { status: 400 });
      }
      const { error } = await supabase.from("table_qrs").delete().eq("id", id);
      if (error) {
        console.error("delete_table_qr error:", error.message);
        return NextResponse.json({ error: "Gagal menghapus meja." }, { status: 500 });
      }
      return NextResponse.json({ ok: true, message: `Meja #${id} berhasil dihapus.` });
    }

    // ─────────────────────────────────────────────────────────────────────
    // 6. DELETE ALL TABLE QR BY CLIENT SLUG
    // ─────────────────────────────────────────────────────────────────────
    if (action === "delete_client_table_batch") {
      const slug = sanitizeSlug(clientSlug || "");
      if (!slug) {
        return NextResponse.json({ error: "Client Slug tidak valid." }, { status: 400 });
      }
      const { error } = await supabase.from("table_qrs").delete().eq("client_slug", slug);
      if (error) {
        console.error("delete_client_table_batch error:", error.message);
        return NextResponse.json({ error: "Gagal menghapus batch client." }, { status: 500 });
      }
      return NextResponse.json({ ok: true, message: `Semua meja client "${slug}" berhasil dihapus.` });
    }

    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  } catch (err) {
    console.error("admin/action error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
