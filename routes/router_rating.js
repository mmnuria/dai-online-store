import express from "express";
import Rating from "../model/ratings.js";

const router = express.Router();

// GET /api/ratings - Obtener todos los ratings con paginación
router.get("/", async (req, res) => {
    const { desde = 0, hasta = 10 } = req.query;
    try {
      const ratings = await Rating.find()
        .skip(parseInt(desde))
        .limit(parseInt(hasta) - parseInt(desde) + 1);
  
      res.json(ratings);
    } catch (err) {
      console.error("Error al obtener los ratings:", err);
      res.status(500).json({ error: "Error al obtener los ratings" });
    }
  });  

// // GET /api/ratings/:id - Obtener un rating por ID
router.get('/:id', async (req, res) => {
  try {
      const ratingData = await Rating.find({ productId: req.params.id }); // Supongamos que 'Rating' es tu modelo
      res.json(ratingData);
  } catch (err) {
      console.error('Error obteniendo el rating:', err);
      res.status(500).json({ error: 'Error al obtener rating y reseñas.' });
  }
});


// // PUT /api/ratings/:id - Modificar un rating por ID
router.put("/:id", async (req, res) => {
  const { newRate } = req.body;
  const productId = req.params.id;

  if (newRate < 1 || newRate > 5) {
    return res.status(400).json({ error: "La calificación debe estar entre 1 y 5" });
  }  

  try {
    const existingRating = await Rating.findOne({ productId: productId });
    if (!existingRating) return res.status(404).json({ error: "Rating no encontrado" });

    existingRating.rate = newRate;

    await existingRating.save();
    res.json(existingRating);
  } catch (err) {
    console.error("Error al modificar el rating:", err);
    res.status(500).json({ error: "Error al modificar el rating" });
  }
});

// Ruta para agregar reseña
router.post('/api/ratings/:productId/review', async (req, res) => {
  const { comment, rating } = req.body;
  const productId = req.params.productId;
  
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La calificación debe estar entre 0 y 5.' });
  }

  // Crear una nueva reseña y agregarla al producto
  const newRating = new Rating({
    productId,
    rate: rating,
    comment
  });

  try {
    // Guardar la calificación
    await newRating.save();

    // Actualizar el rating promedio en el producto
    const producto = await Productos.findById(productId);
    producto.reviews.push({ rating, comment }); // Agregar la reseña al producto
    await producto.save();

    // Actualizar el rating promedio en Rating
    await newRating.updateRating(rating);

    res.status(201).json({ message: 'Reseña agregada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar la reseña.' });
  }
});

export default router;
