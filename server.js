const express = require('express');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Set your MySQL root password here
  database: 'bazar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Serve existing HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get(['/inventario', '/inventario.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'inventario.html'));
});
app.get(['/compra', '/compra.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'compra.html'));
});
app.get(['/informe', '/informe.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'informe.html'));
});
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// CRUD Handlers for producto table

// Create producto
app.post('/api/producto', async (req, res) => {
  const { nombre, cantidad, precio } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO producto (nombre, cantidad, precio) VALUES (?, ?, ?)',
      [nombre, cantidad, precio]
    );
    res.status(201).json({ id: result.insertId, nombre, cantidad, precio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read all productos
app.get('/api/producto', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM producto');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read one producto by id
app.get('/api/producto/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM producto WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update producto by id
app.put('/api/producto/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad, precio } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE producto SET nombre = ?, cantidad = ?, precio = ? WHERE id = ?',
      [nombre, cantidad, precio, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ id, nombre, cantidad, precio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete producto by id
app.delete('/api/producto/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM producto WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image upload endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const inputPath = req.file.path;
  const outputPath = path.join(path.dirname(inputPath), 'resized-' + req.file.filename);

  try {
    // Resize image to max width 800px
    await sharp(inputPath)
      .resize({ width: 800, withoutEnlargement: true })
      .toFile(outputPath);

    // Optionally delete original file
    fs.unlinkSync(inputPath);

    res.json({ message: 'Image uploaded and resized', filename: 'resized-' + req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Image processing failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
