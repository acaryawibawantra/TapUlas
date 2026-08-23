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
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid var(--border-color)",
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>⚙️</span>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>
          Portal Pemilik Bisnis
        </h3>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.4 }}>
        Ingin mengubah nama tempat atau mengganti PIN kartu Anda? Masukkan ID Kartu di bawah ini.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="text"
          value={cardId}
          onChange={(e) => setCardId(e.target.value.toUpperCase())}
          placeholder="ID Kartu (misal: ZUEV8D)"
          maxLength={6}
          style={{
            flex: "1 1 180px",
            padding: "10px 12px",
            fontSize: 14,
            borderRadius: 8,
            border: "1px solid var(--input-border)",
            outline: "none",
            fontFamily: "monospace",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        />

        <button
          type="submit"
          className="btn-secondary"
          style={{ flex: "0 0 auto", width: "auto", minHeight: 40, padding: "10px 16px" }}
        >
          Kelola Kartu →
        </button>
      </form>

      {errorMsg && (
        <p style={{ fontSize: 12, color: "var(--accent-red)", marginTop: 6 }}>
          ⚠️ {errorMsg}
        </p>
      )}
    </div>
  );
}
