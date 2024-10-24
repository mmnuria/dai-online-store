import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();
      
router.get('/home', async (req, res)=>{
  try {
    const productos = await Productos.find({})   // todos los productos
    res.render('home.html', { productos })    // ../views/portada.html, 

    //res.render('home.html',{p1,p2,p3})
  } catch (err) {                                // se le pasa { productos:productos }
    res.status(500).send({err})
  }
})

// ... más rutas aquí

export default router