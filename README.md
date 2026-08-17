# 🗳️ Web Pemilu UKMR 2026

Sistem E-Voting berbasis web yang modern, aman, dan responsif untuk pemilihan umum Unit Kebudayaan Melayu Riau (UKMR) ITB 2026. Dibangun dengan arsitektur **Client-Server** yang memadukan antarmuka interaktif dengan keamanan enkripsi kata sandi dan transaksi database tingkat tinggi.

---

## Fitur Utama

### Pengguna (Mahasiswa / Pemilih)
* **Landing Page & Lini Masa**: Beranda informatif lengkap dengan profil acara, linimasa tahapan pemilu, dan navigasi dinamis.
* **Profil Kandidat**: Menampilkan profil lengkap, visi, misi, dan identitas para kandidat calon ketua.
* **Sistem Autentikasi Pemilih**: Login menggunakan **NIM** dan **Token/Password Rahasia** yang terenkripsi.
* **Bilik Suara (Voting Interaktif)**: Pemilihan kandidat secara langsung dengan perlindungan status pemilihan (*one-student-one-vote*).
* **Pengumuman Hasil Real-Time**: Animasi buka amplop interaktif dengan visualisasi persentase perolehan suara dinamis serta tombol unduh transparansi data (PDF).

### Admin / Panitia Pemilu
* **Autentikasi Terproteksi**: Rute login admin terpisah yang dilindungi oleh *Role-Based JWT Authorization*.
* **Dashboard Statistik Real-Time**: Visualisasi data pemilih dan perolehan suara kandidat menggunakan grafik interaktif (**Chart.js**).
* **Generasi Akun Massal**: Script otomatis untuk membuat password acak unik, meng-hash kata sandi, dan mengekspor data ke file CSV (*Data Admin & Import Supabase*).

---

## Arsitektur Keamanan

* **Bcrypt Password Hashing**: Kata sandi pemilih maupun admin diacak menggunakan algoritma `bcryptjs` sebelum disimpan ke database (tidak ada *plaintext*).
* **JWT (JSON Web Token)**: Sesi login menggunakan token JWT bertanda tangan digital dengan masa berlaku 2 jam.
* **Database Transactions (ACID)**: Proses pencoblosan suara menggunakan fitur `BEGIN - COMMIT - ROLLBACK` PostgreSQL untuk menjamin integritas suara dan mencegah manipulasi status pemilih.
* **Database Connection Pooling**: Terhubung ke database PostgreSQL via Supabase Connection Pooler untuk stabilitas dan performa optimal.

---

## 🎨 Palet Warna & Desain (*Mindful Palette No.202*)

| Elemen | Kode Hex |
| :--- | :--- |
| **Deep Indigo** (Background Utama / Navbar) | `#332277` |
| **Neon Lime** (Highlight / Aksen) | `#D8F878` |
| **Pink Pastel** (Active State / Button) | `#E47CB8` |
| **Purple Violet** (Border / Timeline) | `#9448B0` |
| **Off-White / Beige** (Card Background) | `#F0EFEB` |
| **Dark Navy** (Text Utama) | `#001C3D` |

---

## Struktur Folder

```text
pemilu-ukmr26/
├── backend/
│   ├── .env                    # Variabel environment (DB & JWT Secret)
│   ├── server.js               # Server utama Express.js & rute API
│   ├── generate-massal.js      # Script generator akun pemilih massal
│   ├── generate-hash.js        # Script pembuatan hash Bcrypt satuan
│   ├── package.json
│   └── node_modules/
├── frontend/
│   ├── images/                 # Aset logo, background, & foto kandidat
│   ├── docs/                   # Dokumen PDF transparansi pemilu
│   ├── index.html              # Halaman Beranda / Landing Page
│   ├── profil.html             # Halaman Profil Kandidat
│   ├── login.html              # Halaman Login Pemilih
│   ├── login.js                # Handler form login pemilih
│   ├── vote.html               # Halaman Bilik Suara
│   ├── vote.js                 # Handler pengambilan data kandidat & voting
│   ├── hasil.html              # Halaman Pengumuman Hasil Pemilu
│   ├── hasil.js                # Logika animasi amplop & fetch data hasil
│   ├── admin-login.html        # Halaman Login Panitia/Admin
│   ├── admin-login.js          # Handler login admin
│   ├── admin.html              # Halaman Dashboard Admin
│   └── admin.js                # Handler visualisasi Chart.js admin
└── README.md

# 🗄️ Skema Database (PostgreSQL / Supabase)

```sql
-- Tabel Admin
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- Tabel Pengguna (Pemilih)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nim VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    has_voted BOOLEAN DEFAULT FALSE
);

-- Tabel Kandidat
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    foto_url TEXT,
    visi TEXT
);

-- Tabel Suara Masuk (Votes)
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    candidate_id INT REFERENCES candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat
* Node.js (versi 16 atau lebih baru)
* Akun Supabase untuk database PostgreSQL
* Ekstensi browser / Live Server di VS Code

---

### 2. Konfigurasi Backend

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Instal semua dependensi:
   ```bash
   npm install express pg bcryptjs jsonwebtoken cors dotenv
   ```
3. Buat file `.env` di dalam folder `backend` dan isi kredensial berikut:
   ```env
   PORT=3000
   DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
   DB_USER=postgres.[PROJECT_ID]
   DB_PASSWORD=YOUR_DATABASE_PASSWORD
   DB_NAME=postgres
   DB_PORT=6543
   JWT_SECRET=secret
   ```
4. Jalankan server:
   ```bash
   node server.js
   ```
   *Server akan aktif di `http://localhost:3000`.*

---

### 3. Menjalankan Frontend

1. Buka folder proyek di **VS Code**.
2. Klik kanan pada file `frontend/index.html` dan pilih **Open with Live Server**.
3. Buka browser pada alamat lokal yang diberikan (contoh: `http://127.0.0.1:5500/index.html`).

---

## 👥 Kontributor & Hak Cipta

* **Divisi IT PEMILU UKMR 2026**
* Hak Cipta © 2026 Unit Kebudayaan Melayu Riau ITB. Seluruh hak cipta dilindungi undang-undang.
