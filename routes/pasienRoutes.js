const express = require('express');
const multer = require('multer');
const router = express.Router();
const pasienController = require('../models/pasienModel');

// Konfigurasi multer untuk upload gambar
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Mendapatkan semua data pasien
router.get('/', (req, res) => {
  console.log('GET /api/pasien dipanggil');
  pasienController.getAllPasien(req, res);
});

// Menambahkan data pasien (dengan foto)
router.post('/', upload.single('foto'), (req, res) => {
  console.log('POST /api/pasien dipanggil');
  pasienController.addPasien(req, res);
});

// Mendapatkan satu data pasien berdasarkan ID
router.get('/:id', (req, res) => {
  console.log(`GET /api/pasien/${req.params.id} dipanggil`);
  pasienController.getPasienById(req, res);
});

// Menghapus data pasien
router.delete('/:id', (req, res) => {
  console.log(`DELETE /api/pasien/${req.params.id} dipanggil`);
  pasienController.deletePasien(req, res);
});

// Mengupdate data pasien (dengan foto)
router.put('/:id', upload.single('foto'), (req, res) => {
  console.log(`PUT /api/pasien/${req.params.id} dipanggil`);
  pasienController.updatePasien(req, res);
});

module.exports = router;
