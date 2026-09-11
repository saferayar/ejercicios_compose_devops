const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la conexión mediante variables de entorno
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'testdb',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    // Crear tabla de ejemplo si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        text VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Conexión con MySQL exitosa y tabla verificada.');
  } catch (err) {
    console.error('Error conectando a MySQL:', err.message);
  }
}

app.use(express.json());

// Endpoint de estado / salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    env: process.env.NODE_ENV || 'development',
    hostname: process.env.HOSTNAME || 'unknown'
  });
});

// Listar registros
app.get('/items', async (req, res) => {
  try {
    if (!pool) pool = mysql.createPool(dbConfig);
    const [rows] = await pool.query('SELECT * FROM messages ORDER BY id DESC');
    res.json({
      environment: process.env.NODE_ENV || 'development',
      serverHost: process.env.HOSTNAME || 'localhost',
      data: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insertar un registro
app.post('/items', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'El campo "text" es requerido.' });
  }

  try {
    if (!pool) pool = mysql.createPool(dbConfig);
    const [result] = await pool.query('INSERT INTO messages (text) VALUES (?)', [text]);
    res.status(201).json({
      id: result.insertId,
      text,
      message: 'Registro insertado exitosamente',
      handledBy: process.env.HOSTNAME || 'localhost'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Node API escuchando en el puerto ${PORT} [Env: ${process.env.NODE_ENV || 'development'}]`);
  await initDB();
});
