"use client";

import { useState, useEffect } from "react";
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

  // QR Preview Modal & Copy feedback states
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [qrPreviewModal, setQrPreviewModal] = useState<{
    cardId: string;
    url: string;
    qrDataUrl: string;
  } | null>(null);

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
    <div className="bg-surface text-on-surface antialiased min-h-screen pb-24 md:pb-0 pt-16 md:pt-0">
      {/* Web Top Nav (Desktop Header) */}
      <header className="hidden md:flex fixed top-0 w-full z-50 justify-between items-center px-6 h-16 bg-surface-white border-b border-outline-variant">
        <div className="flex items-center space-x-2.5">
          <img src="/logofiks.png" alt="UlasIN Logo" className="w-9 h-9 md:w-10 md:h-10 object-contain rounded-lg" />
          <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight">
            UlasIN
          </span>
        </div>

        <nav className="flex items-center space-x-6">
          <span className="text-secondary font-label-bold text-label-bold flex items-center px-2 py-1 rounded bg-secondary-container/10">
            Dashboard Admin
          </span>
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 text-on-surface-variant hover:text-primary transition-colors text-label-bold font-label-bold cursor-pointer"
          >
            <span>Keluar Admin</span>
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
          <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-container-margin md:px-6 pt-6 md:pt-24 pb-stack-lg animate-fade-in">
        {/* Dashboard Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-stack-md bg-surface-white p-6 rounded-xl border border-outline-variant shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-primary text-surface-white rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">bolt</span>
            </div>
            <div>
              <h1 className="text-headline-md font-headline-md text-primary">UlasIN Admin Dashboard</h1>
              <p className="text-body-sm font-body-sm text-text-muted mt-0.5">Kelola Kartu &amp; Generate Barcode</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="md:hidden flex items-center justify-center space-x-2 text-on-surface-variant hover:text-primary transition-colors text-label-bold font-label-bold py-2 px-4 border border-outline-variant rounded-lg"
          >
            <span>Keluar Admin</span>
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>

        {/* Summary Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-md">
          <div className="bg-surface-white border border-outline-variant rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
            <p className="text-label-caps font-label-caps text-text-muted mb-2 uppercase">TOTAL KARTU</p>
            <p className="text-headline-lg font-headline-lg text-primary">{stats.totalCount}</p>
          </div>

          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
            <p className="text-label-caps font-label-caps text-[#166534] mb-2 uppercase">KARTU AKTIF (TERHUBUNG)</p>
            <p className="text-headline-lg font-headline-lg text-[#166534]">{stats.activeCount}</p>
          </div>

          <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
            <p className="text-label-caps font-label-caps text-[#854D0E] mb-2 uppercase">KARTU BELUM AKTIF</p>
            <p className="text-headline-lg font-headline-lg text-[#854D0E]">{stats.inactiveCount}</p>
          </div>
        </div>

        {/* Main Table Section */}
        <div className="bg-surface-white border border-outline-variant rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 gap-4">
            <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari ID Kartu (misal: ZUEV8D) atau Nama Bisnis..."
                  className="w-full pl-10 pr-4 py-3 bg-surface-white border border-outline-variant rounded-lg text-body-md font-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-shadow placeholder:text-outline"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e: any) => setFilterStatus(e.target.value)}
                className="w-full md:w-48 px-4 py-3 bg-surface-white border border-outline-variant rounded-lg text-body-md font-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none appearance-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Belum Aktif</option>
              </select>
            </div>

            <button
              onClick={() => {
                setShowGenerateModal(true);
                setNewGeneratedCards([]);
              }}
              className="w-full md:w-auto flex items-center justify-center space-x-2 bg-primary text-on-primary px-6 py-3 rounded-lg hover:bg-primary-container transition-colors font-label-bold text-label-bold whitespace-nowrap cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Generate Kartu Baru</span>
            </button>
          </div>

          {/* Table Content */}
          {isLoading ? (
            <div className="p-12 text-center text-text-muted">
              <div className="spinner mx-auto mb-3" />
              <span>Memuat data kartu...</span>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              Tidak ada kartu yang cocok dengan pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-4 px-6 text-label-bold font-label-bold text-on-surface-variant">ID Kartu &amp; Link NFC Tools</th>
                    <th className="py-4 px-6 text-label-bold font-label-bold text-on-surface-variant">Status</th>
                    <th className="py-4 px-6 text-label-bold font-label-bold text-on-surface-variant">Nama Bisnis &amp; Google Place ID</th>
                    <th className="py-4 px-6 text-label-bold font-label-bold text-on-surface-variant">Tanggal Dibuat / Aktif</th>
                    <th className="py-4 px-6 text-label-bold font-label-bold text-on-surface-variant text-right">Aksi Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredCards.map((c) => {
                    const baseDomain = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "https://ulasin-id.vercel.app");
                    const nfcUrl = `${baseDomain}/c/${c.card_id}`;

                    return (
                      <tr key={c.card_id} className="hover:bg-surface-bright transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-mono font-bold text-primary text-base mb-1">
                            {c.card_id}
                          </div>
                          {/* Copy NFC Link Box below ID Card */}
                          <div className="mt-1 flex items-center gap-1.5 bg-surface-container-low border border-outline-variant rounded-md px-2.5 py-1.5 max-w-[280px]">
                            <span className="text-[11px] font-mono text-on-surface-variant truncate flex-1 select-all" title={nfcUrl}>
                              {nfcUrl}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(nfcUrl);
                                setCopiedCardId(c.card_id);
                                setTimeout(() => setCopiedCardId(null), 2000);
                              }}
                              className="text-secondary hover:text-primary transition-colors text-[11px] font-bold shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-surface-white border border-outline-variant hover:bg-surface-bright cursor-pointer"
                              title="Salin Link NFC untuk NFC Tools"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {copiedCardId === c.card_id ? "check" : "content_copy"}
                              </span>
                              <span>{copiedCardId === c.card_id ? "Tersalin!" : "Salin NFC"}</span>
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          {c.is_active ? (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-label-caps font-label-caps">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                              <span>Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#FEFCE8] border border-[#FEF08A] text-[#854D0E] text-label-caps font-label-caps">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]"></span>
                              <span>Belum Aktif</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 max-w-xs">
                          {c.business_name ? (
                            <div>
                              <div className="text-label-bold font-label-bold text-primary mb-1">
                                {c.business_name}
                              </div>
                              {c.google_review_url && (
                                <a
                                  href={c.google_review_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-body-sm font-body-sm text-secondary hover:underline inline-flex items-center space-x-1"
                                >
                                  <span>Buka Link Review</span>
                                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-body-sm font-body-sm text-text-muted italic">
                              Belum diaktifkan pemilik bisnis
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-body-sm font-body-sm text-on-surface-variant">
                          <div className="mb-0.5">Dibuat: {new Date(c.created_at).toLocaleDateString("id-ID")}</div>
                          {c.activated_at && (
                            <div className="text-[#166534]">
                              Aktif: {new Date(c.activated_at).toLocaleDateString("id-ID")}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* QR Preview Button */}
                            <button
                              onClick={async () => {
                                try {
                                  const qrDataUrl = await QRCode.toDataURL(nfcUrl, { width: 600, margin: 2 });
                                  setQrPreviewModal({ cardId: c.card_id, url: nfcUrl, qrDataUrl });
                                } catch (e) {
                                  alert("Gagal membuat QR Code preview.");
                                }
                              }}
                              className="inline-flex items-center justify-center px-3 py-1.5 border border-outline-variant text-primary rounded-md hover:bg-surface-container transition-colors text-label-caps font-label-caps space-x-1 cursor-pointer"
                              title="Lihat & Download QR Code"
                            >
                              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                              <span>Lihat QR</span>
                            </button>

                            {c.is_active && (
                              <button
                                onClick={() => setConfirmModal({ type: "reset", cardId: c.card_id })}
                                disabled={actionLoadingId === c.card_id}
                                className="inline-flex items-center justify-center px-3 py-1.5 border border-outline-variant text-on-surface-variant rounded-md hover:bg-surface-container transition-colors text-label-caps font-label-caps space-x-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                                <span>Reset</span>
                              </button>
                            )}

                            <button
                              onClick={() => setConfirmModal({ type: "delete", cardId: c.card_id })}
                              disabled={actionLoadingId === c.card_id}
                              className="inline-flex items-center justify-center px-3 py-1.5 border border-error-container text-error rounded-md hover:bg-error-container transition-colors text-label-caps font-label-caps space-x-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer Stats Info */}
          <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between bg-surface-white">
            <span className="text-body-sm font-body-sm text-text-muted">
              Menampilkan {filteredCards.length} dari {cards.length} kartu
            </span>
          </div>
        </div>
      </main>

      {/* CONFIRMATION MODAL (RESET / DELETE) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface-white rounded-xl p-6 max-w-md w-full animate-fade-in shadow-2xl">
            <h3 className="text-headline-md font-headline-md text-primary mb-2">
              {confirmModal.type === "reset" ? "Konfirmasi Reset Kartu" : "Konfirmasi Hapus Kartu"}
            </h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant mb-6">
              {confirmModal.type === "reset"
                ? `Apakah Anda yakin ingin mereset kartu ${confirmModal.cardId}? Data bisnis & PIN akan dikosongkan.`
                : `Apakah Anda yakin ingin menghapus kartu ${confirmModal.cardId} secara permanen?`}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 border border-outline-variant rounded-lg font-label-bold text-body-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleCardAction(confirmModal.type, confirmModal.cardId)}
                disabled={actionLoadingId === confirmModal.cardId}
                className={`flex-1 py-2.5 text-on-primary rounded-lg font-label-bold text-body-sm cursor-pointer ${
                  confirmModal.type === "reset" ? "bg-amber-600 hover:bg-amber-700" : "bg-error hover:bg-red-700"
                }`}
              >
                {actionLoadingId ? "Memproses..." : confirmModal.type === "reset" ? "Ya, Reset Kartu" : "Ya, Hapus Kartu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR PREVIEW & NFC LINK MODAL */}
      {qrPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface-white rounded-2xl p-6 max-w-md w-full animate-fade-in shadow-2xl text-center">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-3">
              <h3 className="text-headline-md font-headline-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">qr_code_2</span>
                <span>QR Code — {qrPreviewModal.cardId}</span>
              </h3>
              <button
                onClick={() => setQrPreviewModal(null)}
                className="text-on-surface-variant hover:text-primary text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <img
              src={qrPreviewModal.qrDataUrl}
              alt={`QR Code ${qrPreviewModal.cardId}`}
              className="w-48 h-48 mx-auto mb-4 rounded-xl border border-outline-variant p-2 bg-surface-white shadow-sm"
            />

            <div className="mb-5 bg-surface-container-low p-3 rounded-xl border border-outline-variant text-left">
              <label className="text-xs font-bold text-primary block mb-1">
                Link NFC Tools (Siap Disalin):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={qrPreviewModal.url}
                  className="w-full bg-surface-white border border-outline-variant px-2.5 py-1.5 rounded-md text-xs font-mono text-primary outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(qrPreviewModal.url);
                    setCopiedCardId(qrPreviewModal.cardId);
                    setTimeout(() => setCopiedCardId(null), 2000);
                  }}
                  className="bg-secondary text-on-secondary px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap flex items-center gap-1 hover:brightness-110 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedCardId === qrPreviewModal.cardId ? "check" : "content_copy"}
                  </span>
                  <span>{copiedCardId === qrPreviewModal.cardId ? "Tersalin!" : "Salin NFC"}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = qrPreviewModal.qrDataUrl;
                  a.download = `${qrPreviewModal.cardId}.png`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg font-label-bold text-body-sm flex items-center justify-center gap-1.5 hover:bg-primary-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download {qrPreviewModal.cardId}.png</span>
              </button>
              <button
                type="button"
                onClick={() => setQrPreviewModal(null)}
                className="px-4 py-2.5 border border-outline-variant rounded-lg font-label-bold text-body-sm text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE CARDS MODAL WITH QR DOWNLOADER */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md font-headline-md text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bolt</span>
                <span>Generate Kartu &amp; Barcode Baru</span>
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-on-surface-variant hover:text-primary text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {newGeneratedCards.length === 0 ? (
              <form onSubmit={handleGenerateCards}>
                <label className="text-label-bold font-label-bold text-primary block mb-2">
                  Jumlah Kartu Baru yang Ingin Dibuat:
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={generateCount}
                  onChange={(e) => setGenerateCount(Number(e.target.value))}
                  className="w-full p-3 border border-outline-variant rounded-lg text-body-md outline-none focus:ring-2 focus:ring-secondary mb-4"
                />

                <p className="text-body-sm font-body-sm text-text-muted mb-6">
                  Kartu baru akan otomatis disimpan di database Supabase dan QR Code (.png) siap diunduh untuk desain cetak massal.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="flex-1 py-3 border border-outline-variant rounded-lg font-label-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-label-bold hover:bg-primary-container cursor-pointer"
                  >
                    {isGenerating ? "Membuat..." : `Generate ${generateCount} Kartu`}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 mb-4 flex items-center justify-between">
                  <span className="text-body-sm font-body-sm font-bold text-[#166534]">
                    ✅ Berhasil Men-generate {newGeneratedCards.length} Kartu Baru!
                  </span>

                  <button
                    onClick={downloadAllQr}
                    className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-container cursor-pointer"
                  >
                    📥 Download Semua PNG
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {newGeneratedCards.map((item) => (
                    <div key={item.card_id} className="border border-outline-variant rounded-xl p-3 text-center bg-surface-bright">
                      {item.qrDataUrl && (
                        <img
                          src={item.qrDataUrl}
                          alt={`QR Code ${item.card_id}`}
                          className="w-28 h-28 mx-auto mb-2 rounded-md"
                        />
                      )}
                      <div className="font-mono font-bold text-primary text-base mb-2">{item.card_id}</div>

                      <button
                        onClick={() => downloadSingleQr(item)}
                        className="w-full py-1.5 bg-surface-white border border-outline-variant text-xs font-bold rounded-lg hover:bg-surface-container cursor-pointer"
                      >
                        📥 Download {item.card_id}.png
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-bold cursor-pointer"
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
