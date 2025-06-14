// File: api/index.js

// Import library yang dibutuhkan (tetap sama)
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path'); // Tambahkan ini untuk path EJS

// Buat aplikasi express (tetap sama)
const app = express();

// Konfigurasi (tetap sama)
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 

// PENTING: Beritahu Express di mana folder 'views' berada
// Karena file ini sekarang ada di dalam folder /api, kita perlu menunjuk ke direktori utama
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

// Koneksi ke Database Supabase (tetap sama)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Rute Halaman Utama (Dashboard) - Tidak ada yang berubah di sini
app.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transaksi ORDER BY tanggal DESC');
    let pemasukan = 0, pengeluaran = 0;
    rows.forEach(row => {
      if (row.tipe === 'pemasukan') pemasukan += parseFloat(row.jumlah);
      else pengeluaran += parseFloat(row.jumlah);
    });
    const saldo = pemasukan - pengeluaran;
    res.render('index', { transaksi: rows, pemasukan, pengeluaran, saldo });
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan pada server.");
  }
});

// Rute untuk menambah transaksi baru - Tidak ada yang berubah di sini
app.post('/tambah', async (req, res) => {
  const { deskripsi, jumlah, tipe, tanggal } = req.body;
  try {
    await pool.query(
      'INSERT INTO transaksi (deskripsi, jumlah, tipe, tanggal) VALUES ($1, $2, $3, $4)',
      [deskripsi, jumlah, tipe, tanggal]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal menyimpan data.");
  }
});

// =========================================================
// PERUBAHAN UTAMA:
// Hapus baris app.listen() yang lama.
// Vercel akan menangani ini secara otomatis.

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server berjalan di http://localhost:${PORT}`);
// });
// =========================================================

// Ekspor aplikasi Express agar Vercel bisa menggunakannya
module.exports = app;