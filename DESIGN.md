# DESIGN.md · Nontonin

Arahan visual untuk aplikasi mobile (`seat-view`) dan situs web (`seat-view-webapp`). Isinya diambil dari referensi yang diberikan pemilik produk (konsep aplikasi bioskop gelap dengan sidebar, hero key art, dan satu aksen merah) serta jawaban atas pertanyaan arah desain pada 12 Nov 2026. Salinan file ini ada di kedua repo dan harus tetap sama.

## Identitas

Nontonin adalah aplikasi pesan tiket bioskop yang memperlihatkan pandangan ke layar dari kursi pilihanmu sebelum membayar. Yang ditonjolkan adalah filmnya (poster dan key art) dan kursinya. UI hanya bingkai.

## Mood

Ruang bioskop sebelum film mulai: gelap, hangat, dan pusat perhatiannya gambar. Tema gelap dipilih karena alasan itu, bukan karena terlihat "teknologi". Tidak ada mode terang.

## Palet

Dua warna inti netral, satu aksen. Jangan menambah warna lain tanpa alasan tertulis di sini.

| Token | Nilai | Pakai untuk |
|---|---|---|
| `bg` | `#0B0A0E` | Latar halaman |
| `panel` | `#141417` / `#16151A` | Kartu, sidebar, panel |
| `text` | `#F3F2EF` | Teks utama |
| `muted` | `#8F8D95` | Teks sekunder |
| `dim` | `#8A8890` | Teks tersier (label baris kursi, hak cipta). Menggantikan `#5D5C63` yang gagal kontras |
| `accent` | `#C8102E` (merah tirai) | Lihat aturan aksen |
| `onAccent` | `#F3F2EF` | Teks dan ikon di atas aksen |

Kontras yang sudah dihitung: teks putih di atas aksen 5,26:1, aksen di atas `bg` 3,35:1 (cukup untuk penanda non-teks dan teks besar, tidak untuk teks kecil), `dim` di `panel` 5,19:1.

### Aturan aksen

Merah hanya muncul di tiga tempat:

1. Tombol utama di tiap layar (satu per layar): Beli tiket, Lanjut, Bayar.
2. Item yang sedang aktif atau dipilih: menu navigasi aktif, jam tayang terpilih, bioskop terpilih (border), metode pembayaran terpilih (border).
3. Kursi yang dipilih di denah.

Tidak dipakai untuk tautan, ikon dekoratif, judul seksi, badge, tanggal rilis, atau latar gradien. Tautan memakai `text` dengan garis bawah.

Teks kecil berwarna merah di atas latar gelap tidak boleh dipakai (3,35:1). Kalau perlu teks merah, jadikan teks putih di atas blok merah.

### Kursi

Status kursi harus terbaca tanpa bergantung pada warna dan minimal 3:1 terhadap latar:

- Kosong: kotak dengan garis `#6A6971` (3,64:1 di `bg`).
- Terisi: blok gelap dengan tanda silang `dim`, sehingga bentuknya berbeda, bukan hanya warnanya.
- Dipilih: blok merah aksen dengan nomor kursi putih.
- Recliner: cokelat kulit, bukan merah, supaya tidak tertukar dengan kursi yang dipilih. Dibedakan juga dari bentuknya yang lebih lebar.

Di scene 3D, kursi boleh tetap berwarna kain bioskop, karena itu gambar dan bukan kontrol UI.

## Tipografi

Plus Jakarta Sans untuk semua teks. Alasannya: font ini dirancang Tokotype (studio Indonesia) untuk identitas kota Jakarta, gayanya geometris tebal seperti referensi, dan cocok untuk aplikasi bioskop Indonesia.

- Judul film dan judul halaman: ExtraBold (800), rapat (letter-spacing sedikit negatif).
- Teks isi: Regular (400) dan Medium (500).
- Label tidak memakai huruf kapital semua dengan spasi lebar. Pakai huruf biasa dengan ketebalan SemiBold untuk membedakan.

## Bentuk

Radius dipakai untuk hierarki, bukan diseragamkan:

- Tombol utama dan sekunder: pil penuh.
- Kartu, panel, poster: 12px.
- Kotak jam tayang, chip genre, input, item metode pembayaran: 8px.
- Item navigasi aktif: blok persegi dengan radius 8px, bukan pil.

Bayangan hanya untuk elemen yang benar-benar melayang di atas halaman (modal, sheet). Kartu rata dengan latar, dibedakan oleh warna `panel`.

Efek kaca blur paling banyak di satu permukaan per layar, dan hanya di atas gambar atau scene 3D.

## Tata letak web (desktop)

Mengikuti struktur referensi:

- Sidebar kiri tetap: logo di atas, menu dengan ikon dan label (Beranda, Film, Bioskop, Tiket saya, Tentang), item aktif berupa blok merah.
- Bar atas: kolom pencarian film, pemilih kota, pilihan bahasa.
- Beranda: hero key art besar dengan judul ExtraBold rata kiri, satu kalimat, satu tombol. Di bawahnya rel poster horizontal.
- Detail film: poster di kiri, info di kanan (judul, skor, genre, durasi, sinopsis, tombol), lalu tab (Tentang, Jadwal).
- Jadwal: bioskop sebagai kartu yang bisa dipilih, jam tayang sebagai kotak.
- Kursi: bar ringkasan di atas (poster kecil, judul, bioskop dan waktu, kursi dipilih, total), denah kursi, dan pratinjau 3D. Pratinjau 3D adalah pembeda Nontonin dan tetap mendapat ruang besar.
- Pembayaran: ringkasan pesanan dan metode pembayaran berdampingan.
- Tiket: kartu tiket dengan QR.

Di layar di bawah 900px, sidebar berubah menjadi bar navigasi bawah, dan halaman kursi menumpuk denah di atas 3D.

Yang tidak diambil dari referensi: kartu promo langganan di sidebar (tidak ada produk langganan), lonceng notifikasi dan foto profil (tidak ada akun), confetti di halaman sukses.

## Tata letak mobile

Tata letak HP tetap seperti sekarang (tab bawah, stack). Yang ikut berubah: palet, aturan aksen, font, radius, dan status kursi di atas.

## Dial

Diturunkan dari referensi. Ubah kalau terasa tidak pas.

- ENERGY 3 dari 5: hero dan judul tebal memberi tenaga, sisanya tenang.
- RHYTHM 3 dari 5: seksi beranda tidak berpola sama. Hero penuh, rel poster, lalu blok yang komposisinya berbeda.
- MOTION 2 dari 5: transisi singkat untuk perubahan status (pilih kursi, ganti tab). Kamera 3D yang terbang ke kursi adalah satu-satunya gerak yang menonjol. Tidak ada animasi naik saat hover di semua kartu.

## Copy

- Bahasa Indonesia santai dan langsung, seperti teman yang mengajak nonton.
- Kalimat "lihat layar dari kursimu" dipakai sekali di beranda, tidak diulang di setiap seksi.
- Tombol menyebut tindakannya: "Pilih kursi", "Bayar Rp 170.000". Tidak memakai "Coba sekarang" atau panah dekoratif.
