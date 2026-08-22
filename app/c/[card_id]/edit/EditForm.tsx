"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type PlaceSuggestion = {
  place_id: string;
  description: string;
};

export default function EditForm({
  cardId,
  currentBusinessName,
}: {
  cardId: string;
  currentBusinessName: string;
}) {
  const [currentPinDigits, setCurrentPinDigits] = useState<string[]>(["", "", "", ""]);
  const [showCurrentPin, setShowCurrentPin] = useState(false);

  // Business edit search
  const [query, setQuery] = useState(currentBusinessName);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // New PIN edit (optional)
  const [changePinToggle, setChangePinToggle] = useState(false);
  const [newPinDigits, setNewPinDigits] = useState<string[]>(["", "", "", ""]);
  const [showNewPin, setShowNewPin] = useState(false);

  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const newPinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

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

  function handlePinChange(
    digits: string[],
    setDigits: (d: string[]) => void,
    refs: React.RefObject<HTMLInputElement>[],
    index: number,
    value: string
  ) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...digits];
    updated[index] = digit;
    setDigits(updated);

    if (digit && index < 3) {
      refs[index + 1].current?.focus();
    }
  }

  function handlePinKeyDown(
    digits: string[],
    refs: React.RefObject<HTMLInputElement>[],
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const currentPin = currentPinDigits.join("");
    if (currentPin.length !== 4) {
      setErrorMsg("Masukkan 4 digit PIN lama Anda untuk verifikasi.");
      return;
    }

    const payload: any = {
      cardId,
      pin: currentPin,
    };

    if (selectedPlace) {
      payload.newBusinessName = selectedPlace.description;
      payload.newPlaceId = selectedPlace.place_id;
    }

    if (changePinToggle) {
      const newPin = newPinDigits.join("");
      if (newPin.length !== 4) {
        setErrorMsg("PIN baru harus terdiri dari 4 digit angka.");
        return;
      }
      payload.newPin = newPin;
    }

    if (!selectedPlace && !changePinToggle) {
      setErrorMsg("Tidak ada perubahan yang dilakukan.");
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Gagal memperbarui data kartu.");
        return;
      }

      setStatus("done");
      setSuccessMsg("Perubahan kartu berhasil disimpan!");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Terjadi kesalahan koneksi. Silakan coba lagi.");
    }
  }

  return (
    <main className="glass-card animate-fade-in">
      <div style={{ marginBottom: 18 }}>
        <Link href={`/c/${cardId}`} style={{ color: "var(--primary)", textDecoration: "none", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          ← Kembali ke Kartu
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-main)" }}>Edit Data Kartu</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          ID: <strong style={{ fontFamily: "monospace" }}>{cardId}</strong> • Bisnis saat ini: <strong>{currentBusinessName}</strong>
        </p>
      </div>

      {status === "done" && (
        <div
          style={{
            backgroundColor: "var(--accent-green-bg)",
            border: "1px solid var(--accent-green-border)",
            borderRadius: 10,
            padding: 14,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>✅</span>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#065F46" }}>{successMsg}</h3>
          <p style={{ fontSize: 12, color: "#047857", marginTop: 2, marginBottom: 12 }}>
            Data kartu berhasil diperbarui.
          </p>
          <a href={`/c/${cardId}`} className="btn-primary" style={{ textDecoration: "none" }}>
            Uji Redirect Kartu
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Verification PIN */}
        <div style={{ marginBottom: 20, backgroundColor: "#F9FAFB", border: "1px solid var(--border-color)", padding: 14, borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
              PIN Lama (Wajib)
            </label>
            <button
              type="button"
              onClick={() => setShowCurrentPin(!showCurrentPin)}
              style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              {showCurrentPin ? "Sembunyikan" : "Lihat"}
            </button>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
            Masukkan PIN yang dibuat saat aktivasi.
          </p>

          <div className="pin-container" style={{ margin: "6px 0" }}>
            {currentPinDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={currentPinRefs[idx]}
                type={showCurrentPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(currentPinDigits, setCurrentPinDigits, currentPinRefs, idx, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(currentPinDigits, currentPinRefs, idx, e)}
                className={`pin-box ${digit ? "filled" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Change Business Location */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
            Ubah Lokasi Bisnis (Opsional)
          </label>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
            Cari nama bisnis baru dari Google Maps jika ingin mengganti target ulasan.
          </p>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Cari tempat baru..."
              style={{
                width: "100%",
                padding: "12px 36px 12px 12px",
                fontSize: 14,
                borderRadius: 8,
                border: selectedPlace ? "1.5px solid var(--accent-green)" : "1px solid var(--input-border)",
                outline: "none",
                backgroundColor: "var(--input-bg)",
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

          {selectedPlace && (
            <div
              style={{
                marginTop: 8,
                backgroundColor: "var(--accent-green-bg)",
                border: "1px solid var(--accent-green-border)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                color: "#065F46",
                fontWeight: 600,
              }}
            >
              ✓ Terpilih: {selectedPlace.description}
            </div>
          )}

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
                >
                  📍 {s.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Change PIN Option */}
        <div style={{ marginBottom: 20, borderTop: "1px solid var(--border-color)", paddingTop: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
            <input
              type="checkbox"
              checked={changePinToggle}
              onChange={(e) => setChangePinToggle(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--primary)" }}
            />
            Ganti PIN Rahasia
          </label>

          {changePinToggle && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>PIN Baru (4 Digit)</span>
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  {showNewPin ? "Sembunyikan" : "Lihat"}
                </button>
              </div>

              <div className="pin-container" style={{ margin: "6px 0" }}>
                {newPinDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={newPinRefs[idx]}
                    type={showNewPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(newPinDigits, setNewPinDigits, newPinRefs, idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(newPinDigits, newPinRefs, idx, e)}
                    className={`pin-box ${digit ? "filled" : ""}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

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

        <button type="submit" disabled={status === "saving"} className="btn-primary">
          {status === "saving" ? (
            <>
              <div className="spinner" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <span>Simpan Perubahan</span>
          )}
        </button>
      </form>
    </main>
  );
}
