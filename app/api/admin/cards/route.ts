import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secretKey } = body || {};
    const adminSecret = process.env.ADMIN_SECRET_KEY || "tapulas-admin-secret-2026";

    if (!secretKey || secretKey !== adminSecret) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    const { data: cards, error } = await supabase
      .from("cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cards:", error.message);
      return NextResponse.json({ error: "Gagal mengambil data kartu." }, { status: 500 });
    }

    const totalCount = cards?.length || 0;
    const activeCount = cards?.filter((c) => c.is_active).length || 0;
    const inactiveCount = totalCount - activeCount;

    return NextResponse.json({
      ok: true,
      cards: cards || [],
      stats: {
        totalCount,
        activeCount,
        inactiveCount,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
