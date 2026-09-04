"use client";

import { useEffect } from "react";

interface SmartRedirectProps {
  googleReviewUrl: string;
  placeId?: string | null;
  businessName?: string | null;
}

export default function SmartRedirect({
  googleReviewUrl,
  placeId,
  businessName,
}: SmartRedirectProps) {
  useEffect(() => {
    const target = googleReviewUrl;
    if (!target) return;

    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let mapsAppTimer: ReturnType<typeof setTimeout> | null = null;

    const ua = navigator.userAgent || "";
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);

    const cancelFallback = () => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      if (mapsAppTimer) {
        clearTimeout(mapsAppTimer);
        mapsAppTimer = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        cancelFallback();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", cancelFallback);

    // Usaha 1: Client-side navigate ke review URL (kasih OS kesempatan intercept App Links)
    try {
      window.location.assign(target);
    } catch {
      window.location.href = target;
    }

    // Usaha 2 (opsional, setelah jeda singkat): Jika punya placeId, coba trigger Google Maps Place Details
    // (URL yang lebih pasti di-intercept Maps app). User tinggal tap "Tulis Review" 1x di dalam app.
    if (placeId) {
      const q = encodeURIComponent(businessName?.trim() || "Google");
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${encodeURIComponent(
        placeId
      )}`;

      mapsAppTimer = setTimeout(() => {
        if (document.visibilityState !== "visible") return;
        try {
          window.location.replace(mapsLink);
        } catch {
          window.location.href = mapsLink;
        }
      }, isIOS ? 700 : 450);
    }

    // Fallback akhir: ~900ms kemudian, paksa buka review URL di browser.
    fallbackTimer = setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      try {
        window.location.replace(target);
      } catch {
        window.location.href = target;
      }
    }, 950);

    return () => {
      cancelFallback();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", cancelFallback);
    };
  }, [googleReviewUrl, placeId, businessName]);

  return (
    <div className="min-h-screen w-full bg-background" aria-hidden="true" />
  );
}
