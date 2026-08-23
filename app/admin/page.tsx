"use client";

import { useState, useEffect } from "react";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const [secretKey, setSecretKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Restore saved session from localStorage if available
  useEffect(() => {
    const savedKey = localStorage.getItem("tapulas_admin_secret");
    if (savedKey) {
      setSecretKey(savedKey);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!inputKey.trim()) {
      setErrorMsg("Masukkan Password Master Admin.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: inputKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Password Master Admin salah.");
        return;
      }

      localStorage.setItem("tapulas_admin_secret", inputKey);
      setSecretKey(inputKey);
    } catch (err) {
      setErrorMsg("Terjadi kesalahan koneksi server.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("tapulas_admin_secret");
    setSecretKey("");
    setInputKey("");
  }

  // Logged In View
  if (secretKey) {
    return <AdminDashboard secretKey={secretKey} onLogout={handleLogout} />;
  }

  // Login View
  return (
    <main className="glass-card animate-fade-in" style={{ maxWidth: 400 }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "var(--primary)",
            color: "#FFF",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            marginBottom: 10,
          }}
        >
          🔒
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-main)" }}>
          TapUlas Admin Portal
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          Masukkan Password Master Admin untuk mengakses dashboard.
        </p>
      </div>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
            Master Password Admin:
          </label>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="••••••••••••"
            style={{
              width: "100%",
              padding: "12px",
              fontSize: 15,
              borderRadius: 8,
              border: "1px solid var(--input-border)",
              outline: "none",
            }}
          />
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

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? (
            <>
              <div className="spinner" />
              <span>Memverifikasi...</span>
            </>
          ) : (
            <span>Masuk ke Dashboard</span>
          )}
        </button>
      </form>
    </main>
  );
}
