-- Jalankan ini di Supabase SQL Editor (project kamu > SQL Editor > New query)

create table if not exists cards (
  card_id text primary key,
  business_name text,
  place_id text,
  google_review_url text,
  pin_hash text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

-- Index buat lookup cepat (card_id sudah primary key jadi otomatis ada index,
-- ini cuma jaga-jaga kalau nanti query berdasarkan status juga)
create index if not exists idx_cards_is_active on cards (is_active);

-- Row Level Security: matikan akses langsung dari client,
-- semua akses HARUS lewat server (API routes pakai service_role key)
alter table cards enable row level security;
-- Sengaja TIDAK dibuatkan policy apapun di sini, artinya:
-- - anon/public key: tidak bisa baca/tulis apapun ke tabel ini
-- - service_role key (dipakai di server, bukan di browser): bisa full access
-- Ini penting supaya PIN hash & data bisnis tidak bisa diakses langsung dari frontend.

-- ──────────────────────────────────────────────────────────────────────────────
-- TABLE QR MEJA CUSTOM (Tammmu, dan client cafe lainnya)
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists table_qrs (
  id bigserial primary key,
  client_slug text not null,
  table_num text not null,
  url text not null,
  created_at timestamptz not null default now(),
  unique (client_slug, table_num)
);

create index if not exists idx_table_qrs_client_slug on table_qrs (client_slug);
create index if not exists idx_table_qrs_created_at on table_qrs (created_at desc);

-- Row Level Security: sama seperti cards, tidak ada akses langsung dari client
alter table table_qrs enable row level security;
-- (Tidak ada policy — hanya server dengan service_role yang bisa akses)
