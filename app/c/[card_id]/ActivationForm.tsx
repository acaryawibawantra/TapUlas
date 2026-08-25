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
  const [gmapsLink, setGmapsLink] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // 4-box PIN state
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [showPin, setShowPin] = useState(false);

  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinRefs = [
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

  function handleSelectPlace(place: PlaceSuggestion) {
    setSelectedPlace(place);
    setQuery(place.description);
    setSuggestions([]);
    const generatedUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(place.place_id)}`;
    setGmapsLink(generatedUrl);
  }

  function handlePinChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...pinDigits];
    updated[index] = digit;
    setPinDigits(updated);

    if (digit && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  }

  function handlePinKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  }

  function handlePinPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted) {
      const updated = ["", "", "", ""];
      for (let i = 0; i < pasted.length; i++) {
        updated[i] = pasted[i];
      }
      setPinDigits(updated);
      const nextFocus = Math.min(pasted.length, 3);
      pinRefs[nextFocus].current?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const businessName = selectedPlace ? selectedPlace.description : query.trim();

    if (!businessName) {
      setErrorMsg("Masukkan nama bisnis Anda.");
      return;
    }

    const finalLink = gmapsLink.trim();
    if (!finalLink && !selectedPlace) {
      setErrorMsg("Pilih nama bisnis dari saran Google atau masukkan Link Google Maps Review.");
      return;
    }

    const pin = pinDigits.join("");
    if (!/^\d{4}$/.test(pin)) {
      setErrorMsg("PIN harus terdiri dari 4 digit angka.");
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          placeId: selectedPlace ? selectedPlace.place_id : null,
          businessName,
          gmapsLink: finalLink,
          pin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Gagal mengaktifkan kartu.");
        return;
      }

      setReviewUrl(data.googleReviewUrl || finalLink);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Terjadi kesalahan koneksi. Silakan coba lagi.");
    }
  }

  // --- SUCCESS STATE ---
  if (status === "done") {
    return (
      <main className="w-full max-w-[480px] bg-surface-container-lowest md:rounded-xl md:shadow-ambient-soft md:border md:border-outline-variant mt-16 md:mt-0 pt-stack-md pb-stack-lg px-container-margin md:p-8 flex flex-col gap-stack-lg mx-auto animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-accent-green-bg border border-accent-green-border text-accent-green flex items-center justify-center mx-auto mb-2">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        <div>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
            Kartu Berhasil Diaktifkan! 🎉
          </h1>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Kartu <strong className="font-mono">{cardId}</strong> kini terhubung dengan ulasan Google Maps untuk <strong>{query}</strong>.
          </p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 text-left">
          <span className="text-label-caps font-label-caps text-text-muted block mb-1">
            Target Link Google Review:
          </span>
          <span className="text-body-sm font-body-sm text-secondary font-semibold break-all">
            {reviewUrl}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-cta-activation hover:brightness-110 text-on-primary text-label-bold font-label-bold py-4 px-6 rounded-lg shadow-ambient-soft transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>Uji Coba Halaman Review</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>

          <Link
            href={`/c/${cardId}/edit`}
            className="w-full bg-surface-bright border border-outline-variant text-primary font-label-bold text-label-bold py-3 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center min-h-[44px]"
          >
            Pengaturan & Edit Kartu
          </Link>
        </div>
      </main>
    );
  }

  // --- FORM ACTIVATION STATE ---
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:items-center md:justify-center p-0 md:p-container-margin">
      {/* Top App Bar (Mobile Only) */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface-white border-b border-outline-variant md:hidden">
        <Link href="/" className="text-on-surface-variant flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <img src="/ratey-logo.png" alt="Ratey Logo" className="w-9 h-9 object-cover rounded-xl" />
          <div className="text-headline-md font-headline-md font-bold text-primary">Ratey</div>
        </div>
        <div className="w-10" />
      </header>

      {/* Main Content Canvas */}
      <main className="w-full max-w-[480px] bg-surface-container-lowest md:rounded-xl md:shadow-ambient-soft md:border md:border-outline-variant mt-16 md:mt-0 pt-stack-md pb-stack-lg px-container-margin md:p-8 flex flex-col gap-stack-lg mx-auto">
        {/* Header Section */}
        <section className="flex flex-col gap-base">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-label-caps font-label-caps text-secondary bg-secondary/10 px-2.5 py-1 rounded-md font-semibold">
              Aktivasi Kartu
            </span>
            <span className="text-label-caps font-label-caps font-mono font-bold text-primary bg-surface-container px-2.5 py-1 rounded-md">
              ID: {cardId}
            </span>
          </div>

          <h1 className="text-headline-lg-mobile font-headline-lg-mobile md:text-headline-lg text-on-surface">
            Lengkapi Profil Bisnis
          </h1>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Lengkapi detail bisnis Anda untuk mengaktifkan kartu dan mulai menerima ulasan secara otomatis.
          </p>
        </section>

        {/* Form Section */}
        <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-stack-md">
          {/* Business Name Input */}
          <div className="flex flex-col gap-base">
            <label className="text-label-bold font-label-bold text-on-surface" htmlFor="nama_bisnis">
              Nama Bisnis
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                <span className="material-symbols-outlined">storefront</span>
              </span>
              <input
                id="nama_bisnis"
                name="nama_bisnis"
                type="text"
                autoComplete="off"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Contoh: Kopi Senja Jakarta"
                className="w-full pl-10 pr-10 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 color-text-subtle">
                {isSearching ? (
                  <div className="spinner" />
                ) : selectedPlace ? (
                  <span className="material-symbols-outlined text-cta-activation">check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-outline">search</span>
                )}
              </div>
            </div>

            {/* Selected Place Pill */}
            {selectedPlace && (
              <div className="mt-1 bg-accent-green-bg border border-accent-green-border rounded-lg p-2.5 flex items-center justify-between">
                <div className="text-body-sm font-body-sm text-on-tertiary-fixed-variant font-semibold truncate pr-2">
                  📍 {selectedPlace.description}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlace(null);
                    setQuery("");
                    setSuggestions([]);
                    setGmapsLink("");
                  }}
                  className="text-body-sm font-body-sm text-secondary underline font-semibold"
                >
                  Ubah
                </button>
              </div>
            )}

            {/* Autocomplete Dropdown List */}
            {suggestions.length > 0 && !selectedPlace && (
              <ul className="mt-1 bg-surface-white border border-outline-variant rounded-lg shadow-ambient-soft max-h-48 overflow-y-auto z-10 divide-y divide-outline-variant/30">
                {suggestions.map((s) => (
                  <li
                    key={s.place_id}
                    onClick={() => handleSelectPlace(s)}
                    className="p-3 text-body-sm font-body-sm text-on-surface hover:bg-surface-container cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-secondary text-lg">pin_drop</span>
                    <span>{s.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Google Maps Link Input */}
          <div className="flex flex-col gap-base">
            <label className="text-label-bold font-label-bold text-on-surface" htmlFor="gmaps_link">
              Link Google Maps Review
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                <span className="material-symbols-outlined">pin_drop</span>
              </span>
              <input
                id="gmaps_link"
                name="gmaps_link"
                type="text"
                autoComplete="off"
                value={gmapsLink}
                onChange={(e) => setGmapsLink(e.target.value)}
                placeholder="https://search.google.com/local/writereview?placeid=..."
                className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              />
            </div>
            <p className="text-[12px] text-text-muted mt-1">
              Pastikan ini adalah link langsung ke halaman ulasan bisnis Anda.
            </p>
          </div>

          {/* 4-Box PIN Input Section */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col gap-stack-sm mt-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-secondary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock
                </span>
                <div>
                  <span className="text-label-bold font-label-bold text-on-surface block">Keamanan Perangkat</span>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                    Buat PIN Rahasia 4-Angka untuk kelola kartu.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-xs text-secondary font-semibold hover:underline shrink-0"
              >
                {showPin ? "Sembunyikan" : "Lihat PIN"}
              </button>
            </div>

            {/* 4 Separate Input Columns for PIN */}
            <div className="pin-container my-3">
              {pinDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={pinRefs[idx]}
                  type={showPin ? "text" : "password"}
                  autoComplete="new-password"
                  inputMode="numeric"
                  pattern="[0-9]*"
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
            <div className="bg-accent-red-bg border border-accent-red-border text-accent-red p-3 rounded-lg text-body-sm font-body-sm">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Submit Action */}
          <div className="flex flex-col items-center gap-4 mt-4">
            <button
              type="submit"
              disabled={status === "saving"}
              className="w-full bg-cta-activation hover:bg-on-tertiary-container text-on-primary text-label-bold font-label-bold py-4 px-6 rounded-lg shadow-ambient-soft transition-colors flex items-center justify-center gap-2 h-12 cursor-pointer"
            >
              {status === "saving" ? (
                <>
                  <div className="spinner" />
                  <span>Mengaktifkan Kartu...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span>Aktifkan Kartu Sekarang</span>
                </>
              )}
            </button>
            <p className="text-body-sm font-body-sm text-text-muted flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">timer</span>
              <span>Proses aktivasi hanya memakan waktu 10 detik.</span>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
