"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditPortal() {
  const [cardId, setCardId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const cleanId = cardId.trim().toUpperCase();
    if (!cleanId) {
      setErrorMsg("Masukkan ID Kartu Anda.");
      return;
    }

    router.push(`/c/${cleanId}/edit`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center gap-2 mb-stack-sm">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            admin_panel_settings
          </span>
          <h2 className="text-headline-md font-headline-md text-primary">Portal Pemilik Bisnis</h2>
        </div>
        <p className="text-body-sm font-body-sm text-on-surface-variant mb-stack-md">
          Akses halaman kelola ulasan dan atur kartu NFC Anda dengan memasukkan ID Kartu di bawah ini.
        </p>

        <div className="flex flex-col gap-base">
          <label className="text-label-bold font-label-bold text-primary" htmlFor="card-id">
            ID Kartu
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
              <span className="material-symbols-outlined">credit_card</span>
            </span>
            <input
              id="card-id"
              type="text"
              autoComplete="off"
              value={cardId}
              onChange={(e) => setCardId(e.target.value.toUpperCase())}
              placeholder="Contoh: ABCD8F"
              maxLength={6}
              className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-outline-variant rounded-lg text-body-md font-body-md text-primary focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-shadow font-mono font-bold tracking-wider uppercase"
            />
          </div>
        </div>

        {errorMsg && (
          <p className="text-body-sm font-body-sm text-error mt-2">
            ⚠️ {errorMsg}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="mt-stack-md w-full bg-primary text-on-primary font-label-bold text-label-bold py-3 rounded-lg hover:bg-on-primary-fixed transition-colors flex items-center justify-center gap-2 min-h-[48px]"
      >
        <span>Kelola Kartu</span>
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </form>
  );
}
