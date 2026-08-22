import { redirect, notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import ActivationForm from "./ActivationForm";

// Halaman ini yang di-tap NFC / discan QR. Logic-nya persis seperti di PRD:
// - card_id tidak ada di database -> 404
// - is_active == false -> tampilkan form aktivasi
// - is_active == true  -> redirect otomatis ke halaman review Google

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
    // Jangan bocorkan detail error database ke user, cukup log di server
    console.error("Error fetching card:", error.message);
    throw new Error("Terjadi kesalahan saat memuat kartu.");
  }

  if (!card) {
    notFound();
  }

  if (card.is_active && card.google_review_url) {
    redirect(card.google_review_url);
  }

  // Kartu belum aktif -> tampilkan form aktivasi
  return <ActivationForm cardId={cardId} />;
}
