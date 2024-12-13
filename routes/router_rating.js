import express from "express";
import Rating from "../model/ratings.js";
import { ObjectId } from "mongodb";

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

// GET /api/ratings/:id - Obtener un rating por ID
router.get('/:id', async (req, res) => {
  try {
      const ratingData = await Rating.find({ productId: req.params.id }); // Supongamos que 'Rating' es tu modelo
      res.json(ratingData);
  } catch (err) {
      console.error('Error obteniendo el rating:', err);
      res.status(500).json({ error: 'Error al obtener rating y reseñas.' });
  }
});


// PUT /api/ratings/:id - Modificar un rating por ID
router.put("/:id", async (req, res) => {
  const { newRate } = req.body;
  const productId = req.params.id;

  if (newRate < 1 || newRate > 5) {
    return res.status(400).json({ error: "La calificación debe estar entre 1 y 5" });
  }  

  try {
    let existingRating = await Rating.findOne({ productId: new ObjectId(productId) });
    if (existingRating) {
      existingRating.rate = newRate;

      await existingRating.save();
    } else {
      existingRating = await Rating.create({
        productId: new ObjectId(productId),
        userId: new ObjectId(req.username._id),
        rate: newRate
      })
    }

    res.json(existingRating);
  } catch (err) {
    console.error("Error al modificar el rating:", err);
    res.status(500).json({ error: "Error al modificar el rating" });
  }
});

export default router;
