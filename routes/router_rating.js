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

// GET /api/ratings/:id - Obtener un rating por ID
router.get("/:id", async (req, res) => {
    try {
      const rating = await Rating.findById(req.params.id);
      if (!rating) return res.status(404).json({ error: "Rating no encontrado" });
  
      res.json(rating);
    } catch (err) {
      console.error("Error al obtener el rating:", err);
      res.status(500).json({ error: "Error al obtener el rating" });
    }
  });  

// PUT /api/ratings/:id - Modificar un rating por ID
router.put("/:id", async (req, res) => {
    const { newRate } = req.body;
  
    if (newRate < 0 || newRate > 5) {
      return res.status(400).json({ error: "El rating debe estar entre 0 y 5" });
    }
  
    try {
      const existingRating = await Rating.findById(req.params.id);
      if (!existingRating) return res.status(404).json({ error: "Rating no encontrado" });
  
      existingRating.rate = newRate;
  
      await existingRating.save();
      res.json(existingRating);
    } catch (err) {
      console.error("Error al modificar el rating:", err);
      res.status(500).json({ error: "Error al modificar el rating" });
    }
  });  

export default router;
