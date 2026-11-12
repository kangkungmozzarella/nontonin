// Demo catalogue. Cities are real, cinemas and films are fictional.
import type { City } from "@api-hooks/cities/model";
import type { Cinema } from "@api-hooks/cinemas/model";
import type { Film } from "@api-hooks/films/model";
import type { Promo } from "@api-hooks/promos/model";

export const CITIES: City[] = [
  { id: "jakarta", name: "Jakarta", province: "DKI Jakarta", lat: -6.2088, lng: 106.8456 },
  { id: "bandung", name: "Bandung", province: "Jawa Barat", lat: -6.9175, lng: 107.6191 },
  { id: "surabaya", name: "Surabaya", province: "Jawa Timur", lat: -7.2575, lng: 112.7521 },
  { id: "yogyakarta", name: "Yogyakarta", province: "DI Yogyakarta", lat: -7.7956, lng: 110.3695 },
  { id: "semarang", name: "Semarang", province: "Jawa Tengah", lat: -6.9667, lng: 110.4167 },
  { id: "medan", name: "Medan", province: "Sumatera Utara", lat: 3.5952, lng: 98.6722 },
  { id: "banda-aceh", name: "Banda Aceh", province: "Aceh", lat: 5.5483, lng: 95.3238 },
  { id: "makassar", name: "Makassar", province: "Sulawesi Selatan", lat: -5.1477, lng: 119.4327 },
  { id: "denpasar", name: "Denpasar", province: "Bali", lat: -8.6705, lng: 115.2126 },
];

export const CINEMAS: Cinema[] = [
  { id: "senayan", cityId: "jakarta", name: "Nontonin Senayan", address: "Jl. Asia Afrika No. 8, Senayan", lat: -6.2251, lng: 106.799, tier: "premiere", studios: 6 },
  { id: "kemang", cityId: "jakarta", name: "Nontonin Kemang", address: "Jl. Kemang Raya No. 21", lat: -6.2607, lng: 106.8135, tier: "regular", studios: 4 },
  { id: "kelapa-gading", cityId: "jakarta", name: "Nontonin Kelapa Gading", address: "Jl. Boulevard Raya Blok M", lat: -6.1588, lng: 106.9057, tier: "regular", studios: 5 },
  { id: "puri", cityId: "jakarta", name: "Nontonin Puri", address: "Jl. Puri Indah Raya", lat: -6.1886, lng: 106.7389, tier: "regular", studios: 4 },
  { id: "dago", cityId: "bandung", name: "Nontonin Dago", address: "Jl. Ir. H. Juanda No. 113", lat: -6.8853, lng: 107.6135, tier: "premiere", studios: 4 },
  { id: "braga", cityId: "bandung", name: "Nontonin Braga", address: "Jl. Braga No. 52", lat: -6.9175, lng: 107.6094, tier: "regular", studios: 3 },
  { id: "pasteur", cityId: "bandung", name: "Nontonin Pasteur", address: "Jl. Dr. Djunjunan No. 77", lat: -6.8941, lng: 107.5807, tier: "regular", studios: 4 },
  { id: "tunjungan", cityId: "surabaya", name: "Nontonin Tunjungan", address: "Jl. Basuki Rahmat No. 8", lat: -7.2627, lng: 112.7387, tier: "premiere", studios: 6 },
  { id: "pakuwon", cityId: "surabaya", name: "Nontonin Pakuwon", address: "Jl. Puncak Indah Lontar No. 2", lat: -7.2894, lng: 112.6767, tier: "regular", studios: 5 },
  { id: "malioboro", cityId: "yogyakarta", name: "Nontonin Malioboro", address: "Jl. Malioboro No. 52", lat: -7.7926, lng: 110.3658, tier: "regular", studios: 4 },
  { id: "seturan", cityId: "yogyakarta", name: "Nontonin Seturan", address: "Jl. Seturan Raya No. 9", lat: -7.7681, lng: 110.41, tier: "premiere", studios: 3 },
  { id: "simpang-lima", cityId: "semarang", name: "Nontonin Simpang Lima", address: "Jl. Pahlawan No. 1", lat: -6.9903, lng: 110.4229, tier: "regular", studios: 5 },
  { id: "merdeka", cityId: "medan", name: "Nontonin Merdeka", address: "Jl. Balai Kota No. 3", lat: 3.5913, lng: 98.6779, tier: "premiere", studios: 4 },
  { id: "ringroad", cityId: "medan", name: "Nontonin Ringroad", address: "Jl. Gagak Hitam No. 48", lat: 3.577, lng: 98.626, tier: "regular", studios: 4 },
  { id: "baiturrahman", cityId: "banda-aceh", name: "Nontonin Baiturrahman", address: "Jl. Teuku Umar No. 12", lat: 5.5536, lng: 95.3175, tier: "regular", studios: 3 },
  { id: "losari", cityId: "makassar", name: "Nontonin Losari", address: "Jl. Penghibur No. 10", lat: -5.1435, lng: 119.4075, tier: "premiere", studios: 4 },
  { id: "sanur", cityId: "denpasar", name: "Nontonin Sanur", address: "Jl. Danau Tamblingan No. 80", lat: -8.688, lng: 115.262, tier: "regular", studios: 3 },
  { id: "kuta", cityId: "denpasar", name: "Nontonin Kuta", address: "Jl. Kartika Plaza No. 5", lat: -8.718, lng: 115.17, tier: "premiere", studios: 4 },
];

export const FILMS: Film[] = [
  {
    id: "lautan-pasir",
    title: "Lautan Pasir",
    status: "now",
    genres: ["adventure", "drama"],
    duration: 148,
    rating: "13+",
    director: "Raka Pradipta",
    cast: ["Ayu Laksmi", "Bima Arya", "Sekar Ningrum"],
    synopsis: {
      id: "Seorang kartografer menyeberangi gurun terluas di dunia untuk menemukan kota yang hilang dari setiap peta, sebelum badai musim kering menutup jalan pulangnya.",
      en: "A cartographer crosses the world's widest desert to find a city erased from every map, before the dry-season storms close the only way home.",
    },
    score: 8.6,
  },
  {
    id: "gema-malam",
    title: "Gema Malam",
    status: "now",
    genres: ["thriller", "crime"],
    duration: 121,
    rating: "17+",
    director: "Nadia Halim",
    cast: ["Reza Mahendra", "Laras Wening"],
    synopsis: {
      id: "Penyiar radio tengah malam menerima telepon yang menggambarkan kejahatan sebelum terjadi. Dia punya waktu sampai fajar untuk menemukan si penelepon.",
      en: "A late-night radio host gets calls describing crimes before they happen. She has until dawn to find the caller.",
    },
    score: 8.1,
  },
  {
    id: "arus-biru",
    title: "Arus Biru",
    status: "now",
    genres: ["adventure", "family"],
    duration: 112,
    rating: "SU",
    director: "Yudha Saputra",
    cast: ["Dimas Anggara", "Kirana Putri", "Pak Lukman"],
    synopsis: {
      id: "Kakak beradik dari kampung nelayan berlayar mengikuti arus misterius yang konon membawa siapa pun ke pulau tempat ayah mereka terakhir terlihat.",
      en: "Two siblings from a fishing village follow a mysterious current said to carry sailors to the island where their father was last seen.",
    },
    score: 7.8,
  },
  {
    id: "rumah-kabut",
    title: "Rumah di Ujung Kabut",
    status: "now",
    genres: ["horror"],
    duration: 104,
    rating: "17+",
    director: "Sari Wulandari",
    cast: ["Tika Rahma", "Gilang Permana"],
    synopsis: {
      id: "Keluarga muda pindah ke rumah warisan di lereng gunung. Setiap malam kabut turun, satu lampu di loteng menyala sendiri.",
      en: "A young family moves into an inherited house on a mountain slope. Every night the fog rolls in, one attic light turns itself on.",
    },
    score: 7.4,
  },
  {
    id: "orbit-terakhir",
    title: "Orbit Terakhir",
    status: "soon",
    releaseDate: "2026-12-10",
    genres: ["sci-fi", "drama"],
    duration: 139,
    rating: "13+",
    director: "Andika Wirawan",
    cast: ["Maya Sasmita", "Teguh Santoso"],
    synopsis: {
      id: "Astronaut terakhir di stasiun riset harus memilih: menyelamatkan data yang bisa menolong Bumi, atau bahan bakar untuk pulang.",
      en: "The last astronaut aboard a research station must choose between the data that could save Earth and the fuel to get home.",
    },
    score: null,
  },
  {
    id: "senja-kota-tua",
    title: "Senja di Kota Tua",
    status: "soon",
    releaseDate: "2026-12-24",
    genres: ["romance", "drama"],
    duration: 117,
    rating: "13+",
    director: "Intan Maharani",
    cast: ["Arya Wicaksana", "Dewi Kinanti"],
    synopsis: {
      id: "Dua orang asing bertemu setiap senja di menara jam yang sama selama satu musim, tanpa pernah menanyakan nama satu sama lain.",
      en: "Two strangers meet at the same clock tower every dusk for a season, without ever asking each other's name.",
    },
    score: null,
  },
];

export const PROMOS: Promo[] = [
  {
    id: "promo-3d-seat",
    filmId: "lautan-pasir",
    kind: "feature",
    title: { id: "Lihat layar dari kursimu", en: "See the screen from your seat" },
    subtitle: { id: "Pratinjau 3D sebelum kamu pesan", en: "3D preview before you book" },
  },
  {
    id: "promo-weekday",
    filmId: "gema-malam",
    kind: "discount",
    title: { id: "Senin–Kamis hemat 20%", en: "Mon–Thu, 20% off" },
    subtitle: { id: "Untuk semua film di Nontonin Regular", en: "On every film at Nontonin Regular" },
  },
  {
    id: "promo-premiere",
    filmId: "orbit-terakhir",
    kind: "premiere",
    title: { id: "Orbit Terakhir · 10 Des", en: "Orbit Terakhir · Dec 10" },
    subtitle: { id: "Pre-sale dibuka minggu depan", en: "Pre-sale opens next week" },
  },
];

// Ticket price per seat type, before the weekday discount
export const PRICE = {
  regular: { std: 45000, rec: 80000 },
  premiere: { std: 60000, rec: 95000 },
} as const;
