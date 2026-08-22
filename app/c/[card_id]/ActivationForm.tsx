"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type PlaceSuggestion = {
  place_id: string;
  description: string;
};

export default function ActivationForm({ cardId }: { cardId: string }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // PIN state (4 digits)
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const pinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelectedPlace(null);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?query=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  }

  function handlePinChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...pinDigits];
    updated[index] = digit;
    setPinDigits(updated);

    if (digit && index < 3) {
      pinInputRefs[index + 1].current?.focus();
    }
  }

  function handlePinKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  }

  function handlePinPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length > 0) {
      const updated = ["", "", "", ""];
      for (let i = 0; i < pasted.length; i++) {
        updated[i] = pasted[i];
      }
      setPinDigits(updated);
      const nextIndex = Math.min(pasted.length, 3);
      pinInputRefs[nextIndex].current?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const pin = pinDigits.join("");

    if (!selectedPlace) {
      setErrorMsg("Pilih nama bisnis dari daftar saran terlebih dahulu.");
      return;
    }
    if (pin.length !== 4) {
      setErrorMsg("Buat 4 digit angka PIN untuk keamanan kartu.");
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          placeId: selectedPlace.place_id,
          businessName: selectedPlace.description,
          pin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Gagal mengaktifkan kartu.");
        return;
      }

      setReviewUrl(data.googleReviewUrl);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Terjadi kesalahan koneksi. Silakan coba lagi.");
    }
  }

  // --- SUCCESS STATE ---
  if (status === "done") {
    return (
      <main className="glass-card animate-fade-in">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              backgroundColor: "var(--accent-green-bg)",
              border: "1px solid var(--accent-green-border)",
              color: "var(--accent-green)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
            Kartu Berhasil Diaktifkan
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Kartu <strong>{cardId}</strong> sudah terhubung ke <strong>{selectedPlace?.description}</strong>.
          </p>
        </div>

        {/* Link review box */}
        <div
          style={{
            backgroundColor: "#F9FAFB",
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            padding: 14,
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>
            Link Ulasan Google Maps:
          </div>
          <div style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600, wordBreak: "break-all" }}>
            {reviewUrl}
          </div>
        </div>

        <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: "none", marginBottom: 12 }}>
          <span>Buka Halaman Review</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
            Ingin mengubah nama bisnis atau PIN nanti?
          </p>
          <Link href={`/c/${cardId}/edit`} className="btn-secondary">
            Pengaturan Kartu
          </Link>
        </div>
      </main>
    );
  }

  // --- FORM ACTIVATION STATE ---
  return (
    <main className="glass-card animate-fade-in">
      {/* Brand Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.3px" }}>TapUlas</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Aktivasi Kartu NFC & QR</p>
        </div>

        <span
          style={{
            backgroundColor: "var(--accent-amber-bg)",
            border: "1px solid var(--accent-amber-border)",
            color: "var(--accent-amber)",
            fontSize: 12,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 6,
          }}
        >
          Belum Aktif
        </span>
      </div>

      {/* Card Info Pill */}
      <div
        style={{
          backgroundColor: "#F3F4F6",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          padding: "10px 12px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>ID Kartu:</span>
        <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>
          {cardId}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Business Search */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
            1. Nama Bisnis (Google Maps)
          </label>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
            Ketik nama tempat Anda di Google Maps.
          </p>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Contoh: Kopi Kenangan Sudirman..."
              style={{
                width: "100%",
                padding: "12px 36px 12px 12px",
                fontSize: 14,
                borderRadius: 8,
                border: selectedPlace ? "1.5px solid var(--accent-green)" : "1px solid var(--input-border)",
                outline: "none",
                backgroundColor: "var(--input-bg)",
                transition: "border-color 0.15s ease",
              }}
            />

            <div style={{ position: "absolute", right: 12, top: 13, color: "var(--text-subtle)" }}>
              {isSearching ? (
                <div className="spinner" style={{ borderColor: "rgba(0,0,0,0.15)", borderTopColor: "var(--primary)" }} />
              ) : selectedPlace ? (
                <span style={{ color: "var(--accent-green)", fontSize: 16 }}>✓</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              )}
            </div>
          </div>

          {/* Selected Place Badge */}
          {selectedPlace && (
            <div
              style={{
                marginTop: 8,
                backgroundColor: "var(--accent-green-bg)",
                border: "1px solid var(--accent-green-border)",
                borderRadius: 8,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#065F46", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                ✓ {selectedPlace.description}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlace(null);
                  setQuery("");
                  setSuggestions([]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#047857",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Ubah
              </button>
            </div>
          )}

          {/* Autocomplete Dropdown List */}
          {suggestions.length > 0 && !selectedPlace && (
            <ul
              style={{
                listStyle: "none",
                margin: "6px 0 0",
                padding: 0,
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {suggestions.map((s) => (
                <li
                  key={s.place_id}
                  onClick={() => {
                    setSelectedPlace(s);
                    setQuery(s.description);
                    setSuggestions([]);
                  }}
                  style={{
                    padding: "10px 12px",
                    fontSize: 13,
                    cursor: "pointer",
                    borderBottom: "1px solid #F3F4F6",
                    color: "var(--text-main)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  📍 {s.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Step 2: Create 4-Digit PIN */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
              2. Buat PIN Rahasia (4 Digit)
            </label>
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {showPin ? "Sembunyikan" : "Lihat"}
            </button>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
            PIN digunakan untuk mengedit data bisnis jika diperlukan di kemudian hari.
          </p>

          {/* Visual 4-Digit Boxes */}
          <div className="pin-container">
            {pinDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={pinInputRefs[idx]}
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(idx, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(idx, e)}
                onPaste={handlePinPaste}
                className={`pin-box ${digit ? "filled" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: "var(--accent-red-bg)",
              border: "1px solid var(--accent-red-border)",
              color: "var(--accent-red)",
              fontSize: 13,
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 16,
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" disabled={status === "saving"} className="btn-primary">
          {status === "saving" ? (
            <>
              <div className="spinner" />
              <span>Mengaktifkan...</span>
            </>
          ) : (
            <span>Aktifkan Kartu</span>
          )}
        </button>
      </form>
    </main>
  );
}
