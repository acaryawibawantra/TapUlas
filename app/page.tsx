import Link from "next/link";
import EditPortal from "./EditPortal";

export default function Home() {
  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface-white border-b border-outline-variant transition-all duration-300">
        <div className="flex items-center gap-2.5">
          <img src="/ratey-logo.png" alt="Ratey Logo" className="w-9 h-9 md:w-10 md:h-10 object-cover rounded-xl" />
          <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight">
            Ratey
          </span>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <a
            className="text-secondary font-bold hover:bg-surface-container transition-colors px-3 py-2 rounded-lg opacity-80 duration-150"
            href="#"
          >
            Beranda
          </a>
          <a
            className="text-on-surface-variant hover:bg-surface-container transition-colors px-3 py-2 rounded-lg"
            href="#cara-kerja"
          >
            Cara Kerja
          </a>
          <a
            className="text-on-surface-variant hover:bg-surface-container transition-colors px-3 py-2 rounded-lg"
            href="#portal"
          >
            Portal
          </a>
          <a
            href="https://instagram.com/acaryawibawantra"
            target="_blank"
            rel="noreferrer"
            className="text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors px-3 py-2 rounded-lg inline-flex items-center gap-1.5"
            title="Hubungi Owner via Instagram"
          >
            <svg className="w-4 h-4 fill-current text-[#E4405F]" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>@acaryawibawantra</span>
          </a>
          <a
            href="#portal"
            className="bg-primary text-on-primary font-label-bold text-label-bold px-4 py-2 rounded-lg hover:bg-on-primary-fixed transition-colors inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">credit_card</span>
            <span>Kelola Kartu</span>
          </a>
        </div>
        <div className="md:hidden flex items-center">
          <a href="#portal" className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg flex items-center gap-1 text-xs font-bold">
            <span className="material-symbols-outlined text-sm">credit_card</span>
            <span>Kelola Kartu</span>
          </a>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-16 pb-20 md:pb-0">
        {/* Hero Section: Mobile displays /img/mobile.png below text; Desktop uses bg2.png background */}
        <section className="relative w-full bg-none md:bg-[url('/bg2.png')] md:bg-cover md:bg-bottom md:bg-no-repeat pt-6 md:pt-10 pb-10 md:pb-28 px-container-margin border-b border-outline-variant overflow-hidden">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-stack-lg items-center">
            {/* Hero Left Content Text & Action Buttons */}
            <div className="flex flex-col gap-stack-md text-left z-10 max-w-xl py-2">
              <h1 className="text-headline-lg-mobile font-headline-lg-mobile md:text-headline-lg md:font-headline-lg text-primary leading-tight">
                Dapatkan Review Google Maps Lebih Cepat
              </h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant">
                Satu tap ke kartu NFC atau scan QR, pelanggan langsung diarahkan ke halaman ulasan bisnis Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-gutter justify-start pt-4">
                <a
                  href="https://instagram.com/acaryawibawantra"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-cta-activation text-on-primary font-label-bold text-label-bold px-8 py-4 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 min-h-[48px] shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined">shopping_cart</span>
                  <span>Pesan Sekarang</span>
                </a>
                <a
                  href="#cara-kerja"
                  className="bg-surface-white border border-outline-variant text-primary font-label-bold text-label-bold px-8 py-4 rounded-lg hover:bg-surface-container-low transition-all flex items-center justify-center min-h-[48px] shadow-sm"
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </div>

            {/* Mobile Only: Product Demo Video public/vidio-work.mp4 (Original Landscape 16:9) */}
            <div className="block md:hidden mt-5 w-full flex justify-center">
              <div className="w-full max-w-md bg-surface-white rounded-2xl overflow-hidden border border-outline-variant shadow-sm p-1.5">
                <video
                  src="/vidio-work.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-auto aspect-video object-contain rounded-xl bg-black"
                />
              </div>
            </div>

            {/* Desktop Only: Empty Right Column for Background Photo */}
            <div className="hidden md:block h-[420px] md:h-[500px] pointer-events-none" />
          </div>
        </section>

        {/* Cara Kerja Section */}
        <section className="bg-surface-white py-stack-lg border-b border-outline-variant" id="cara-kerja">
          <div className="max-w-7xl mx-auto px-container-margin">
            <div className="text-center mb-stack-lg">
              <h2 className="text-headline-md font-headline-md text-primary mb-base">
                Cara Kerja Sangat Sederhana
              </h2>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Kumpulkan ulasan dalam tiga langkah mudah.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Step 1 */}
              <div className="bg-surface-bright border border-outline-variant rounded-xl p-stack-md flex flex-col items-center text-center card-shadow hover:border-secondary transition-colors">
                <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary mb-stack-sm">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    contactless
                  </span>
                </div>
                <h3 className="text-label-bold font-label-bold text-primary mb-base">1. Tap atau Scan</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Pelanggan cukup menempelkan smartphone mereka ke kartu atau melakukan scan QR code.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-surface-bright border border-outline-variant rounded-xl p-stack-md flex flex-col items-center text-center card-shadow hover:border-secondary transition-colors">
                <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary mb-stack-sm">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    open_in_new
                  </span>
                </div>
                <h3 className="text-label-bold font-label-bold text-primary mb-base">2. Buka Link</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Smartphone otomatis membuka formulir ulasan Google bisnis Anda tanpa perlu mencari.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-surface-bright border border-outline-variant rounded-xl p-stack-md flex flex-col items-center text-center card-shadow hover:border-secondary transition-colors">
                <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary mb-stack-sm">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                </div>
                <h3 className="text-label-bold font-label-bold text-primary mb-base">3. Berikan Rating</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Pelanggan memberikan review bintang 5 dalam hitungan detik, meningkatkan reputasi Anda.
                </p>
              </div>
            </div>

            {/* Desktop Only: Video Peragaan Cara Kerja - Matched to Card Styling Above */}
            <div className="hidden md:flex mt-12 justify-center">
              <div className="w-full max-w-2xl bg-surface-bright border border-outline-variant rounded-2xl p-2.5 card-shadow hover:border-secondary transition-colors overflow-hidden">
                <video
                  src="/vidio-work.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full aspect-[16/9] max-h-[460px] object-cover md:object-contain rounded-xl bg-black"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Portal Pemilik Bisnis Section (Bento Grid Style) */}
        <section className="py-stack-lg px-container-margin max-w-7xl mx-auto" id="portal">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Portal Form Card */}
            <div className="lg:col-span-1 bg-surface-white border border-outline-variant rounded-2xl p-stack-md card-shadow flex flex-col justify-between">
              <EditPortal />
            </div>

            {/* Keunggulan Bento Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-gutter">
              {/* Feature 1 */}
              <div className="bg-surface-white border border-outline-variant rounded-2xl p-stack-md card-shadow hover:border-outline transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary mb-stack-sm group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    money_off
                  </span>
                </div>
                <h3 className="text-label-bold font-label-bold text-primary mb-base">Tanpa Biaya Bulanan</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Bayar sekali untuk kartu, gunakan selamanya. Tidak ada biaya berlangganan atau biaya tersembunyi.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-surface-white border border-outline-variant rounded-2xl p-stack-md card-shadow hover:border-outline transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary mb-stack-sm group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                </div>
                <h3 className="text-label-bold font-label-bold text-primary mb-base">Kartu Tahan Lama</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Material premium yang dirancang untuk penggunaan jangka panjang di lingkungan bisnis yang sibuk.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="sm:col-span-2 bg-surface-white border border-outline-variant rounded-2xl p-stack-md card-shadow hover:border-outline transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-stack-md group">
                <div className="w-16 h-16 shrink-0 rounded-lg bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    rocket_launch
                  </span>
                </div>
                <div>
                  <h3 className="text-label-bold font-label-bold text-primary mb-base">Setup Sangat Mudah</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Tidak perlu keahlian teknis. Aktivasi kartu dalam waktu kurang dari 2 menit melalui portal kami dan langsung siap digunakan untuk mengumpulkan ulasan berharga dari pelanggan Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Cerita & Threads Post (Social Proof / Real Products) - Placed Above Footer */}
        <section className="bg-surface-container-low py-stack-lg border-t border-b border-outline-variant">
          <div className="max-w-4xl mx-auto px-container-margin">
            <div className="text-center mb-stack-md">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-secondary text-label-caps font-label-caps mb-2">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span>Cerita di Balik Ratey</span>
              </span>
              <h2 className="text-headline-md font-headline-md text-primary mb-base">
                Dari Posting Iseng Jadi Produk Nyata
              </h2>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Berawal dari respons di Threads, sekarang akrilik &amp; kartu NFC Ratey siap dipakai langsung di meja cafe atau resto kamu.
              </p>
            </div>

            {/* Threads Card UI */}
            <div className="bg-[#101010] text-white rounded-2xl p-6 md:p-8 shadow-2xl border border-white/10 max-w-2xl mx-auto">
              {/* Threads Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src="/ratey-logo.png"
                    alt="Ratey Logo Avatar"
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-white/20 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-white flex-wrap">
                      <span className="truncate">acaryawibawantra</span>
                      <span className="text-[11px] sm:text-xs text-white/50 shrink-0">› Coding</span>
                    </div>
                    <span className="text-[11px] sm:text-xs text-white/40 block truncate">Owner &amp; Developer Ratey</span>
                  </div>
                </div>
                <a
                  href="https://threads.net/@acaryawibawantra"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap ml-auto"
                >
                  <span>Lihat di Threads</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>

              {/* Threads Post Content Text */}
              <p className="text-sm md:text-base text-white/90 leading-relaxed mb-4">
                Ga nyangka kemarin rame, sekarang memberanikan diri untuk print (pakai akrilik) dan mau coba jualan 🙃, monggo buat bisnis owner coffee shop atau restaurant yang butuh card untuk google reviews rating bisa DM saya ya, siap antar area surabaya atau pengiriman online 📦✨
              </p>

              {/* Threads Media Grid: 1 Video (vidio.mp4) + 2 Photos (img1.jpg, img2.jpg) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5 rounded-xl overflow-hidden">
                {/* Media 1: Video vidio.mp4 */}
                <div className="aspect-[4/5] bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
                  <video
                    src="/img/threads/vidio.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* Media 2: Photo img1.jpg */}
                <div className="aspect-[4/5] bg-white/5 rounded-xl overflow-hidden border border-white/10">
                  <img
                    src="/img/threads/img1.jpg"
                    alt="Standee Akrilik Ratey di Meja Cafe"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Media 3: Photo img2.jpg */}
                <div className="aspect-[4/5] bg-white/5 rounded-xl overflow-hidden border border-white/10">
                  <img
                    src="/img/threads/img2.jpg"
                    alt="Kartu NFC &amp; Standee Ratey"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Threads Post Footer / Action */}
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <a
                  href="https://instagram.com/acaryawibawantra"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto bg-cta-activation text-on-primary font-bold px-5 py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 text-xs md:text-sm shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>DM Pemesanan (Surabaya &amp; Online)</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 bg-surface-white border-t border-outline-variant shadow-sm md:hidden transition-transform duration-300">
        <a
          className="flex flex-col items-center justify-center text-secondary bg-secondary-container/10 rounded-xl px-3 py-1 scale-95 transition-transform duration-200"
          href="#"
        >
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
            home
          </span>
          <span className="text-label-caps font-label-caps">Beranda</span>
        </a>
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"
          href="#portal"
        >
          <span className="material-symbols-outlined mb-1">sensors</span>
          <span className="text-label-caps font-label-caps">Aktivasi</span>
        </a>
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"
          href="#portal"
        >
          <span className="material-symbols-outlined mb-1">credit_card</span>
          <span className="text-label-caps font-label-caps">Kelola Kartu</span>
        </a>
      </nav>

      {/* Footer */}
      <footer className="w-full py-12 px-container-margin flex flex-col items-center space-y-6 bg-surface-container-low border-t border-outline-variant mb-20 md:mb-0">
        <div className="flex items-center gap-2 mb-2">
          <img src="/ratey-logo.png" alt="Ratey Logo" className="w-7 h-7 object-cover rounded-md" />
          <span className="text-label-bold font-label-bold text-primary tracking-tight">Ratey</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 items-center">
          <a className="text-text-muted text-label-caps font-label-caps hover:text-primary transition-colors" href="#">
            Beranda
          </a>
          <a className="text-text-muted text-label-caps font-label-caps hover:text-primary transition-colors" href="#cara-kerja">
            Cara Kerja
          </a>
          <a className="text-text-muted text-label-caps font-label-caps hover:text-primary transition-colors" href="#portal">
            Kelola Kartu
          </a>
          <a
            href="https://instagram.com/acaryawibawantra"
            target="_blank"
            rel="noreferrer"
            className="text-text-muted text-label-caps font-label-caps hover:text-[#E4405F] transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 fill-current text-[#E4405F]" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Instagram: @acaryawibawantra</span>
          </a>
        </div>
        <p className="text-body-sm font-body-sm text-on-surface-variant text-center">
          © 2026 Ratey. Solusi Review Bisnis Modern.
        </p>
      </footer>
    </>
  );
}
