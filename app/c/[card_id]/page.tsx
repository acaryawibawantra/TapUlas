import { redirect, notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import ActivationForm from "./ActivationForm";

// Pastikan halaman ini SELALU mengecek database terbaru (tanpa cache Next.js)
// setiap kali kartu di-tap NFC / di-scan QR oleh siapapun.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CardPage({
  params,
}: {
  params: { card_id: string };
}) {
  const cardId = params.card_id.toUpperCase();
  const supabase = getSupabaseServerClient();

  const { data: card, error } = await supabase
    .from("cards")
    .select("*")
    .eq("card_id", cardId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching card:", error.message);
    throw new Error("Terjadi kesalahan saat memuat kartu.");
  }

  if (!card) {
    notFound();
  }

  // Jika kartu sudah aktif -> INSTANT HTTP SERVER REDIRECT (Tanpa layar loading / delay)
  // Di Android, ini akan langsung memicu aplikasi Google Maps Native terbuka otomatis.
  if (card.is_active && card.google_review_url) {
    redirect(card.google_review_url);
  }

  // Kartu belum aktif -> tampilkan form aktivasi
  return <ActivationForm cardId={cardId} />;
}
