const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('./db'); // Mengimpor koneksi database dari db.js
const methodOverride = require('method-override');

// Inisialisasi Express
const app = express();
const port = process.env.PORT || 3000; // Menggunakan PORT dari .env atau default ke 3000

// Konfigurasi body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Gunakan methodOverride untuk menangani PUT dan DELETE menggunakan POST
app.use(methodOverride('_method'));

// Set view engine untuk EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Konfigurasi multer untuk menangani upload file
const storage = multer.memoryStorage(); // Menggunakan memoryStorage untuk menyimpan file di memory
const upload = multer({ storage: storage });

// Cek koneksi database
db.connect((err) => {
  if (err) {
    console.error('Gagal terhubung ke database:', err.stack);
    return;
  }
  console.log('Terhubung ke database MySQL.');
});

// Route untuk halaman utama yang menampilkan daftar pasien
app.get('/', (req, res) => {
  const query = 'SELECT * FROM pasien';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send('Terjadi kesalahan dalam mengambil data.');
    }

    // Mengkonversi buffer foto menjadi URL untuk ditampilkan
    result = result.map(pasien => {
      if (pasien.foto) {
        pasien.foto_url = 'data:image/jpeg;base64,' + pasien.foto.toString('base64');
      }
      return pasien;
    });

    // Merender halaman index.ejs dan mengirim data pasien ke tampilan
    res.render('index', { pasien: result });
  });
});

// Route untuk /get yang menampilkan data pasien dalam format JSON
app.get('/get', (req, res) => {
  const query = 'SELECT * FROM pasien';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send('Terjadi kesalahan dalam mengambil data.');
    }

    // Mengkonversi buffer foto menjadi URL untuk ditampilkan
    result = result.map(pasien => {
      if (pasien.foto) {
        pasien.foto_url = 'data:image/jpeg;base64,' + pasien.foto.toString('base64');
      }
      return pasien;
    });

    // Mengembalikan data pasien dalam format JSON
    res.json(result);
  });
});

// Route untuk menambah pasien (POST) dengan foto upload
app.post('/api/pasien', upload.single('foto'), (req, res) => {
  const { nama, alamat, keterangan } = req.body;
  const foto = req.file ? req.file.buffer : null; // Foto bisa null jika tidak ada file

  // Validasi input
  if (!nama || !alamat || !keterangan) {
    return res.status(400).json({ message: 'Semua field harus diisi!' });
  }

  const query = 'INSERT INTO pasien (nama, alamat, foto, keterangan) VALUES (?, ?, ?, ?)';
  db.query(query, [nama, alamat, foto, keterangan], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Terjadi kesalahan dalam menambah pasien.', error: err });
    }

    // Kirimkan respons sukses dalam format JSON
    return res.status(201).json({
      message: 'Data pasien berhasil ditambahkan.',
      data: {
        id: result.insertId, // Menyertakan ID pasien yang baru saja ditambahkan
        nama,
        alamat,
        keterangan,
        foto: foto ? 'Tersedia' : 'Tidak ada foto', // Menandakan status foto
      },
    });
  });
});

// Route untuk halaman edit pasien (GET)
app.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM pasien WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Terjadi kesalahan.' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Pasien tidak ditemukan.' });
    }

    // Mengkonversi buffer foto menjadi URL untuk ditampilkan
    if (result[0].foto) {
      result[0].foto_url = 'data:image/jpeg;base64,' + result[0].foto.toString('base64');
    }

    res.render('edit', { pasien: result[0] });
  });
});

// Route untuk mengupdate data pasien (PUT) dengan foto upload
app.put('/edit/:id', upload.single('foto'), (req, res) => {
  const { id } = req.params;
  const { nama, alamat, keterangan } = req.body;
  const foto = req.file ? req.file.buffer : null;

  if (!nama || !alamat || !keterangan) {
    return res.status(400).json({ message: 'Semua field harus diisi!' });
  }

  let query = 'UPDATE pasien SET nama = ?, alamat = ?, keterangan = ? WHERE id = ?';
  let params = [nama, alamat, keterangan, id];

  if (foto) {
    query = 'UPDATE pasien SET nama = ?, alamat = ?, foto = ?, keterangan = ? WHERE id = ?';
    params = [nama, alamat, foto, keterangan, id];
  }

  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Terjadi kesalahan dalam mengupdate pasien.', error: err });
    }

    res.status(200).json({
      message: 'Data pasien berhasil diupdate.',
      updatedData: {
        id,
        nama,
        alamat,
        keterangan,
        foto: foto ? 'Tersedia' : 'Tidak ada foto',
      },
    });
  });
});


// Route untuk menghapus pasien (DELETE)
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM pasien WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Terjadi kesalahan dalam menghapus pasien.' });
    }
    res.status(200).json({ message: 'Pasien berhasil dihapus.' });
  });
});

// Menjalankan server di port yang telah ditentukan di .env
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
