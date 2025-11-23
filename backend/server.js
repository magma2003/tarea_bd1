require('dotenv').config()
const { obtenerPosts, agregarPost, eliminarPost, incrementarLike  } = require('./consultas')

const express = require('express')
const cors = require('cors') 
const app = express()
const fs = require('fs')
const PORT = process.env.PORT || 3000

//Habilita CORS para todas las rutas
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor LikeMe funcionando ✅");
})

//GET - obtener posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await obtenerPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

//POST - agregar post
app.post('/posts', async (req, res) => {
  try {
    const { titulo, img, url, descripcion, likes } = req.body

    // Usa img si existe, sino usa url
    const imagen = img || url
    const nuevoPost = await agregarPost(titulo, imagen, descripcion, likes);
    res.status(201).json(nuevoPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

//DELETE - eliminar post
app.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const postEliminado = await eliminarPost(id);
    if (postEliminado) {
      res.json(postEliminado);
    } else {
      res.status(404).json({ error: "Post no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//PUT - actualizar likes
app.put('/posts/:id/likes', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "ID inválido" });

    const postActualizado = await incrementarLike(id, 1); // siempre sumar 1

    if (postActualizado) {
      res.json(postActualizado);
    } else {
      res.status(404).json({ error: "Post no encontrado" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



app.listen(PORT, () => console.log(`¡Servidor encendido! en http://localhost:${PORT}/`));
