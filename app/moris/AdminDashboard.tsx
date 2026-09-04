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

type TableQrData = {
  id: number;
  client_slug: string;
  table_num: string;
  url: string;
  created_at: string;
};

type GeneratedCardItem = {
  card_id: string;
  url: string;
  qrDataUrl?: string;
};

type GeneratedTableItem = {
  id?: number;
  tableNum: string;
  url: string;
  qrDataUrl: string;
};

export default function AdminDashboard({
  secretKey,
  onLogout,
}: {
  secretKey: string;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"standard" | "custom_tables">("standard");

  const [cards, setCards] = useState<CardData[]>([]);
  const [stats, setStats] = useState({ totalCount: 0, activeCount: 0, inactiveCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Table QRs (Custom) Persistent State
  const [tableQrs, setTableQrs] = useState<TableQrData[]>([]);
  const [tableQrStats, setTableQrStats] = useState({ totalTables: 0, totalClients: 0 });
  const [tableQrClientFilter, setTableQrClientFilter] = useState<string>("all");

  // Modal / Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [tableActionLoadingId, setTableActionLoadingId] = useState<number | string | null>(null);
  const [confirmModal, setConfirmModal] = useState<
    | { type: "reset" | "delete"; cardId: string }
    | { type: "delete_table"; tableId: number; tableNum: string }
    | { type: "delete_client_batch"; clientSlug: string }
    | null
  >(null);

  // Instant Generate Cards Modal (Standard)
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCount, setGenerateCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newGeneratedCards, setNewGeneratedCards] = useState<GeneratedCardItem[]>([]);

  // Custom Table QR Generator States
  const [customClientSlug, setCustomClientSlug] = useState("tammmu");
  const [tableGenerateCount, setTableGenerateCount] = useState(1);
  const [isGeneratingTables, setIsGeneratingTables] = useState(false);
  const [generatedTables, setGeneratedTables] = useState<GeneratedTableItem[]>([]);

  // QR Preview Modal & Copy feedback states
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [copiedTableNum, setCopiedTableNum] = useState<string | null>(null);
  const [qrPreviewModal, setQrPreviewModal] = useState<{
    cardId: string;
    url: string;
    qrDataUrl: string;
  } | null>(null);
  const [tableQrPreview, setTableQrPreview] = useState<{
    tableNum: string;
    clientSlug: string;
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
      setTableQrs(data.tableQrs || []);
      setTableQrStats({
        totalTables: data.tableQrStats?.totalTables || 0,
        totalClients: data.tableQrStats?.totalClients || 0,
      });
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

      fetchCards();
      setConfirmModal(null);
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleTableQrDelete(tableId: number) {
    setTableActionLoadingId(tableId);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey, action: "delete_table_qr", tableQrId: tableId }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Gagal menghapus meja."); return; }
      fetchCards();
      setConfirmModal(null);
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setTableActionLoadingId(null);
    }
  }

  async function handleClientBatchDelete(clientSlug: string) {
    setTableActionLoadingId(`client:${clientSlug}`);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey, action: "delete_client_table_batch", clientSlug }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Gagal menghapus batch client."); return; }
      if (tableQrClientFilter === clientSlug) setTableQrClientFilter("all");
      fetchCards();
      setConfirmModal(null);
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setTableActionLoadingId(null);
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
      fetchCards();
    } catch (err) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Generate Table QRs for Custom Clients (Tammmu, etc)
  // STEP 1: Call API untuk INSERT ke DB (skip existing, idempotent)
  // STEP 2: Hasil + existing tampilkan di grid dengan QR di-generate on-the-fly di client
  async function handleGenerateTableQRs(clientSlug: string, count: number) {
    setIsGeneratingTables(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secretKey,
          action: "generate_table_qr",
          clientSlug,
          count,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal generate batch meja.");
        setIsGeneratingTables(false);
        return;
      }

      // Refresh list (persistent) dari DB
      await fetchCards();

      // Tampilkan HASIL BARU SAJA sebagai highlighted GeneratedTableItem (user bisa langsung download)
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://ratey.site";
      const slug = clientSlug.toLowerCase().trim();
      const tables: GeneratedTableItem[] = [];

      // 1) Masukkan data BARU dari response API ke generatedTables
      for (const row of data.newlyCreated || []) {
        try {
          const qrDataUrl = await QRCode.toDataURL(row.url, {
            width: 800,
            margin: 2,
            color: { dark: "#26231E", light: "#FAF8F5" },
          });
          tables.push({ id: row.id, tableNum: row.table_num, url: row.url, qrDataUrl });
        } catch (err) {
          console.error("Error generating table QR:", err);
        }
      }

      // 2) Kalau semua di-skip (sudah ada), kasih petunjuk dengan display existing meja untuk client ini
      if (tables.length === 0 && (data.skippedCount || 0) > 0) {
        // Generate QR dari existing list yang sudah di-refresh di state tableQrs
        const existingForClient = tableQrs.filter((t) => t.client_slug === slug);
        for (const row of existingForClient.slice(0, 30)) {
          try {
            const qrDataUrl = await QRCode.toDataURL(row.url, {
              width: 800,
              margin: 2,
              color: { dark: "#26231E", light: "#FAF8F5" },
            });
            tables.push({ id: row.id, tableNum: row.table_num, url: row.url, qrDataUrl });
          } catch { /* ignore */ }
        }
        // Set filter ke client ini biar user lihat semua existing
        setTableQrClientFilter(slug);
      }

      if (data.message) {
        setErrorMsg(`ℹ️ ${data.message}`);
        setTimeout(() => setErrorMsg(""), 5000);
      }

      setGeneratedTables(tables);
      // Auto-switch filter ke client ini
      if (tables.length > 0 && data?.clientSlug) {
        setTableQrClientFilter(data.clientSlug);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi server.");
    } finally {
      setIsGeneratingTables(false);
    }
  }

  function handleCopyText(text: string, cardId: string) {
    navigator.clipboard.writeText(text);
    setCopiedCardId(cardId);
    setTimeout(() => setCopiedCardId(null), 2000);
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

  function downloadSingleTableQr(table: GeneratedTableItem, clientSlugOverride?: string) {
    const a = document.createElement("a");
    a.href = table.qrDataUrl;
    const slug = clientSlugOverride || customClientSlug || "custom";
    a.download = `qr-meja-${table.tableNum}-${slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function downloadAllTableQrs(overrideList?: GeneratedTableItem[], clientSlugOverride?: string) {
    const list = overrideList || generatedTables;
    const slug = clientSlugOverride || customClientSlug;
    list.forEach((item, index) => {
      setTimeout(() => {
        downloadSingleTableQr(item, slug);
      }, index * 150);
    });
  }

  // Helper: Convert single TableQrData ke GeneratedTableItem (generate QR on the fly)
  async function tableQrDataToItem(row: TableQrData): Promise<GeneratedTableItem> {
    try {
      const qrDataUrl = await QRCode.toDataURL(row.url, {
        width: 800,
        margin: 2,
        color: { dark: "#26231E", light: "#FAF8F5" },
      });
      return { id: row.id, tableNum: row.table_num, url: row.url, qrDataUrl };
    } catch (err) {
      console.error("QR generate error for table", row.table_num, err);
      return { id: row.id, tableNum: row.table_num, url: row.url, qrDataUrl: "" };
    }
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
    <div className="bg-surface text-on-surface antialiased min-h-screen pb-24 md:pb-0 pt-16 md:pt-0 font-sans">
      {/* Web Top Nav (Desktop Header) */}
      <header className="hidden md:flex fixed top-0 w-full z-50 justify-between items-center px-6 h-16 bg-surface-white border-b border-outline-variant">
        <div className="flex items-center space-x-2.5">
          <img src="/ratey-logo.png" alt="Ratey Logo" className="w-9 h-9 md:w-10 md:h-10 object-cover rounded-xl" />
          <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight">
            Ratey Admin
          </span>
        </div>

        <nav className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab("standard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "standard"
                ? "bg-primary text-surface-white shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
          >
            💳 Kartu Direct Maps
          </button>
          <button
            onClick={() => setActiveTab("custom_tables")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "custom_tables"
                ? "bg-primary text-surface-white shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
          >
            🏪 Barcode Meja Custom (Tammmu)
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 text-on-surface-variant hover:text-primary transition-colors text-label-bold font-label-bold cursor-pointer"
          >
            <span>Keluar Admin</span>
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-container-margin md:px-6 pt-6 md:pt-24 pb-stack-lg animate-fade-in">
        {/* Dashboard Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-stack-md bg-surface-white p-6 rounded-xl border border-outline-variant shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-primary text-surface-white rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">
                {activeTab === "standard" ? "bolt" : "qr_code_2"}
              </span>
            </div>
            <div>
              <h1 className="text-headline-md font-headline-md text-primary">
                {activeTab === "standard" ? "Management Kartu Ratey Direct" : "Generator Barcode Meja Custom"}
              </h1>
              <p className="text-body-sm font-body-sm text-text-muted mt-0.5">
                {activeTab === "standard"
                  ? "Kelola Kartu NFC & QR Direct Google Reviews"
                  : "Generate Batch Barcode Meja untuk Client Tammmu Coffee & Cafe"}
              </p>
            </div>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex md:hidden gap-2">
            <button
              onClick={() => setActiveTab("standard")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border ${activeTab === "standard" ? "bg-primary text-white border-primary" : "bg-white border-outline-variant text-text-muted"
                }`}
            >
              Direct Cards
            </button>
            <button
              onClick={() => setActiveTab("custom_tables")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border ${activeTab === "custom_tables" ? "bg-primary text-white border-primary" : "bg-white border-outline-variant text-text-muted"
                }`}
            >
              Barcode Meja
            </button>
          </div>
        </div>

        {/* TAB 1: STANDARD DIRECT CARDS */}
        {activeTab === "standard" && (
          <div>
            {/* Summary Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-md">
              <div className="bg-surface-white border border-outline-variant rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <p className="text-label-caps font-label-caps text-text-muted mb-2 uppercase">TOTAL KARTU DIRECT</p>
                <p className="text-headline-lg font-headline-lg text-primary">{stats.totalCount}</p>
              </div>

              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <p className="text-label-caps font-label-caps text-[#166534] mb-2 uppercase">KARTU AKTIF (TERHUBUNG)</p>
                <p className="text-headline-lg font-headline-lg text-[#166534]">{stats.activeCount}</p>
              </div>

              <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <p className="text-label-caps font-label-caps text-[#991B1B] mb-2 uppercase">KARTU BELUM AKTIF</p>
                <p className="text-headline-lg font-headline-lg text-[#991B1B]">{stats.inactiveCount}</p>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-col md:flex-row gap-gutter justify-between items-stretch md:items-center mb-stack-md">
              <button
                onClick={() => {
                  setNewGeneratedCards([]);
                  setShowGenerateModal(true);
                }}
                className="bg-cta-activation text-on-primary font-label-bold text-label-bold px-6 py-3 rounded-xl hover:brightness-110 transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>+ Generate Batch Kartu Baru</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-gutter">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Cari ID / Nama Bisnis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-white border border-outline-variant rounded-xl px-4 py-2.5 pl-10 text-body-sm font-body-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-text-muted text-lg">search</span>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-surface-white border border-outline-variant rounded-xl px-4 py-2.5 text-body-sm font-body-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif Saja</option>
                  <option value="inactive">Belum Aktif Saja</option>
                </select>
              </div>
            </div>

            {/* Cards Table */}
            <div className="bg-surface-white border border-outline-variant rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
              {isLoading ? (
                <div className="p-12 text-center text-text-muted">
                  <span className="material-symbols-outlined text-3xl animate-spin mb-2 block">sync</span>
                  <p className="text-body-sm font-body-sm">Memuat data kartu Ratey...</p>
                </div>
              ) : filteredCards.length === 0 ? (
                <div className="p-12 text-center text-text-muted">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2 block">style</span>
                  <p className="text-body-md font-body-md font-semibold">Tidak Ada Kartu Ditemukan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant text-label-caps font-label-caps text-text-muted">
                        <th className="py-3.5 px-4 md:px-6">ID KARTU / NFC LINK</th>
                        <th className="py-3.5 px-4 md:px-6">STATUS</th>
                        <th className="py-3.5 px-4 md:px-6">NAMA BISNIS TERHUBUNG</th>
                        <th className="py-3.5 px-4 md:px-6">TANGGAL</th>
                        <th className="py-3.5 px-4 md:px-6 text-right">AKSI ADMIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-body-sm font-body-sm">
                      {filteredCards.map((card) => {
                        const nfcUrl = `${typeof window !== "undefined" ? window.location.origin : "https://ratey.site"}/c/${card.card_id}`;
                        const isCopied = copiedCardId === card.card_id;

                        return (
                          <tr key={card.card_id} className="hover:bg-surface-container-lowest/50 transition-colors">
                            <td className="py-4 px-4 md:px-6">
                              <div className="font-bold font-mono text-primary text-body-md">{card.card_id}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="bg-surface-container-low border border-outline-variant px-2.5 py-1 rounded text-xs font-mono text-on-surface-variant truncate max-w-[200px]">
                                  {nfcUrl}
                                </div>
                                <button
                                  onClick={() => handleCopyText(nfcUrl, card.card_id)}
                                  className="bg-surface-white border border-outline-variant hover:bg-surface-container-low text-primary text-xs font-semibold px-2 py-1 rounded flex items-center space-x-1 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-xs">
                                    {isCopied ? "check" : "content_copy"}
                                  </span>
                                  <span>{isCopied ? "Tersalin" : "Salin NFC"}</span>
                                </button>
                              </div>
                            </td>

                            <td className="py-4 px-4 md:px-6">
                              {card.is_active ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mr-1.5 animate-pulse"></span>
                                  Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant">
                                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                                  Belum Aktif
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-4 md:px-6">
                              {card.business_name ? (
                                <div>
                                  <p className="font-semibold text-primary">{card.business_name}</p>
                                  {card.google_review_url && (
                                    <a
                                      href={card.google_review_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-secondary hover:underline text-xs inline-flex items-center mt-0.5 space-x-1"
                                    >
                                      <span>Buka Link Review</span>
                                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-text-muted italic">Menunggu Aktivasi Klien</span>
                              )}
                            </td>

                            <td className="py-4 px-4 md:px-6 text-xs text-text-muted">
                              <div>Dibuat: {new Date(card.created_at).toLocaleDateString("id-ID")}</div>
                              {card.activated_at && (
                                <div className="text-emerald-700 mt-0.5">
                                  Aktif: {new Date(card.activated_at).toLocaleDateString("id-ID")}
                                </div>
                              )}
                            </td>

                            <td className="py-4 px-4 md:px-6 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={async () => {
                                    const qrDataUrl = await QRCode.toDataURL(nfcUrl, { width: 600, margin: 2 });
                                    setQrPreviewModal({ cardId: card.card_id, url: nfcUrl, qrDataUrl });
                                  }}
                                  className="bg-surface-white border border-outline-variant hover:bg-surface-container-low text-primary text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-sm">qr_code_2</span>
                                  <span>Lihat QR</span>
                                </button>

                                {card.is_active && (
                                  <button
                                    onClick={() => setConfirmModal({ type: "reset", cardId: card.card_id })}
                                    disabled={actionLoadingId === card.card_id}
                                    className="bg-surface-white border border-outline-variant hover:bg-surface-container-low text-on-surface-variant text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-sm">restart_alt</span>
                                    <span>Reset</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => setConfirmModal({ type: "delete", cardId: card.card_id })}
                                  disabled={actionLoadingId === card.card_id}
                                  className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-sm">delete</span>
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
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM TABLETOP HUB BARCODE GENERATOR (Tammmu & Cafe) */}
        {activeTab === "custom_tables" && (() => {
          // ── Computed: Daftar unique client_slug untuk filter dropdown ──
          const clientSlugs = Array.from(new Set(tableQrs.map((t) => t.client_slug))).sort();
          const filterAll = tableQrClientFilter === "all";
          const filteredTableQrs = filterAll
            ? tableQrs
            : tableQrs.filter((t) => t.client_slug === tableQrClientFilter);

          return (
            <div className="space-y-stack-md">
              {/* Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
                <div className="bg-surface-white border border-outline-variant rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <p className="text-label-caps font-label-caps text-text-muted mb-2 uppercase">TOTAL CLIENT CAFE</p>
                  <p className="text-headline-lg font-headline-lg text-primary">{tableQrStats.totalClients}</p>
                  {clientSlugs.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {clientSlugs.slice(0, 10).map((c) => (
                        <span key={c} className="text-[10px] font-mono px-2.5 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">{c}</span>
                      ))}
                      {clientSlugs.length > 10 && (
                        <span className="text-[10px] text-text-muted px-2.5 py-1">+{clientSlugs.length - 10} lainnya</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <p className="text-label-caps font-label-caps text-[#1E40AF] mb-2 uppercase">TOTAL KODE MEJA TERSIMPAN</p>
                  <p className="text-headline-lg font-headline-lg text-[#1D4ED8]">{tableQrStats.totalTables}</p>
                  {tableQrClientFilter !== "all" && (
                    <p className="text-[11px] text-[#1E40AF]/80 mt-1 font-mono">
                      Ditampilkan {filteredTableQrs.length} meja · client: {tableQrClientFilter}
                    </p>
                  )}
                </div>
              </div>

              {/* Custom Table Config Card */}
              <div className="bg-surface-white border border-outline-variant rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <h2 className="text-headline-md font-headline-md font-bold text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">table_restaurant</span>
                  <span>Batch Generator Barcode Meja Custom</span>
                </h2>
                <p className="text-body-sm font-body-sm text-text-muted mb-6">
                  Buat puluhan QR Code Barcode Meja khusus untuk client cafe (seperti Tammmu Coffee). Data <span className="font-semibold text-primary">disimpan ke database</span>, refresh halaman pun hilang.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold uppercase text-text-muted mb-1.5">Client Slug / URL Path</label>
                    <input
                      type="text"
                      value={customClientSlug}
                      onChange={(e) => setCustomClientSlug(e.target.value.toLowerCase().trim())}
                      placeholder="misal: tammmu"
                      className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-2.5 text-body-sm font-body-sm font-mono focus:outline-none focus:border-primary"
                    />
                    <p className="text-[11px] text-text-muted mt-1">URL: ratey.site/{customClientSlug || "tammmu"}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-text-muted mb-1.5">Jumlah Meja</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={tableGenerateCount}
                      onChange={(e) => setTableGenerateCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-2.5 text-body-sm font-body-sm font-bold focus:outline-none focus:border-primary"
                    />
                    <p className="text-[11px] text-text-muted mt-1">Meja 01 s/d Meja {String(tableGenerateCount).padStart(2, "0")}</p>
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-xs font-bold uppercase text-text-muted mb-1.5 invisible">Generate</label>
                    <button
                      onClick={() => handleGenerateTableQRs(customClientSlug, tableGenerateCount)}
                      disabled={isGeneratingTables}
                      className="w-full bg-primary text-surface-white font-label-bold text-label-bold py-[11px] px-6 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-lg ${isGeneratingTables ? "animate-spin" : ""}`}>{isGeneratingTables ? "sync" : "qr_code_scanner"}</span>
                      <span>{isGeneratingTables ? "Saving to DB..." : `🚀 Generate & Simpan ${tableGenerateCount} Meja`}</span>
                    </button>
                    <p className="text-[11px] text-text-muted mt-1 invisible">placeholder</p>
                  </div>
                </div>
              </div>

              {/* Generated RECENTLY Table QRs Section (highlight hasil baru generate) */}
              {generatedTables.length > 0 && (
                <div className="bg-surface-white border-2 border-primary/30 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant">
                    <div>
                      <h3 className="font-bold text-headline-md text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-cta-activation">bolt</span>
                        Hasil Terbaru ({generatedTables.length} Meja)
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">Berikut kode meja yang baru saja dibuat / ditampilkan dari existing client.</p>
                    </div>

                    <button
                      onClick={() => downloadAllTableQrs(generatedTables, customClientSlug)}
                      className="bg-cta-activation text-on-primary font-bold text-xs px-5 py-2.5 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
                    >
                      <span className="material-symbols-outlined text-base">download_for_offline</span>
                      <span>Unduh Semua ({generatedTables.length} PNG)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {generatedTables.map((item) => {
                      const isCopiedTable = copiedTableNum === `new-${item.tableNum}`;
                      return (
                        <div
                          key={`new-${item.tableNum}-${item.url}`}
                          className="bg-surface-bright border border-outline-variant rounded-2xl p-3.5 flex flex-col items-center text-center hover:border-secondary transition-all shadow-xs"
                        >
                          <div className="w-full aspect-square bg-white border border-outline-variant rounded-xl p-2 mb-2 flex items-center justify-center">
                            <img src={item.qrDataUrl} alt={`QR Meja ${item.tableNum}`} className="w-full h-full object-contain" />
                          </div>

                          <span className="font-bold text-xs text-primary uppercase tracking-wider mb-0.5">Meja {item.tableNum}</span>
                          <p className="text-[10px] text-text-muted font-mono truncate w-full mb-2 select-all">{item.url}</p>

                          {/* Copy Link Button */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.url);
                              setCopiedTableNum(`new-${item.tableNum}`);
                              setTimeout(() => setCopiedTableNum(null), 2000);
                            }}
                            className={`w-full py-1.5 px-2 mb-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer border ${
                              isCopiedTable
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                : "bg-surface-white border-outline-variant hover:bg-surface-container text-on-surface-variant"
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {isCopiedTable ? "check" : "content_copy"}
                            </span>
                            <span>{isCopiedTable ? "Tersalin ✓" : "Salin Link"}</span>
                          </button>

                          {/* Download Button */}
                          <button
                            onClick={() => downloadSingleTableQr(item, customClientSlug)}
                            className="w-full py-1.5 px-2 bg-surface-white border border-outline-variant hover:bg-surface-container text-primary text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">download</span>
                            <span>Unduh PNG</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PERSISTENT TABLE QR LIST (dari Database) */}
              <div className="bg-surface-white border border-outline-variant rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant">
                  <div>
                    <h3 className="font-bold text-headline-md text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-secondary">database</span>
                      Daftar Meja Tersimpan (Persistent)
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Data dari database — <span className="text-primary font-semibold">tidak hilang meskipun refresh halaman</span>.
                      Total: <span className="font-mono">{filteredTableQrs.length}</span> meja.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Client Filter */}
                    <select
                      value={tableQrClientFilter}
                      onChange={(e) => setTableQrClientFilter(e.target.value)}
                      className="bg-surface-bright border border-outline-variant rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                      <option value="all">Semua Client ({tableQrs.length})</option>
                      {clientSlugs.map((s) => (
                        <option key={s} value={s}>
                          {s} ({tableQrs.filter((t) => t.client_slug === s).length})
                        </option>
                      ))}
                    </select>

                    {/* Download All Filtered */}
                    {filteredTableQrs.length > 0 && (
                      <button
                        onClick={async () => {
                          const list: GeneratedTableItem[] = [];
                          for (const row of filteredTableQrs) {
                            list.push(await tableQrDataToItem(row));
                          }
                          const slug = filterAll ? "all-clients" : tableQrClientFilter;
                          downloadAllTableQrs(list, slug);
                        }}
                        className="bg-cta-activation text-on-primary font-bold text-xs px-4 py-2 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
                      >
                        <span className="material-symbols-outlined text-sm">download_for_offline</span>
                        <span>Unduh ({filteredTableQrs.length})</span>
                      </button>
                    )}

                    {/* Delete Batch Client */}
                    {!filterAll && (
                      <button
                        onClick={() => setConfirmModal({ type: "delete_client_batch", clientSlug: tableQrClientFilter })}
                        disabled={tableActionLoadingId === `client:${tableQrClientFilter}`}
                        className="bg-red-50 text-red-700 font-bold text-xs px-4 py-2 rounded-xl hover:bg-red-100 transition-colors border border-red-200 flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">delete_sweep</span>
                        <span>Hapus Client</span>
                      </button>
                    )}
                  </div>
                </div>

                {filteredTableQrs.length === 0 ? (
                  <div className="p-12 text-center text-text-muted">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2 block">table_bar</span>
                    <p className="text-body-md font-body-md font-semibold">
                      {tableQrs.length === 0 ? "Belum ada meja yang di-generate" : `Client "${tableQrClientFilter}" tidak punya data`}
                    </p>
                    <p className="text-xs text-text-muted mt-1">Gunakan form di atas untuk generate pertama kali.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredTableQrs.map((row) => {
                      const isCopiedTable = copiedTableNum === `db-${row.id}`;
                      const isActionLoading = tableActionLoadingId === row.id;
                      return (
                        <div
                          key={row.id}
                          className="bg-surface-bright border border-outline-variant rounded-2xl p-3.5 flex flex-col items-center text-center hover:border-secondary transition-all shadow-xs"
                        >
                          {/* Client Slug Badge */}
                          <div className="w-full mb-2 flex items-center justify-between">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-primary/10 text-primary rounded border border-primary/20 truncate max-w-[70%]">
                              {row.client_slug}
                            </span>
                            <span className="text-[9px] text-text-muted font-mono">#{row.id}</span>
                          </div>

                          {/* QR Placeholder + Preview on Click */}
                          <button
                            onClick={async () => {
                              const item = await tableQrDataToItem(row);
                              if (item.qrDataUrl) {
                                setTableQrPreview({
                                  tableNum: row.table_num,
                                  clientSlug: row.client_slug,
                                  url: row.url,
                                  qrDataUrl: item.qrDataUrl,
                                });
                              }
                            }}
                            className="w-full aspect-square bg-white border border-outline-variant rounded-xl p-2 mb-2 flex items-center justify-center hover:border-secondary/70 transition-colors cursor-pointer group"
                            title="Klik untuk lihat QR penuh"
                          >
                            <div className="w-full h-full flex flex-col items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-2xl mb-1">qr_code_2</span>
                              <span className="text-[9px] font-semibold uppercase tracking-wide">Lihat QR</span>
                            </div>
                          </button>

                          <span className="font-bold text-xs text-primary uppercase tracking-wider mb-0.5">Meja {row.table_num}</span>
                          <p className="text-[10px] text-text-muted font-mono truncate w-full mb-2 select-all">{row.url}</p>

                          {/* Copy Link Button */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(row.url);
                              setCopiedTableNum(`db-${row.id}`);
                              setTimeout(() => setCopiedTableNum(null), 2000);
                            }}
                            className={`w-full py-1.5 px-2 mb-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer border ${
                              isCopiedTable
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                : "bg-surface-white border-outline-variant hover:bg-surface-container text-on-surface-variant"
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {isCopiedTable ? "check" : "content_copy"}
                            </span>
                            <span>{isCopiedTable ? "Tersalin ✓" : "Salin Link"}</span>
                          </button>

                          <div className="flex gap-1.5 w-full">
                            {/* Download Button */}
                            <button
                              onClick={async () => {
                                const item = await tableQrDataToItem(row);
                                if (item.qrDataUrl) downloadSingleTableQr(item, row.client_slug);
                              }}
                              className="flex-1 py-1.5 px-2 bg-surface-white border border-outline-variant hover:bg-surface-container text-primary text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xs">download</span>
                              <span>PNG</span>
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => setConfirmModal({ type: "delete_table", tableId: row.id, tableNum: row.table_num })}
                              disabled={isActionLoading}
                              className="py-1.5 px-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 disabled:opacity-50 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                              title="Hapus meja ini"
                            >
                              {isActionLoading ? (
                                <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                              ) : (
                                <span className="material-symbols-outlined text-xs">delete</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </main>

      {/* MODAL 1: BATCH GENERATE CARDS (STANDARD) */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-white rounded-2xl max-w-md w-full p-6 border border-outline-variant shadow-2xl animate-scale-up">
            <h3 className="text-headline-md font-headline-md font-bold text-primary mb-2 flex items-center space-x-2">
              <span className="material-symbols-outlined text-cta-activation">add_circle</span>
              <span>Generate Batch Kartu Ratey</span>
            </h3>

            {newGeneratedCards.length === 0 ? (
              <form onSubmit={handleGenerateCards} className="space-y-4">
                <p className="text-body-sm font-body-sm text-text-muted">
                  Sistem akan membuat ID acak 6 Karakter (misal: <code>3CDRHR</code>) yang siap dipakai klien.
                </p>

                <div>
                  <label className="block text-label-bold font-label-bold text-primary mb-1.5">Jumlah Kartu Ditambahkan</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={generateCount}
                    onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2.5 text-body-md font-bold text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2.5 border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container text-label-bold font-label-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-6 py-2.5 bg-cta-activation text-on-primary rounded-xl font-label-bold text-label-bold hover:brightness-110 transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <span>{isGenerating ? "Proses..." : "Generate Kartu"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-[#DCFCE7] text-[#15803D] rounded-xl text-xs font-bold flex items-center justify-between">
                  <span>✓ Berhasil Generate {newGeneratedCards.length} Kartu Baru</span>
                  <button
                    onClick={downloadAllQr}
                    className="bg-[#15803D] text-white px-3 py-1 rounded-lg text-xs hover:bg-[#166534] transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <span className="material-symbols-outlined text-xs">download</span>
                    <span>Download Semua QR</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {newGeneratedCards.map((item) => (
                    <div key={item.card_id} className="p-2.5 bg-surface border border-outline-variant rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold font-mono text-primary text-sm block">{item.card_id}</span>
                        <span className="text-text-muted font-mono text-[10px]">{item.url}</span>
                      </div>
                      <button
                        onClick={() => downloadSingleQr(item)}
                        className="p-1.5 bg-surface-white border border-outline-variant hover:bg-surface-container rounded-lg text-primary cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="w-full py-2.5 bg-primary text-surface-white font-label-bold rounded-xl text-label-bold hover:bg-black transition-all cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: QR CODE PREVIEW */}
      {qrPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-white rounded-2xl max-w-sm w-full p-6 border border-outline-variant shadow-2xl text-center animate-scale-up">
            <h3 className="font-bold text-headline-md text-primary mb-1">Barcode QR Kartu</h3>
            <p className="text-xs font-mono text-secondary mb-4">ID: {qrPreviewModal.cardId}</p>

            <div className="bg-white border border-outline-variant p-4 rounded-xl inline-block mb-4">
              <img src={qrPreviewModal.qrDataUrl} alt="QR Code" className="w-56 h-56 mx-auto" />
            </div>

            <p className="text-xs text-text-muted font-mono bg-surface-bright p-2 rounded-lg mb-4 truncate select-all">
              {qrPreviewModal.url}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => downloadSingleQr({ card_id: qrPreviewModal.cardId, url: qrPreviewModal.url, qrDataUrl: qrPreviewModal.qrDataUrl })}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Unduh PNG</span>
              </button>
              <button
                onClick={() => setQrPreviewModal(null)}
                className="py-2.5 px-4 bg-surface-container border border-outline-variant rounded-xl text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM RESET / DELETE (CARD + TABLE + CLIENT BATCH) */}
      {confirmModal && (() => {
        // ── Variant-specific render helpers ──
        const isCardReset = confirmModal.type === "reset";
        const isCardDelete = confirmModal.type === "delete";
        const isTableDelete = confirmModal.type === "delete_table";
        const isClientBatch = confirmModal.type === "delete_client_batch";

        const colorDanger = "bg-red-100 text-red-600";
        const colorWarn = "bg-amber-100 text-amber-700";

        let headerColor = colorWarn;
        let icon = "warning";
        let title = "Konfirmasi";
        let description = "";
        let confirmLabel = "Ya, Lanjut";
        let confirmBtnClass = "bg-amber-600 hover:bg-amber-700";
        let confirmAction: (() => void) | null = null;

        if (isCardReset && "cardId" in confirmModal) {
          headerColor = colorWarn;
          icon = "restart_alt";
          title = "Reset Kartu Ini?";
          description = `Status kartu ${confirmModal.cardId} akan dikembalikan ke 'Belum Aktif' dan data bisnis akan dikosongkan.`;
          confirmLabel = "Ya, Reset";
          confirmBtnClass = "bg-amber-600 hover:bg-amber-700";
          confirmAction = () => handleCardAction("reset", confirmModal.cardId);
        } else if (isCardDelete && "cardId" in confirmModal) {
          headerColor = colorDanger;
          icon = "delete_forever";
          title = "Hapus Kartu Ini?";
          description = `Kartu ${confirmModal.cardId} akan dihapus secara permanen dari database.`;
          confirmLabel = "Ya, Hapus";
          confirmBtnClass = "bg-red-600 hover:bg-red-700";
          confirmAction = () => handleCardAction("delete", confirmModal.cardId);
        } else if (isTableDelete && "tableId" in confirmModal) {
          headerColor = colorDanger;
          icon = "delete";
          title = "Hapus Meja Ini?";
          description = `Kode QR Meja ${confirmModal.tableNum} akan dihapus permanen dari database.`;
          confirmLabel = "Ya, Hapus Meja";
          confirmBtnClass = "bg-red-600 hover:bg-red-700";
          confirmAction = () => handleTableQrDelete(confirmModal.tableId);
        } else if (isClientBatch && "clientSlug" in confirmModal) {
          headerColor = colorDanger;
          icon = "delete_sweep";
          title = "Hapus Semua Data Client Ini?";
          const count = tableQrs.filter((t) => t.client_slug === confirmModal.clientSlug).length;
          description = `Semua ${count} meja untuk client "${confirmModal.clientSlug}" akan dihapus permanen.`;
          confirmLabel = "Ya, Hapus Semua";
          confirmBtnClass = "bg-red-600 hover:bg-red-700";
          confirmAction = () => handleClientBatchDelete(confirmModal.clientSlug);
        }

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-white rounded-2xl max-w-sm w-full p-6 border border-outline-variant shadow-2xl animate-scale-up text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${headerColor}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </div>
              <h3 className="font-bold text-headline-md text-primary mb-1">{title}</h3>
              <p className="text-body-sm font-body-sm text-text-muted mb-6">{description}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-2.5 border border-outline-variant rounded-xl text-on-surface-variant font-label-bold text-label-bold hover:bg-surface-container cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => confirmAction && confirmAction()}
                  className={`flex-1 py-2.5 text-white rounded-xl font-label-bold text-label-bold cursor-pointer ${confirmBtnClass}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 4: TABLE QR PREVIEW */}
      {tableQrPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-white rounded-2xl max-w-sm w-full p-6 border border-outline-variant shadow-2xl text-center animate-scale-up">
            <h3 className="font-bold text-headline-md text-primary mb-1">Barcode QR Meja</h3>
            <p className="text-xs font-mono text-secondary mb-4">
              Client: {tableQrPreview.clientSlug} · Meja {tableQrPreview.tableNum}
            </p>

            <div className="bg-white border border-outline-variant p-4 rounded-xl inline-block mb-4">
              <img src={tableQrPreview.qrDataUrl} alt="QR Code Table" className="w-56 h-56 mx-auto" />
            </div>

            <p className="text-xs text-text-muted font-mono bg-surface-bright p-2 rounded-lg mb-4 truncate select-all">
              {tableQrPreview.url}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  downloadSingleTableQr(
                    {
                      tableNum: tableQrPreview.tableNum,
                      url: tableQrPreview.url,
                      qrDataUrl: tableQrPreview.qrDataUrl,
                    },
                    tableQrPreview.clientSlug
                  )
                }
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Unduh PNG</span>
              </button>
              <button
                onClick={() => setTableQrPreview(null)}
                className="py-2.5 px-4 bg-surface-container border border-outline-variant rounded-xl text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
