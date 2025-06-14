// Import library yang dibutuhkan
require('dotenv').config(); // Untuk membaca file .env
const express = require('express');
const { Pool } = require('pg');

// Buat aplikasi express
const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi untuk membaca data dari form
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Untuk file CSS & JS statis
app.set('view engine', 'ejs'); // Menggunakan EJS sebagai view engine

// Koneksi ke Database Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Halaman Utama (Dashboard)
app.get('/', async (req, res) => {
  try {
    // Ambil data transaksi dari database
    const { rows } = await pool.query('SELECT * FROM transaksi ORDER BY tanggal DESC');
    
    // Hitung total pemasukan, pengeluaran, dan saldo
    let pemasukan = 0;
    let pengeluaran = 0;
    rows.forEach(row => {
      if (row.tipe === 'pemasukan') {
        pemasukan += parseFloat(row.jumlah);
      } else {
        pengeluaran += parseFloat(row.jumlah);
      }
    });
    const saldo = pemasukan - pengeluaran;

    // Tampilkan halaman dengan data
    res.render('index', { transaksi: rows, pemasukan, pengeluaran, saldo });
  } catch (err) {
    console.error(err);
    res.send("Terjadi kesalahan saat mengambil data.");
  }
});

// Rute untuk menambah transaksi baru
app.post('/tambah', async (req, res) => {
  const { deskripsi, jumlah, tipe, tanggal } = req.body;
  try {
    await pool.query(
      'INSERT INTO transaksi (deskripsi, jumlah, tipe, tanggal) VALUES ($1, $2, $3, $4)',
      [deskripsi, jumlah, tipe, tanggal]
    );
    res.redirect('/'); // Kembali ke halaman utama
  } catch (err) {
    console.error(err);
    res.send("Gagal menyimpan data.");
  }
});


// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});