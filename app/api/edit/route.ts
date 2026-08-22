import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

// Endpoint sederhana untuk halaman edit (belum dibuatkan UI-nya di starter ini,
// tapi backend-nya sudah siap dipakai). Alurnya: user masukin card_id + PIN lama,
// kalau cocok baru boleh update business_name / place_id / pin baru.

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cardId, pin, newBusinessName, newPlaceId, newPin } = body || {};

  if (!cardId || !pin) {
    return NextResponse.json({ error: "card_id dan PIN wajib diisi." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: card, error } = await supabase
    .from("cards")
    .select("card_id, pin_hash, is_active")
    .eq("card_id", cardId.toUpperCase())
    .maybeSingle();

  if (error || !card) {
    return NextResponse.json({ error: "Kartu tidak ditemukan." }, { status: 404 });
  }
  if (!card.is_active || !card.pin_hash) {
    return NextResponse.json({ error: "Kartu belum diaktivasi." }, { status: 400 });
  }

  const pinMatch = await bcrypt.compare(pin, card.pin_hash);
  if (!pinMatch) {
    return NextResponse.json({ error: "PIN salah." }, { status: 401 });
  }

  const updates: Record<string, any> = {};
  if (newBusinessName) updates.business_name = newBusinessName;
  if (newPlaceId) {
    updates.place_id = newPlaceId;
    updates.google_review_url = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
      newPlaceId
    )}`;
  }
  if (newPin) {
    if (!/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ error: "PIN baru harus 4 digit angka." }, { status: 400 });
    }
    updates.pin_hash = await bcrypt.hash(newPin, 10);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan yang dikirim." }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("cards")
    .update(updates)
    .eq("card_id", cardId.toUpperCase());

  if (updateError) {
    return NextResponse.json({ error: "Gagal menyimpan perubahan." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
