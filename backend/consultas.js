const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  allowExitOnIdle: true,
})

// Obtener todos los posts
const obtenerPosts = async () => {
  const { rows } = await pool.query('SELECT * FROM posts ORDER BY id DESC')
  console.log(rows);
  return rows
}

// Insertar un nuevo post
const agregarPost = async (titulo, img, descripcion, likes) => {
  const likesValue = likes ?? 0; // Si es null o undefined → 0
  const consulta = 'INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, $4) RETURNING *'
  const values = [titulo, img, descripcion, likesValue]
  const { rows } = await pool.query(consulta, values)
  console.log("Post agregado");
  return rows[0]
}

// Eliminar un post por ID
const eliminarPost = async (id) => {
  const consulta = 'DELETE FROM posts WHERE id = $1 RETURNING *'
  const values = [id]
  const { rows } = await pool.query(consulta, values)
  console.log("Post eliminado");
  return rows[0]
}

// consultas.js
const incrementarLike = async (id, delta = 1) => {
  const idNum = Number(id);
  const deltaNum = Number(delta);
  if (!Number.isInteger(idNum) || idNum <= 0) throw new Error('ID inválido');
  if (!Number.isInteger(deltaNum)) throw new Error('Delta inválido');

  // ATÓMICO: evita condiciones de carrera
  const consulta = 'UPDATE posts SET likes = COALESCE(likes,0) + $1 WHERE id = $2 RETURNING *';
  const values = [deltaNum, idNum];
  const { rows } = await pool.query(consulta, values);

  if (rows.length === 0) return null;
  console.log(`Likes incrementados para post ${idNum}: +${deltaNum} -> ${rows[0].likes}`);
  return rows[0];
};

// Exportar las funciones para usarlas en server.js
module.exports = { obtenerPosts, agregarPost, eliminarPost, incrementarLike  }