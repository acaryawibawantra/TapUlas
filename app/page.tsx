import Link from "next/link";

export default function Home() {
  return (
    <main className="glass-card animate-fade-in" style={{ maxWidth: 440 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.4px" }}>
          TapUlas
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          Kartu NFC & QR Review Google Maps Otomatis
        </p>
      </div>

      {/* Feature Highlight Cards */}
      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            backgroundColor: "#F9FAFB",
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            padding: 12,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>📲</span>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>Tap NFC & Scan QR</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Satu kartu mengarahkan pelanggan langsung ke halaman ulasan Google Maps.
            </p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#F9FAFB",
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            padding: 12,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>Aktivasi Mandiri & PIN</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Pemilik bisnis mengaktifkan kartu dan membuat PIN rahasia dalam 10 detik.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Info */}
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16, marginBottom: 18 }}>
        <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          Alur Sistem:
        </h4>
        <ol style={{ fontSize: 12, color: "var(--text-main)", paddingLeft: 16, lineHeight: 1.7 }}>
          <li>Kartu NFC / QR dicetak dengan URL <code>/c/[card_id]</code>.</li>
          <li>Pertama kali di-tap: Membuka Form Aktivasi + PIN.</li>
          <li>Setelah Aktif: Otomatis redirect ke Google Review bisnis.</li>
        </ol>
      </div>

      {/* Info Notice */}
      <div
        style={{
          backgroundColor: "var(--primary-light)",
          border: "1px solid var(--primary-border)",
          borderRadius: 8,
          padding: 12,
          fontSize: 12,
          color: "var(--primary)",
          lineHeight: 1.5,
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        Untuk mencoba kartu testing, jalankan <code>npm run gen:card</code> lalu buka link kartu yang dihasilkan.
      </div>
    </main>
  );
}
