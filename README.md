# Studio EMPAD

Landing page studio foto EMPAD dengan reservasi lewat WhatsApp. Dibangun dengan React 19 + Vite 6 (JavaScript) dan Tailwind CSS v4. HTML di-prerender saat build agar konten langsung terbaca mesin pencari.

## Menjalankan

Butuh Node.js `^20.19`, `^22.13`, atau `>=24` (syarat ESLint 10) dan npm. Diverifikasi dengan Node 24.11.

```bash
npm ci            # install dependency
npm run dev       # dev server di http://localhost:3000 (tanpa prerender)
npm run lint      # ESLint
npm run build     # build produksi + prerender ke dist/
npm run preview   # sajikan dist/ secara lokal
```

## Variabel lingkungan

| Nama | Wajib | Keterangan |
|---|---|---|
| `VITE_SITE_URL` | Untuk produksi | URL publik situs, mis. `https://domain-anda.id`. Dipakai untuk canonical, `og:url`, `og:image`, `robots.txt`, dan `sitemap.xml`. Jika kosong, build tetap jalan tetapi tag/berkas tersebut dilewati (ada peringatan di log). |

Salin `.env.example` menjadi `.env`, atau set variabel di platform hosting.

## Struktur

```text
index.html            template + <head> SEO statis
scripts/prerender.js  menyuntik HTML hasil SSR ke dist/index.html, membuat robots.txt & sitemap.xml
scripts/verify/       pemeriksaan Playwright (paritas visual, interaksi) — dev-only
src/
  main.jsx            hydrate (produksi) / render (dev)
  entry-server.jsx    render untuk prerender + tag head & JSON-LD
  App.jsx             menyusun section
  config/site.js      nomor WhatsApp, sosmed, jam buka, peta, SITE_URL
  data/               konten statis (menu, paket, add-on, FAQ, portfolio, …)
  lib/                helper kecil (link WhatsApp, scroll per frame, …)
  hooks/              efek: scroll, parallax, reveal, disclosure, kunci scroll, Esc, media query
  components/         layout (Navbar, Footer, WhatsAppFloat) dan ui (tombol, ikon, dsb.)
  sections/           Hero, Experience, Portfolio, Lightbox, Pricing, Booking, Faq
  styles/index.css    token @theme, breakpoint, reset, gaya komponen
public/assets/        gambar, video, logo
```

Konten (harga, FAQ, pesan WhatsApp, dll.) diubah di `src/data/` dan `src/config/site.js`. Komponen tidak perlu disentuh.

## Verifikasi

Skrip di `scripts/verify/` memakai Google Chrome yang terpasang (`channel: 'chrome'`):

```bash
# paritas visual antara dua build yang sedang di-serve (mis. versi lama di :4100, baru di :4200)
node scripts/verify/visual-compare.mjs http://localhost:4100 http://localhost:4200

# uji interaksi; argumen kedua opsional untuk membandingkan URL WhatsApp dengan versi lama
node scripts/verify/interactions.mjs http://localhost:4200 http://localhost:4100
```

Hasil screenshot tersimpan di `.verify-output/` (tidak di-commit). Versi vanilla sebelum migrasi tersedia di tag git `legacy-vanilla-v1`.
