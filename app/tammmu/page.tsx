"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/* ─── Types ─── */
interface Product {
  id: string;
  name: string;
  category: "beverages" | "food" | "sourdough";
  categoryLabel: string;
  price: string;
  priceNum: string;
  description: string;
  image?: string;
  badge?: string;
  searchKey: string;
}

/* ─── Full Menu Data (matches PDF) ─── */
const PRODUCTS: Product[] = [
  // ═══ BEVERAGES — Featured (with photo) ═══
  {
    id: "b1", name: "Es Kopi Susu Tammmu", category: "beverages", categoryLabel: "Coffee",
    price: "28K", priceNum: "Rp 28.000", description: "Creamy Coffee with Tammmu Signature Milk",
    image: "/tammmu/beverages/Es-Kopi-Susu-Tammmu.png", badge: "Bestseller",
    searchKey: "es kopi susu tammmu creamy signature milk bestseller coffee",
  },
  {
    id: "b2", name: "Mont Blanc", category: "beverages", categoryLabel: "Signature",
    price: "39K", priceNum: "Rp 39.000", description: "Iced coffee topped with delicate velvety citrus cream.",
    image: "/tammmu/beverages/Mont-Blanc.png",
    searchKey: "mont blanc signature iced coffee citrus cream",
  },
  {
    id: "b3", name: "Dirty Latte", category: "beverages", categoryLabel: "Espresso",
    price: "38K", priceNum: "Rp 38.000", description: "Chilled condensed milk with hot double ristretto pull.",
    image: "/tammmu/beverages/Dirty-Latte.png",
    searchKey: "dirty latte chilled rich milk double espresso",
  },
  {
    id: "b4", name: "Cigarettes Fridge", category: "beverages", categoryLabel: "Signature",
    price: "35K", priceNum: "Rp 35.000", description: "Cola, Vanilla, Coffee, Cream on Top",
    image: "/tammmu/beverages/Cigarettes-Fridge.png",
    searchKey: "cigarettes fridge cola vanilla coffee cream cold drink",
  },
  {
    id: "b5", name: "Tiger Bomb", category: "beverages", categoryLabel: "Signature",
    price: "40K", priceNum: "Rp 40.000", description: "Bold espresso bomb with tiger stripe layering.",
    image: "/tammmu/beverages/Tiger-Bomb.png",
    searchKey: "tiger bomb espresso bold layered signature",
  },
  {
    id: "b6", name: "Alpenlible", category: "beverages", categoryLabel: "Mocktail",
    price: "35K", priceNum: "Rp 35.000", description: "Cranberry, Strawberry, Vanilla, Cream on Top",
    image: "/tammmu/beverages/Alpenlible.png",
    searchKey: "alpenlible cranberry strawberry vanilla cream cold drink",
  },
  {
    id: "b7", name: "Strawberry Matcha", category: "beverages", categoryLabel: "Matcha",
    price: "40K", priceNum: "Rp 40.000", description: "Layered artisan strawberry purée and Uji ceremonial grade matcha.",
    image: "/tammmu/beverages/Strawberry-Matcha.png",
    searchKey: "strawberry matcha artisan layered premium ceremonial",
  },
  // ═══ BEVERAGES — Text-Only (no photo) ═══
  {
    id: "b8", name: "Americano (Hot/Ice)", category: "beverages", categoryLabel: "Espresso",
    price: "30K", priceNum: "Rp 30.000", description: "Classic espresso with water.",
    searchKey: "americano hot ice espresso classic",
  },
  {
    id: "b9", name: "Cappuccino (Hot/Ice)", category: "beverages", categoryLabel: "Espresso",
    price: "33K", priceNum: "Rp 33.000", description: "Espresso, steamed milk, silky foam.",
    searchKey: "cappuccino hot ice espresso milk foam",
  },
  {
    id: "b10", name: "Iced Latte", category: "beverages", categoryLabel: "Espresso",
    price: "33K", priceNum: "Rp 33.000", description: "Espresso with cold fresh milk.",
    searchKey: "iced latte espresso cold milk",
  },
  {
    id: "b11", name: "Split Shot", category: "beverages", categoryLabel: "Espresso",
    price: "36K", priceNum: "Rp 36.000", description: "Double shot espresso split.",
    searchKey: "split shot double espresso",
  },
  {
    id: "b12", name: "Magic", category: "beverages", categoryLabel: "Espresso",
    price: "36K", priceNum: "Rp 36.000", description: "Double ristretto with steamed milk.",
    searchKey: "magic double ristretto milk",
  },
  {
    id: "b13", name: "Es Kopi Susu Garen", category: "beverages", categoryLabel: "Coffee",
    price: "29K", priceNum: "Rp 29.000", description: "Signature iced coffee with palm sugar milk.",
    searchKey: "es kopi susu garen palm sugar milk iced coffee",
  },
  {
    id: "b14", name: "Es Kopi Susu Salted Caramel", category: "beverages", categoryLabel: "Coffee",
    price: "30K", priceNum: "Rp 30.000", description: "Iced coffee with salted caramel syrup.",
    searchKey: "es kopi susu salted caramel iced coffee",
  },
  {
    id: "b15", name: "Piccolo", category: "beverages", categoryLabel: "Espresso",
    price: "32K", priceNum: "Rp 32.000", description: "Ristretto shot with steamed milk.",
    searchKey: "piccolo ristretto milk",
  },
  {
    id: "b16", name: "Matcha Latte (Hot/Ice)", category: "beverages", categoryLabel: "Matcha",
    price: "33K", priceNum: "Rp 33.000", description: "Ceremonial grade matcha with fresh milk.",
    searchKey: "matcha latte hot ice ceremonial milk",
  },
  {
    id: "b17", name: "Hot Chocolate (Hot/Ice)", category: "beverages", categoryLabel: "Chocolate",
    price: "30K", priceNum: "Rp 30.000", description: "Rich Belgian chocolate with steamed milk.",
    searchKey: "hot chocolate belgian milk",
  },
  {
    id: "b18", name: "Iced Peach Tea", category: "beverages", categoryLabel: "Tea",
    price: "23K", priceNum: "Rp 23.000", description: "Refreshing peach iced tea.",
    searchKey: "iced peach tea refreshing",
  },
  {
    id: "b19", name: "Iced Berry Lychee Tea", category: "beverages", categoryLabel: "Tea",
    price: "25K", priceNum: "Rp 25.000", description: "Mixed berry and lychee iced tea.",
    searchKey: "iced berry lychee tea mixed",
  },
  // ═══ FOOD — Featured (with photo) ═══
  {
    id: "f1", name: "Chicken Sambal Matah", category: "food", categoryLabel: "Mains",
    price: "38K", priceNum: "Rp 38.000", description: "Fried rice with breast chicken and sambal matah TAMMMU signature.",
    image: "/tammmu/food/Chicken-Sambal-Matah.png",
    searchKey: "chicken sambal matah fried rice breast fresh balinese",
  },
  {
    id: "f2", name: "Chicken Sambel Embe", category: "food", categoryLabel: "Mains",
    price: "39K", priceNum: "Rp 39.000", description: "Fried rice with breast chicken and sambal embe TAMMMU signature.",
    image: "/tammmu/food/Chicken-Sambel-Embe.png",
    searchKey: "chicken sambel embe fried rice breast",
  },
  {
    id: "f3", name: "Chicken Skin", category: "food", categoryLabel: "Bites",
    price: "35K", priceNum: "Rp 35.000", description: "Crispy Chicken Skin with Aioli Sauce.",
    image: "/tammmu/food/Chicken-Skin.png",
    searchKey: "chicken skin crispy aioli sauce",
  },
  {
    id: "f4", name: "Chicken Wings", category: "food", categoryLabel: "Bites",
    price: "42K", priceNum: "Rp 42.000", description: "Wings Signature Rub, TAMMMU's Signature Truffle Oil.",
    image: "/tammmu/food/Chicken-Wings.png",
    searchKey: "chicken wings signature rub truffle oil",
  },
  {
    id: "f5", name: "Truffle Fries with Aioli", category: "food", categoryLabel: "Bites",
    price: "38K", priceNum: "Rp 38.000", description: "Crispy shoestring fries, grated parmesan, and fragrant truffle oil.",
    image: "/tammmu/food/Truffle-Fries-with-Aioli.png",
    searchKey: "truffle fries aioli parmesan truffle oil",
  },
  {
    id: "f6", name: "Spaghetti Carbonara con Manzo", category: "food", categoryLabel: "Pasta",
    price: "43K", priceNum: "Rp 43.000", description: "Spaghetti with cheese and beef.",
    image: "/tammmu/food/Spaghetti-Carbonara-con-Manzo.png",
    searchKey: "spaghetti carbonara con manzo cheese beef pasta",
  },
  {
    id: "f7", name: "Nasi Goreng Brisket", category: "food", categoryLabel: "Mains",
    price: "40K", priceNum: "Rp 40.000", description: "Fried rice with homemade brisket beef.",
    image: "/tammmu/food/Nasi-Goreng-Brisket.png",
    searchKey: "nasi goreng brisket fried rice homemade beef",
  },
  // ═══ FOOD — Text-Only (no photo) ═══
  {
    id: "f8", name: "Truffle Parmesan Fries", category: "food", categoryLabel: "Bites",
    price: "38K", priceNum: "Rp 38.000", description: "Fries, Parmesan Cheese, Truffle Oil.",
    searchKey: "truffle parmesan fries cheese oil",
  },
  {
    id: "f9", name: "Spaghetti Aglio e' Olio con Manzo", category: "food", categoryLabel: "Pasta",
    price: "39K", priceNum: "Rp 39.000", description: "Spaghetti with garlic confit and Italian herbs.",
    searchKey: "spaghetti aglio olio con manzo garlic confit italian herbs pasta",
  },
  // ═══ SOURDOUGH — Featured (with photo) ═══
  {
    id: "s1", name: "Sourdough Tre Formaggio", category: "sourdough", categoryLabel: "Toast",
    price: "48K", priceNum: "Rp 48.000", description: "Sourdough, Triple Cheese, Aioli Sauce.",
    image: "/tammmu/food/Sourdough-Tre-Formaggio.png",
    searchKey: "sourdough tre formaggio triple cheese aioli sauce",
  },
  {
    id: "s2", name: "Sourdough Mafioso", category: "sourdough", categoryLabel: "Toast",
    price: "48K", priceNum: "Rp 48.000", description: "Sourdough, Brisket Beef, Mozzarella, Aioli Sauce.",
    image: "/tammmu/food/Sourdough-Mafioso.png",
    searchKey: "sourdough mafioso brisket beef mozzarella aioli",
  },
];

const WIFI_PASSWORD = "tammmu2026";
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJacWFN5b71y0REVY5OeZhL70";

/* ─── Main Content Component ─── */
function TammmuContent() {
  const searchParams = useSearchParams();
  const rawTable = searchParams ? (searchParams.get("table") || searchParams.get("meja") || "01") : "01";
  const tableNum = rawTable.padStart(2, "0");

  const [isCoverVisible, setIsCoverVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "beverages" | "food" | "sourdough">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const dismissCover = () => {
    if (isFadingOut || !isCoverVisible) return;
    setIsFadingOut(true);
    setTimeout(() => setIsCoverVisible(false), 600);
  };

  useEffect(() => {
    const handler = () => { if (isCoverVisible && !isFadingOut) dismissCover(); };
    window.addEventListener("wheel", handler, { passive: true });
    window.addEventListener("touchmove", handler, { passive: true });
    return () => { window.removeEventListener("wheel", handler); window.removeEventListener("touchmove", handler); };
  }, [isCoverVisible, isFadingOut]);

  const handleCopyWifi = () => {
    const doCopy = () => { setCopiedWifi(true); showToast(`Sandi WiFi "${WIFI_PASSWORD}" disalin!`); setTimeout(() => setCopiedWifi(false), 2000); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(WIFI_PASSWORD).then(doCopy); }
    else { const t = document.createElement("input"); t.value = WIFI_PASSWORD; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); doCopy(); }
  };

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    showToast(`Layanan dipanggil untuk Meja ${tableNum}.`);
    setTimeout(() => setWaiterCalled(false), 3500);
  };

  // Filtered products
  const filtered = PRODUCTS.filter((p) => {
    const cat = activeCategory === "all" || p.category === activeCategory;
    const search = p.searchKey.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return cat && search;
  });

  const featuredItems = filtered.filter((p) => p.image);
  const textItems = filtered.filter((p) => !p.image);

  // Category counts
  const countBev = PRODUCTS.filter(p => p.category === "beverages").length;
  const countFood = PRODUCTS.filter(p => p.category === "food").length;
  const countSourdough = PRODUCTS.filter(p => p.category === "sourdough").length;

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#3C3833] antialiased pb-28 selection:bg-[#3C3833] selection:text-white">
      {/* ── 1. Fullscreen Welcome Cover (Mobile Only) ── */}
      {isCoverVisible && (
        <div
          onClick={dismissCover}
          className={`md:hidden fixed inset-0 z-50 w-full h-[100dvh] flex flex-col justify-end items-center bg-[#FFFCED] overflow-hidden transition-all duration-600 ease-in-out cursor-pointer ${isFadingOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
            }`}
        >
          <img src="/tammmu/brand/cover.png" alt="Tammmu Welcome Cover" className="absolute inset-0 w-full h-full object-cover object-center z-0" />
          <div className="relative z-10 w-full pb-4 pt-16 flex flex-col items-center justify-center bg-gradient-to-t from-[#F5F0E0] via-[#FFFCED]/70 to-transparent">
            <div className="flex flex-col items-center gap-1.5">
              <span className="material-symbols-outlined text-3xl text-[#3C3833]/50 animate-bounce">keyboard_arrow_down</span>
              <span className="text-[9px] font-semibold tracking-[0.22em] uppercase text-[#3C3833]/40 font-body">scroll</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Toast ── */}
      <div className={`fixed top-5 inset-x-0 z-50 flex justify-center pointer-events-none transition-all duration-300 transform ${toastMessage ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"}`}>
        <div className="px-4 py-2.5 rounded-2xl bg-[#3C3833]/90 backdrop-blur-md text-white text-[11px] font-medium shadow-lg border border-white/10 flex items-center gap-2 font-body">
          <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          <span>{toastMessage}</span>
        </div>
      </div>

      {/* ── 3. Sticky Header ── */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/80 backdrop-blur-lg border-b border-[#E3DCD2]/50 px-5 py-2.5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/tammmu/brand/logo.png" alt="Tammmu Logo" className="h-8 sm:h-10 w-auto object-contain" />
            <span className="text-xs text-[#C4BEB4]">|</span>
            <span className="text-xs font-semibold text-[#8E897C] tracking-[0.18em] uppercase font-body">Table {tableNum}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#8E897C] font-body">
            <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
            <span className="tracking-wider">08.00 — 22.00</span>
          </div>
        </div>
      </header>

      {/* ── 4. Main Content ── */}
      <main className="max-w-xl mx-auto px-5 pt-2 sm:pt-3 space-y-6 font-body">
        {/* Hero — Minimal */}
        <section className="text-center py-1 space-y-1">
          <div className="flex justify-center mb-2">
            <img src="/tammmu/brand/logo-fiks.png" alt="Tammmu Coffee Logo" className="h-10 sm:h-12 w-auto max-w-[200px] object-contain" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-[0.2em] text-[#3C3833]">MENU</h1>
          <p className="text-[10px] tracking-[0.24em] uppercase font-bold text-[#8E897C] pt-0.5">
            "ONE MORE, PLEASE."
          </p>
        </section>

        {/* Quick Actions — WiFi & Review */}
        <section className="grid grid-cols-2 gap-3">
          {/* WiFi */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E3DA] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <svg className="w-4 h-4 text-[#8E897C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
                <span className="text-[9px] font-medium uppercase tracking-wider text-[#8E897C] bg-[#F3EFEA] px-2 py-0.5 rounded-full">WiFi</span>
              </div>
              <p className="font-semibold text-xs text-[#3C3833]">Tammmu_Guest</p>
              <p className="text-[11px] text-[#9C9588] font-mono mt-0.5 select-all">{WIFI_PASSWORD}</p>
            </div>
            <button onClick={handleCopyWifi} className="mt-3 w-full py-2 rounded-xl bg-[#3C3833] text-[10px] font-semibold text-white flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              {copiedWifi ? "Tersalin ✓" : "Salin Password"}
            </button>
          </div>

          {/* Google Review */}
          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-white border border-[#E8E3DA] flex flex-col justify-between hover:border-amber-300 transition group cursor-pointer">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-amber-500 text-[10px] tracking-tight">★★★★★</span>
                <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">5.0</span>
              </div>
              <p className="text-xs font-semibold text-[#3C3833]">Suka suasana kami?</p>
              <p className="text-[11px] text-[#9C9588] leading-tight mt-0.5">Beri ulasan untuk barista kami.</p>
            </div>
            <div className="mt-3 w-full py-2 rounded-xl bg-amber-400 group-hover:bg-amber-300 text-[10px] font-semibold text-[#3C3833] text-center flex items-center justify-center gap-1 transition">
              Beri Ulasan Maps
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </div>
          </a>
        </section>

        {/* Search */}
        <div className="relative">
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu..."
            className="w-full bg-white border border-[#E8E3DA] rounded-full pl-10 pr-4 py-2.5 text-xs text-[#3C3833] placeholder-[#C4BEB4] focus:outline-none focus:ring-1 focus:ring-[#8E897C] transition font-body"
          />
          <svg className="w-4 h-4 text-[#C4BEB4] absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
          {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-2.5 text-xs text-[#9C9588]">✕</button>}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2 px-1 text-[11px] font-body">
          {([
            { key: "all" as const, label: `Semua (${PRODUCTS.length})` },
            { key: "beverages" as const, label: `Beverages (${countBev})` },
            { key: "food" as const, label: `Food (${countFood})` },
            { key: "sourdough" as const, label: `Sourdough (${countSourdough})` },
          ]).map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${activeCategory === cat.key
                ? "bg-[#3C3833] text-white shadow-xs"
                : "bg-white text-[#8E897C] border border-[#E8E3DA] hover:border-[#9C9588] hover:text-[#3C3833]"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Category Section Header ── */}
        {activeCategory !== "all" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#8E897C" }}>
            <div className="px-5 py-3.5 flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg text-white uppercase tracking-[0.2em]">
                {activeCategory === "beverages" ? "BEVERAGES" : activeCategory === "food" ? "FOOD" : "SOURDOUGH"}
              </h2>
              <img src="/tammmu/brand/logo.png" alt="Tammmu Logo" className="h-4 w-auto object-contain brightness-0 invert opacity-70" />
            </div>
          </div>
        )}

        {/* ── Featured Items (with Photos) ── */}
        {featuredItems.length > 0 && (
          <section>
            {activeCategory === "all" && (
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#9C9588] mb-3 font-body">Pilihan Tamu</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {featuredItems.map((product) => (
                <article
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group flex flex-col bg-white rounded-2xl border border-[#E8E3DA] overflow-hidden transition-all hover:border-[#C4BEB4] cursor-pointer active:scale-[0.97]"
                >
                  <div className="relative w-full aspect-square bg-[#EDE8DE] flex items-center justify-center">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    {product.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#3C3833]/85 text-[8px] font-semibold text-white tracking-wider uppercase font-body">{product.badge}</span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-semibold text-[11px] text-[#3C3833] leading-snug font-body">{product.name}</h3>
                      <span className="text-[11px] font-bold text-[#3C3833] shrink-0 font-body">{product.price}</span>
                    </div>
                    <p className="text-[10px] text-[#9C9588] leading-relaxed line-clamp-2 font-body">{product.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Text-Only Items (No Photo — Clean List) ── */}
        {textItems.length > 0 && (
          <section>
            {featuredItems.length > 0 && (
              <div className="border-t border-[#E8E3DA] pt-4 mt-2"></div>
            )}
            <div className="space-y-0">
              {textItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                  className="w-full flex items-center justify-between py-3 border-b border-[#E8E3DA]/60 hover:bg-[#F5F1EB] transition cursor-pointer px-1 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-[#3C3833] font-body block">{item.name}</span>
                    <span className="text-[10px] text-[#9C9588] font-body">{item.description}</span>
                  </div>
                  <span className="text-xs font-bold text-[#3C3833] ml-4 shrink-0 font-body">{item.price}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-10 px-4 rounded-2xl bg-white border border-[#E8E3DA]">
            <p className="text-xs text-[#9C9588] font-body">Tidak ada hidangan yang sesuai.</p>
          </div>
        )}

        {/* Ordering Notice */}
        <div className="rounded-2xl bg-[#F3EFEA] border border-[#E3DCD2] p-4 text-center space-y-1 mb-6">
          <p className="font-semibold text-xs text-[#3C3833] font-body">Pemesanan &amp; Pembayaran</p>
          <p className="text-[11px] text-[#8E897C] leading-relaxed font-body">Sebutkan Meja {tableNum} ke kasir atau gunakan tombol panggil bantuan pelayan di bawah.</p>
        </div>
      </main>

      {/* ── 5. Floating Bottom Dock — Liquid Glass ── */}
      <aside className={`fixed bottom-4 inset-x-0 z-40 px-4 pointer-events-none transition-all duration-500 ease-out ${isCoverVisible ? "translate-y-24 opacity-0" : "translate-y-0 opacity-100"}`}>
        <div
          className="max-w-md mx-auto pointer-events-auto flex items-center justify-between gap-2 p-1.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow: "0 8px 32px rgba(38,35,30,0.18), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.06)",
            border: "1px solid rgba(255,255,255,0.35)",
          }}
        >
          <button
            onClick={handleCallWaiter}
            className="flex-1 py-2.5 px-4 rounded-full text-[11px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer font-body"
            style={{
              background: waiterCalled ? "rgba(16,185,129,0.18)" : "rgba(38,35,30,0.72)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              color: waiterCalled ? "#065f46" : "#FAF8F5",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.12)",
              border: waiterCalled ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <svg className="w-3.5 h-3.5 shrink-0" style={{ color: waiterCalled ? "#10b981" : "#6ee7b7" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span className="truncate">{waiterCalled ? "Dipanggil..." : "Panggil Waiter"}</span>
          </button>
          <a
            href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-full text-[11px] font-semibold flex items-center gap-1.5 active:scale-95 transition-all shrink-0 cursor-pointer font-body"
            style={{
              background: "rgba(251,191,36,0.82)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              color: "#451a03", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(245,158,11,0.3)",
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          >
            <svg className="w-3 h-3 fill-current" style={{ color: "#92400e" }} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <span>Rating</span>
          </a>
        </div>
      </aside>

      {/* ── 6. Product Detail Modal ── */}
      {selectedProduct && (
        <div onClick={() => setSelectedProduct(null)} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 cursor-pointer">
          <div onClick={(e) => e.stopPropagation()} className="bg-[#FAF8F5] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto cursor-default border border-[#E8E3DA]">
            {/* Image or placeholder */}
            {selectedProduct.image ? (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#EDE8DE]">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                {selectedProduct.badge && (
                  <span className="absolute top-3 left-3 bg-[#3C3833] text-white text-[9px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-body">{selectedProduct.badge}</span>
                )}
              </div>
            ) : (
              <div className="w-full aspect-[2/1] rounded-2xl bg-[#EDE8DE] flex items-center justify-center">
                <img src="/tammmu/brand/logo.png" alt="Tammmu Logo" className="h-7 w-auto object-contain opacity-60" />
              </div>
            )}

            {/* Info */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base text-[#3C3833] font-body">{selectedProduct.name}</h3>
                <span className="font-bold text-sm text-[#3C3833] bg-[#F3EFEA] px-2.5 py-1 rounded-lg border border-[#E3DCD2] shrink-0 font-body">{selectedProduct.priceNum}</span>
              </div>
              <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-[#9C9588] font-medium font-body">{selectedProduct.categoryLabel}</span>
            </div>

            <div className="pt-2 border-t border-[#E8E3DA]">
              <p className="text-xs text-[#8E897C] leading-relaxed font-light font-body">{selectedProduct.description}</p>
            </div>

            <button onClick={() => setSelectedProduct(null)} className="w-full py-2.5 rounded-xl bg-[#3C3833] hover:bg-black text-white text-xs font-semibold active:scale-95 transition cursor-pointer font-body">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Default Export ─── */
export default function TammmuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs text-[#8E897C]">Loading...</div>}>
      <TammmuContent />
    </Suspense>
  );
}
