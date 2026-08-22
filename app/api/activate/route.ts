import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

// Endpoint ini dipanggil dari ActivationForm.tsx saat pemilik bisnis klik
// "Aktifkan Kartu". Tugasnya: generate link review dari place_id yang dipilih,
// hash PIN, lalu ubah is_active jadi true.

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cardId, placeId, businessName, pin } = body || {};

  if (!cardId || !placeId || !businessName || !pin) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }
  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "PIN harus 4 digit angka." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Pastikan kartu ada dan memang belum aktif (mencegah re-aktivasi tanpa PIN lewat endpoint ini)
  const { data: existing, error: fetchError } = await supabase
    .from("cards")
    .select("card_id, is_active")
    .eq("card_id", cardId.toUpperCase())
    .maybeSingle();

  if (fetchError) {
    console.error(fetchError.message);
    return NextResponse.json({ error: "Gagal memeriksa kartu." }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Kartu tidak ditemukan." }, { status: 404 });
  }
  if (existing.is_active) {
    return NextResponse.json(
      { error: "Kartu ini sudah aktif. Gunakan halaman edit untuk mengubah data." },
      { status: 409 }
    );
  }

  const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
    placeId
  )}`;
  const pinHash = await bcrypt.hash(pin, 10);

  const { error: updateError } = await supabase
    .from("cards")
    .update({
      business_name: businessName,
      place_id: placeId,
      google_review_url: googleReviewUrl,
      pin_hash: pinHash,
      is_active: true,
      activated_at: new Date().toISOString(),
    })
    .eq("card_id", cardId.toUpperCase());

  if (updateError) {
    console.error(updateError.message);
    return NextResponse.json({ error: "Gagal menyimpan aktivasi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, googleReviewUrl });
}
