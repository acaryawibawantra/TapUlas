import Link from "next/link";
import EditPortal from "./EditPortal";

export default function Home() {
  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface-white border-b border-outline-variant transition-all duration-300">
        <div className="flex items-center gap-2.5">
          <img src="/logofiks.png" alt="UlasIN Logo" className="w-9 h-9 md:w-10 md:h-10 object-contain rounded-lg" />
          <span className="text-headline-md font-headline-md font-bold text-primary tracking-tight">
            UlasIN
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
        {/* Hero Section */}
        <section className="px-container-margin py-stack-lg md:py-24 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-stack-lg items-center">
          <div className="flex flex-col gap-stack-md text-center md:text-left z-10">
            <h1 className="text-headline-lg-mobile font-headline-lg-mobile md:text-headline-lg md:font-headline-lg text-primary">
              Dapatkan Review Google Maps Lebih Cepat
            </h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto md:mx-0">
              Satu tap ke kartu NFC atau scan QR, pelanggan langsung diarahkan ke halaman ulasan bisnis Anda. Tingkatkan reputasi online tanpa friksi.
            </p>
            <div className="flex flex-col sm:flex-row gap-gutter justify-center md:justify-start pt-4">
              <a
                href="#portal"
                className="bg-cta-activation text-on-primary font-label-bold text-label-bold px-8 py-4 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span className="material-symbols-outlined">bolt</span>
                <span>Mulai Aktivasi</span>
              </a>
              <a
                href="#cara-kerja"
                className="bg-surface-white border border-outline-variant text-primary font-label-bold text-label-bold px-8 py-4 rounded-lg hover:bg-surface-container-low transition-all flex items-center justify-center min-h-[48px]"
              >
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>

          <div className="relative w-full aspect-square md:aspect-auto md:h-[480px] flex justify-center items-center rounded-2xl overflow-hidden bg-surface-white border border-outline-variant card-shadow">
            <div className="absolute inset-0 bg-secondary-container/5 pointer-events-none" />
            <img
              className="w-[75%] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 ease-out"
              alt="UlasIN NFC Smart Card Mockup"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyVcrwTo1F--EKs9xdy20ts3z6-raTwjcYC1aeoit2o_wobUPtCqU9ihOf-9lTtDhOJ3B5E27Q9Vl3iSxz5mXW5GDOM7dvaX632Q1McGwON4Mgo-IeScEs7eqcmKl5FbJ1Rt4CGqSxs-JuHi-9rTWs33a9fyhSJjCK0PEH_Kwv1yq5mFv3FtQNQvZfpxNIryEOkqqrwfQA9UZ_lEnF75AUsnEZzu_TQS-ccjEL5y8jROPif4q2gQ"
            />
          </div>
        </section>

        {/* Cara Kerja Section */}
        <section className="bg-surface-white py-stack-lg border-y border-outline-variant" id="cara-kerja">
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
          <img src="/logofiks.png" alt="UlasIN Logo" className="w-6 h-6 object-contain rounded-md" />
          <span className="text-label-bold font-label-bold text-primary tracking-tight">UlasIN</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
          <a className="text-text-muted text-label-caps font-label-caps hover:text-primary transition-colors" href="#">
            Beranda
          </a>
          <a className="text-text-muted text-label-caps font-label-caps hover:text-primary transition-colors" href="#cara-kerja">
            Cara Kerja
          </a>
          <a className="text-text-muted text-label-caps font-label-caps hover:text-primary transition-colors" href="#portal">
            Kelola Kartu
          </a>
        </div>
        <p className="text-body-sm font-body-sm text-on-surface-variant text-center">
          © 2026 UlasIN. Solusi Review Bisnis Modern.
        </p>
      </footer>
    </>
  );
}
