require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. KONEKSI POSTGRESQL (SUPABASE)
// ==========================================
const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS, // Pastikan di .env namanya DB_PASSWORD
  database: process.env.DB_DATABASE,     // Pastikan di .env namanya DB_NAME
  port: process.env.DB_PORT || 6543, // Gunakan port 6543 untuk Transaction Pooler
  ssl: { rejectUnauthorized: false }
});

// ==========================================
// 2. MIDDLEWARE AUTENTIKASI
// ==========================================
function auth(req, res, next) {
  const bearer = req.headers.authorization;
  if (!bearer) return res.status(401).json({ message: 'Token hilang atau tidak disertakan' });
  
  const token = bearer.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak: Hanya untuk admin' });
  }
  next();
}

// ==========================================
// 3. ENDPOINT LOGIN USER (MAHASISWA)
// ==========================================
app.post('/api/login', async (req, res) => {
    const { nim, password } = req.body;
    try {
        // 1. Cari user di Supabase
        const result = await db.query('SELECT * FROM users WHERE nim = $1', [nim]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'NIM tidak ditemukan' });
        }

        const user = result.rows[0];

        // 2. Cocokkan password dengan hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        // Debugging ke terminal
        console.log("NIM:", nim);
        console.log("Hasil perbandingan Hash:", isMatch);

        // 3. Jika salah, tolak!
        if (!isMatch) {
            return res.status(401).json({ message: 'Password salah' });
        }

        // 4. JIKA BENAR, BUAT TOKEN (Bagian ini yang mungkin hilang di kode Anda)
        const token = jwt.sign(
            { id: user.id, role: 'user' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );

        // 5. Kirim token ke browser agar bisa pindah halaman
        res.json({ token });

    } catch (err) {
        console.error("Error saat login:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==========================================
// 4. ENDPOINT LOGIN ADMIN
// ==========================================
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Username tidak ditemukan' });
        }

        const admin = result.rows[0];

        // 1. KITA CETAK DULU ISI DATABASE-NYA KE TERMINAL
        console.log("Data admin dari DB:", admin);

        // 2. PASTIKAN NAMA KOLOMNYA BENAR
        // Jika di console.log terminal nama kolom sandinya 'password', maka gunakan admin.password
        // Jika namanya 'password_hash', maka gunakan admin.password_hash
        // Silakan sesuaikan baris di bawah ini dengan nama kolom di database Anda:
        const hashDariDatabase = admin.password_hash; // <--- CEK BAGIAN INI

        // 3. BANDINGKAN
        const isMatch = await bcrypt.compare(password, hashDariDatabase);
        
        console.log("Hasil pencocokan sandi Admin:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: 'Password salah' });
        }

        // 4. BUAT TIKET/TOKEN JIKA SUKSES
        const token = jwt.sign(
            { id: admin.id, role: 'admin' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.json({ token });

    } catch (err) {
        console.error("Error Login Admin:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==========================================
// 5. ENDPOINT DATA KANDIDAT & VOTING
// ==========================================
app.get('/api/candidates', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT id, nama, foto_url, visi FROM candidates');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/vote', auth, async (req, res) => {
  // 1. Ambil candidate_id dari request body (tangkap versi tanpa 's' MAUPUN pake 's')
  const rawCandidateId = req.body.candidate_id || req.body.candidates_id;
  const candidateId = parseInt(rawCandidateId, 10);
  const userId = req.user.id;

  // Validasi jika candidate_id tidak terisi/NaN
  if (!candidateId || isNaN(candidateId)) {
    console.error("Gagal Vote: candidate_id bernilai invalid:", req.body);
    return res.status(400).json({ message: 'Kandidat tidak valid' });
  }

  try {
    // 2. Cek status vote SEKALIGUS ambil nilai 'bobot' user dari tabel users
    const userCheck = await db.query('SELECT has_voted, bobot FROM users WHERE id = $1', [userId]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    if (userCheck.rows[0].has_voted) {
      return res.status(400).json({ message: 'Anda sudah pernah memilih!' });
    }

    // Ambil nilai bobot user (jika null di DB, set default ke 0.25)
    const userBobot = parseFloat(userCheck.rows[0].bobot) || 0.25;

    // 3. Masukkan ke tabel votes (simpan user_id, candidates_id, dan bobot suara)
    await db.query(
      'INSERT INTO votes (user_id, candidates_id, bobot) VALUES ($1, $2, $3)',
      [userId, candidateId, userBobot]
    );

    // 4. Tandai user sudah memilih
    await db.query('UPDATE users SET has_voted = true WHERE id = $1', [userId]);

    res.json({ message: 'Voting berhasil!' });
  } catch (err) {
    console.error("Error pada Endpoint Vote:", err);
    res.status(500).json({ message: 'Gagal menyimpan suara' });
  }
});

// ==========================================
// 6. ENDPOINT STATISTIK (DASHBOARD & HASIL)
// ==========================================
// Catatan: Endpoint ini bisa diakses secara publik atau dilindungi tergantung kebutuhan.
// Jika file hasil.html bersifat publik, hapus middleware `auth` dan `adminOnly`.
app.get('/api/admin/stats', async (req, res) => {
  try {
    // 1. Ambil Total Pemilih & Sudah Memilih
    const userStats = await db.query(`
      SELECT 
        COUNT(*) AS total_pemilih,
        COUNT(CASE WHEN has_voted = true THEN 1 END) AS sudah_memilih
      FROM users
    `);

    // 2. Ambil Suara per Kandidat (Query Aman & Standar)
    const candidateStats = await db.query(`
      SELECT 
        c.id, 
        c.nama, 
        COUNT(v.id)::int AS suara
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidates_id
      GROUP BY c.id, c.nama
      ORDER BY c.id ASC
    `);

    const totalPemilih = parseInt(userStats.rows[0].total_pemilih, 10) || 0;
    const sudahMemilih = parseInt(userStats.rows[0].sudah_memilih, 10) || 0;

    res.json({
      total_pemilih: totalPemilih,
      sudah_memilih: sudahMemilih,
      kandidat: candidateStats.rows
    });

  } catch (err) {
    console.error("Error stats:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint publik untuk halaman Hasil Pemilu
app.get('/api/public/results', async (req, res) => {
  try {
    // 1. Total nilai bobot suara yang masuk
    const totalRes = await db.query('SELECT COALESCE(SUM(bobot), 0)::float AS total_nilai FROM votes');
    const totalNilaiSuara = parseFloat(totalRes.rows[0].total_nilai) || 0;

    // 2. Total nilai bobot per kandidat
    const candidateRes = await db.query(`
      SELECT 
        c.id, 
        c.nama, 
        COALESCE(SUM(v.bobot), 0)::float AS total_bobot
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidates_id
      GROUP BY c.id, c.nama
      ORDER BY c.id ASC
    `);

    res.json({
      total_suara: totalNilaiSuara, // Menghasilkan misal: 125.75
      kandidat: candidateRes.rows   // Menghasilkan misal: Khairul 80.5, Kotak Kosong 45.25
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error server' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

module.exports = app;