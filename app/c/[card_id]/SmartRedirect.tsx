"use client";

import { useEffect } from "react";

export default function SmartRedirect({
  googleReviewUrl,
  placeId,
  businessName,
}: {
  googleReviewUrl: string;
  placeId: string | null;
  businessName: string | null;
}) {
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
    const isAndroid = /android/i.test(ua);

    if (isAndroid && placeId) {
      // Di Android: Gunakan Intent khusus untuk membuka APLIKASI NATIVE Google Maps secara langsung
      const androidIntentUrl = `intent://search.google.com/local/writereview?placeid=${encodeURIComponent(
        placeId
      )}#Intent;scheme=https;package=com.google.android.apps.maps;end`;

      // Coba buka aplikasi native Android Google Maps
      window.location.replace(androidIntentUrl);

      // Fallback cadangan jika Intent tidak tertangkap dalam 600ms
      const timer = setTimeout(() => {
        window.location.replace(googleReviewUrl);
      }, 600);

      return () => clearTimeout(timer);
    } else {
      // Di iOS / Desktop: Gunakan web review URL resmi Google
      window.location.replace(googleReviewUrl);
    }
  }, [googleReviewUrl, placeId]);

  return (
    <main className="glass-card animate-fade-in" style={{ textAlign: "center", padding: "40px 20px" }}>
      <div
        className="spinner"
        style={{
          borderColor: "rgba(0,0,0,0.12)",
          borderTopColor: "var(--primary)",
          margin: "0 auto 16px auto",
          width: 32,
          height: 32,
        }}
      />

      <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
        Mengarahkan ke Google Maps...
      </h2>

      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
        {businessName ? `Membuka ulasan untuk ${businessName}` : "Menyiapkan halaman ulasan"}
      </p>

      <a href={googleReviewUrl} className="btn-primary" style={{ textDecoration: "none" }}>
        Klik di sini jika tidak terbuka otomatis ↗
      </a>
    </main>
  );
}
