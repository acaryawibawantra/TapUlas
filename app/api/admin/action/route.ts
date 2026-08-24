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

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const body = await req.json();
    const { cardId, count } = body || {};
    const adminSecret = process.env.ADMIN_SECRET_KEY || "ulasin-admin-secret-2026";

    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = body;
    const supabase = getSupabaseServerClient();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ulasin-id.vercel.app";

    // 1. RESET CARD (Set back to unactivated status)
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

    // 2. DELETE CARD
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

    // 3. INSTANT GENERATE CARDS FROM BROWSER
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

    return NextResponse.json({ error: "Aksi tidak valid." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
