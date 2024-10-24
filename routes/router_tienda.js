import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();
      
// router.get('/home', async (req, res)=>{
//   try {
//     const productos = await Productos.find({})   // todos los productos
//     res.render('home.html', { productos })    // ../views/portada.html, 

//     //res.render('home.html',{p1,p2,p3})
//   } catch (err) {                                // se le pasa { productos:productos }
//     res.status(500).send({err})
//   }
// })

router.get('/home', async (req, res) => {
  try {
    // Obtener productos destacados

    const joya = await Productos.findOne({ category: "jewelery" }).lean();
    const electronica = await Productos.findOne({ category: "electronics" }).lean();
    const ropaMujer = await Productos.findOne({ category: "women's clothing" }).lean();
    const ropaHombre = await Productos.findOne({ category: "men's clothing" }).lean();

    res.render('home.html', { joya, electronica, ropaMujer, ropaHombre });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).send('Error del servidor');
  }
});

// ... más rutas aquí

export default router