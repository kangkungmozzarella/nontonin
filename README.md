# Nontonin

Aplikasi mobile pemesanan tiket bioskop dengan **pratinjau kursi 3D**: ketuk kursi di denah, kamera terbang ke kursi itu, dan kamu melihat layar dari sudut pandang tersebut sebelum membeli.

Dibuat dengan Expo (SDK 58), React Native, React Navigation, react-query, dan Three.js (`@react-three/fiber/native` di atas `expo-gl`). Struktur folder mengikuti kurosim-mobile.

Interaksi pratinjau kursi 3D terinspirasi dari konsep UI/UX "Meridian" karya Ramin Nasibov. Kreditnya tampil di halaman Tentang. Isi `DESIGN_CREDIT.url` di `src/common/constants/app.ts` dengan tautan karya aslinya agar tombol "Lihat karya aslinya" muncul.

## Menjalankan

```bash
cp .env.example .env.local   # lalu isi EXPO_PUBLIC_TMDB_TOKEN
npm install
npx expo start          # scan QR dengan Expo Go (SDK 58) di HP
npm run ts-check        # typecheck
npm run lint
npm run assets          # gambar ulang ikon, splash, poster, dan still film
```

Semua modul native yang dipakai sudah tersedia di Expo Go, jadi belum perlu development build.

### Data film dari TMDB

Film sedang tayang dan segera tayang (judul, poster, backdrop, sinopsis, genre, durasi, rating usia, sutradara, pemeran) diambil dari [TMDB](https://www.themoviedb.org) untuk wilayah Indonesia. Backdrop film juga tampil di layar bioskop pada pratinjau 3D.

- Buat **API Read Access Token** di https://www.themoviedb.org/settings/api, lalu simpan di `.env.local` sebagai `EXPO_PUBLIC_TMDB_TOKEN`. File ini diabaikan git, jadi **jangan menaruh token di kode**.
- Setelah mengubah `.env.local`, jalankan ulang `npx expo start`.
- Tanpa token, aplikasi otomatis memakai film demo fiktif bawaan.
- Nilai `EXPO_PUBLIC_*` ikut masuk ke bundle aplikasi. Untuk rilis sungguhan, panggil TMDB lewat backend sendiri.
- Bioskop, jadwal tayang, dan pembayaran tetap tiruan karena TMDB tidak menyediakan jadwal bioskop.
- Sesuai ketentuan TMDB, halaman Tentang menampilkan atribusi TMDB.

> **Catatan iOS Simulator:** tampilan 3D di simulator iOS sering membeku di frame pertama dan kompilasi shader-nya sangat lambat. Ini keterbatasan GL di simulator. Untuk menguji 3D, pakai HP sungguhan atau emulator Android.

## Fitur

- Splash screen animasi, ikon aplikasi, dan onboarding 3 langkah
- Popup saat masuk: izin lokasi (memilih kota terdekat otomatis) dan promo (bisa disembunyikan untuk hari ini)
- Beranda: banner promo otomatis bergeser, film sedang tayang dan segera tayang, bioskop terdekat
- Pilih kota (9 kota). Bioskop diurutkan menurut jarak kalau lokasi diizinkan
- Detail film dengan jadwal per bioskop untuk 7 hari ke depan; detail bioskop dengan petunjuk arah
- Pilih kursi: denah 2D dan pratinjau 3D (drag untuk melihat sekeliling, minimap untuk pindah kursi, label kualitas kursi). Pratinjau 3D bisa dimatikan supaya ketukan langsung memilih kursi
- Checkout (diskon hari kerja untuk bioskop reguler, biaya layanan, metode pembayaran demo), tiket dengan QR, dan "lihat pandangan dari kursiku" dari tiket
- Bahasa Indonesia dan Inggris, deep link `nontonin://`

## Struktur

```
app.config.ts           konfigurasi Expo (ikon, splash, izin lokasi)
metro.config.js         memaksa satu build ESM three.js agar R3F tidak crash di React Native
scripts/                generator aset (ikon, splash, art film)
src/
  app.tsx               provider, font, splash animasi
  navigators/           stack, tab, deep link
  modules/              layar per fitur (home, film, cinemas, seat, checkout, tickets, profile, …)
  api-hooks/            hook react-query per domain (model + query)
  common/
    api/catalog.ts      katalog film: TMDB kalau ada token, film demo kalau tidak
    api/tmdb/           klien TMDB
    api/mock/           bioskop, jadwal, kursi, dan booking tiruan
    theater/            geometri studio dan analisis kualitas kursi (dipakai 2D dan 3D)
    components/         komponen dasar (Text, Button, Popup, Toast, …)
    constants/          token desain, aset, konstanta aplikasi
  hooks/                kota, lokasi, tiket, bahasa
  locales/              teks id/en
```

## Tempat yang sering diubah

- **Sambung ke backend:** ganti isi `queryFn` atau `mutationFn` di `src/api-hooks/*/query.ts`. Bentuk datanya ada di `model.ts` masing-masing. Data film diatur di `src/common/api/catalog.ts`.
- **Layout studio:** `src/common/theater/layout.ts`. Denah 2D, minimap, dan ruang 3D ikut berubah otomatis, termasuk posisi lorong (`AISLE_AFTER`).
- **Harga dan diskon:** `PRICE` di `src/common/api/mock/data.ts` dan `src/common/helpers/pricing.ts`.
- **Label kualitas kursi:** `analyze()` di `src/common/theater/analyze.ts`, teksnya di `src/locales/*/booking.ts`.
- **Pencahayaan dan material 3D:** `src/modules/seat/theater/build-scene.ts`. Gerak kamera ada di `camera-controller.ts`.
- **Nama aplikasi:** `APP_NAME` di `src/common/constants/app.ts` dan `name`/`slug`/`scheme` di `app.config.ts`.

Bioskop dan jadwal tayang di aplikasi ini fiktif. Film demo (saat tanpa token TMDB) juga fiktif. Data dan gambar film asli disediakan oleh TMDB; produk ini menggunakan TMDB API tetapi tidak didukung atau disertifikasi oleh TMDB.
