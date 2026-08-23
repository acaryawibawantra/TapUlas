"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

type CardData = {
  card_id: string;
  business_name: string | null;
  place_id: string | null;
  google_review_url: string | null;
  is_active: boolean;
  created_at: string;
  activated_at: string | null;
};

type GeneratedCardItem = {
  card_id: string;
  url: string;
  qrDataUrl?: string;
};

export default function AdminDashboard({
  secretKey,
  onLogout,
}: {
  secretKey: string;
  onLogout: () => void;
}) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [stats, setStats] = useState({ totalCount: 0, activeCount: 0, inactiveCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Modal / Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    type: "reset" | "delete";
    cardId: string;
  } | null>(null);

  // Instant Generate Cards Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCount, setGenerateCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newGeneratedCards, setNewGeneratedCards] = useState<GeneratedCardItem[]>([]);

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal memuat data admin.");
        return;
      }

      setCards(data.cards || []);
      setStats(data.stats || { totalCount: 0, activeCount: 0, inactiveCount: 0 });
    } catch (err) {
      setErrorMsg("Terjadi kesalahan koneksi server.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCardAction(type: "reset" | "delete", cardId: string) {
    setActionLoadingId(cardId);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey, action: type, cardId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || `Gagal ${type} kartu.`);
        return;
      }

      setConfirmModal(null);
      await fetchCards();
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleGenerateCards(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey, action: "generate", count: generateCount }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal men-generate kartu.");
        setIsGenerating(false);
        return;
      }

      const generatedList: GeneratedCardItem[] = data.generatedCards || [];
      
      // Generate QR Code PNG Data URLs client-side for immediate download
      for (const item of generatedList) {
        try {
          const qrDataUrl = await QRCode.toDataURL(item.url, { width: 600, margin: 2 });
          item.qrDataUrl = qrDataUrl;
        } catch (err) {
          console.error("QR generation error:", err);
        }
      }

      setNewGeneratedCards(generatedList);
      await fetchCards();
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsGenerating(false);
    }
  }

  function downloadSingleQr(item: GeneratedCardItem) {
    if (!item.qrDataUrl) return;
    const a = document.createElement("a");
    a.href = item.qrDataUrl;
    a.download = `${item.card_id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function downloadAllQr() {
    newGeneratedCards.forEach((item, index) => {
      setTimeout(() => {
        downloadSingleQr(item);
      }, index * 200);
    });
  }

  // Filtered Cards
  const filteredCards = cards.filter((c) => {
    const matchesSearch =
      c.card_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.business_name && c.business_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterStatus === "active") return matchesSearch && c.is_active;
    if (filterStatus === "inactive") return matchesSearch && !c.is_active;
    return matchesSearch;
  });

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }} className="animate-fade-in">
      {/* Admin Header Navbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          background: "#FFFFFF",
          border: "1px solid var(--border-color)",
          borderRadius: 14,
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: "var(--primary)",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            ⚡
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.2 }}>
              TapUlas Admin Dashboard
            </h1>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Kelola Kartu & Generate Barcode</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="btn-secondary"
          style={{ width: "auto", minHeight: 36, padding: "6px 14px", fontSize: 13 }}
        >
          Keluar Admin 🔒
        </button>
      </div>

      {/* Metric Stats Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#FFF", border: "1px solid var(--border-color)", borderRadius: 12, padding: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Kartu</span>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-main)", marginTop: 4 }}>{stats.totalCount}</div>
        </div>

        <div style={{ background: "var(--accent-green-bg)", border: "1px solid var(--accent-green-border)", borderRadius: 12, padding: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#065F46", textTransform: "uppercase" }}>Kartu Aktif (Terhubung)</span>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#047857", marginTop: 4 }}>{stats.activeCount}</div>
        </div>

        <div style={{ background: "var(--accent-amber-bg)", border: "1px solid var(--accent-amber-border)", borderRadius: 12, padding: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-amber)", textTransform: "uppercase" }}>Kartu Belum Aktif</span>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#B45309", marginTop: 4 }}>{stats.inactiveCount}</div>
        </div>
      </div>

      {/* Toolbar (Search, Filter, Generate Button) */}
      <div
        style={{
          background: "#FFF",
          border: "1px solid var(--border-color)",
          borderRadius: 14,
          padding: 16,
          marginBottom: 20,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 300px" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID Kartu (misal: ZUEV8D) atau Nama Bisnis..."
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: 14,
              borderRadius: 8,
              border: "1px solid var(--input-border)",
              outline: "none",
            }}
          />

          <select
            value={filterStatus}
            onChange={(e: any) => setFilterStatus(e.target.value)}
            style={{
              padding: "10px 12px",
              fontSize: 14,
              borderRadius: 8,
              border: "1px solid var(--input-border)",
              outline: "none",
              backgroundColor: "#FFF",
              cursor: "pointer",
            }}
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Saja</option>
            <option value="inactive">Belum Aktif Saja</option>
          </select>
        </div>

        <button
          onClick={() => {
            setShowGenerateModal(true);
            setNewGeneratedCards([]);
          }}
          className="btn-primary"
          style={{ width: "auto", minHeight: 40, padding: "8px 16px" }}
        >
          ⚡ + Generate Kartu Baru
        </button>
      </div>

      {/* Cards Table */}
      <div
        style={{
          background: "#FFF",
          border: "1px solid var(--border-color)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "var(--card-shadow)",
        }}
      >
        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <div className="spinner" style={{ borderColor: "rgba(0,0,0,0.1)", borderTopColor: "var(--primary)", margin: "0 auto 12px auto" }} />
            Memuat data kartu...
          </div>
        ) : filteredCards.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            Tidak ada kartu yang cocok dengan kriteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "12px 16px" }}>ID Kartu</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 16px" }}>Nama Bisnis & Google Place ID</th>
                  <th style={{ padding: "12px 16px" }}>Tanggal Dibuat / Aktif</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Aksi Control</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((c) => (
                  <tr key={c.card_id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 800, fontFamily: "monospace", fontSize: 15, color: "var(--primary)" }}>
                      {c.card_id}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      {c.is_active ? (
                        <span style={{ backgroundColor: "var(--accent-green-bg)", border: "1px solid var(--accent-green-border)", color: "#065F46", padding: "3px 8px", borderRadius: 6, fontWeight: 700, fontSize: 11 }}>
                          🟢 Aktif
                        </span>
                      ) : (
                        <span style={{ backgroundColor: "var(--accent-amber-bg)", border: "1px solid var(--accent-amber-border)", color: "#B45309", padding: "3px 8px", borderRadius: 6, fontWeight: 700, fontSize: 11 }}>
                          🟡 Belum Aktif
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "14px 16px", maxWidth: 280 }}>
                      {c.business_name ? (
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: 2 }}>{c.business_name}</div>
                          {c.google_review_url && (
                            <a href={c.google_review_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "var(--primary)", textDecoration: "underline" }}>
                              Buka Link Review ↗
                            </a>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>Belum diaktifkan pemilik bisnis</span>
                      )}
                    </td>

                    <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 12 }}>
                      <div>Dibuat: {new Date(c.created_at).toLocaleDateString("id-ID")}</div>
                      {c.activated_at && <div style={{ color: "#065F46" }}>Aktif: {new Date(c.activated_at).toLocaleDateString("id-ID")}</div>}
                    </td>

                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        {c.is_active && (
                          <button
                            onClick={() => setConfirmModal({ type: "reset", cardId: c.card_id })}
                            disabled={actionLoadingId === c.card_id}
                            style={{
                              padding: "6px 10px",
                              fontSize: 12,
                              fontWeight: 600,
                              background: "#FFFBEB",
                              border: "1px solid #FDE68A",
                              color: "#B45309",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            🔄 Reset
                          </button>
                        )}

                        <button
                          onClick={() => setConfirmModal({ type: "delete", cardId: c.card_id })}
                          disabled={actionLoadingId === c.card_id}
                          style={{
                            padding: "6px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            background: "#FEF2F2",
                            border: "1px solid #FECACA",
                            color: "#DC2626",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL (RESET / DELETE) */}
      {confirmModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ maxWidth: 400, background: "#FFF" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>
              {confirmModal.type === "reset" ? "Konfirmasi Reset Kartu" : "Konfirmasi Hapus Kartu"}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
              {confirmModal.type === "reset"
                ? `Apakah Anda yakin ingin mereset kartu ${confirmModal.cardId}? Data bisnis & PIN akan dikosongkan dan status kartu menjadi Belum Aktif.`
                : `Apakah Anda yakin ingin menghapus kartu ${confirmModal.cardId} secara permanen dari database?`}
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => handleCardAction(confirmModal.type, confirmModal.cardId)}
                disabled={actionLoadingId === confirmModal.cardId}
                className="btn-primary"
                style={{
                  flex: 1,
                  backgroundColor: confirmModal.type === "reset" ? "var(--accent-amber)" : "var(--accent-red)",
                }}
              >
                {actionLoadingId ? "Memproses..." : confirmModal.type === "reset" ? "Ya, Reset Kartu" : "Ya, Hapus Kartu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE CARDS MODAL WITH QR DOWNLOADER */}
      {showGenerateModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ maxWidth: newGeneratedCards.length > 0 ? 640 : 440, background: "#FFF", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)" }}>
                ⚡ Generate Kartu & Barcode Baru
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-subtle)" }}
              >
                ✕
              </button>
            </div>

            {newGeneratedCards.length === 0 ? (
              <form onSubmit={handleGenerateCards}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
                  Jumlah Kartu Baru yang Ingin Dibuat:
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={generateCount}
                  onChange={(e) => setGenerateCount(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: 16,
                    borderRadius: 8,
                    border: "1px solid var(--input-border)",
                    marginBottom: 16,
                  }}
                />

                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
                  Kartu baru akan otomatis disimpan di database Supabase dan QR Code (.png) siap diunduh untuk desain cetak massal.
                </p>

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => setShowGenerateModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                    Batal
                  </button>
                  <button type="submit" disabled={isGenerating} className="btn-primary" style={{ flex: 1 }}>
                    {isGenerating ? "Membuat..." : `Generate ${generateCount} Kartu`}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div
                  style={{
                    backgroundColor: "var(--accent-green-bg)",
                    border: "1px solid var(--accent-green-border)",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>
                    ✅ Berhasil Men-generate {newGeneratedCards.length} Kartu Baru!
                  </span>

                  <button
                    onClick={downloadAllQr}
                    className="btn-primary"
                    style={{ width: "auto", minHeight: 36, padding: "6px 12px", fontSize: 12 }}
                  >
                    📥 Download Semua PNG
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
                  {newGeneratedCards.map((item) => (
                    <div
                      key={item.card_id}
                      style={{
                        border: "1px solid var(--border-color)",
                        borderRadius: 10,
                        padding: 12,
                        textAlign: "center",
                        backgroundColor: "#F9FAFB",
                      }}
                    >
                      {item.qrDataUrl && (
                        <img
                          src={item.qrDataUrl}
                          alt={`QR Code ${item.card_id}`}
                          style={{ width: 120, height: 120, borderRadius: 6, margin: "0 auto 8px auto", display: "block" }}
                        />
                      )}
                      <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 16, color: "var(--primary)", marginBottom: 6 }}>
                        {item.card_id}
                      </div>

                      <button
                        onClick={() => downloadSingleQr(item)}
                        className="btn-secondary"
                        style={{ width: "100%", minHeight: 32, padding: "4px 8px", fontSize: 11 }}
                      >
                        📥 Download {item.card_id}.png
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="btn-primary"
                  style={{ width: "100%" }}
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
