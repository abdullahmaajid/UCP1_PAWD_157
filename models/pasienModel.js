const db = require('../db');

// Mendapatkan semua data pasien
exports.getAllPasien = (req, res) => {
  const query = 'SELECT * FROM pasien';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Menambahkan pasien baru
exports.addPasien = (req, res) => {
  const { nama, alamat, keterangan } = req.body;
  const foto = req.file ? req.file.buffer : null; // Mengambil foto dari request (file buffer)

  if (!nama || !alamat || !keterangan || !foto) {
    return res.status(400).json({ error: 'Semua field harus diisi, termasuk foto!' });
  }

  const query = 'INSERT INTO pasien (nama, alamat, foto, keterangan) VALUES (?, ?, ?, ?)';
  db.query(query, [nama, alamat, foto, keterangan], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Pasien berhasil ditambahkan', id: result.insertId });
  });
};

// Mendapatkan data pasien berdasarkan ID
exports.getPasienById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM pasien WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Pasien tidak ditemukan' });
    }
    res.json(result[0]);
  });
};

// Menghapus data pasien
exports.deletePasien = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM pasien WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Pasien berhasil dihapus' });
  });
};

// Mengupdate data pasien
exports.updatePasien = (req, res) => {
  const { id } = req.params;
  const { nama, alamat, keterangan } = req.body;
  const foto = req.file ? req.file.buffer : null; // Mengambil foto dari request (file buffer)

  let query = 'UPDATE pasien SET nama = ?, alamat = ?, keterangan = ? WHERE id = ?';
  let params = [nama, alamat, keterangan, id];

  if (foto) {
    query = 'UPDATE pasien SET nama = ?, alamat = ?, foto = ?, keterangan = ? WHERE id = ?';
    params = [nama, alamat, foto, keterangan, id];
  }

  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Pasien berhasil diperbarui' });
  });
};
