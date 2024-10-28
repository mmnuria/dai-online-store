import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();

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

// Ruta de búsqueda
router.get('/buscar', async (req, res) => {
  try {
      const busqueda = req.query.q;
      const productos = await Productos.find({
          $or: [
              { title: { $regex: busqueda, $options: 'i' } },
              { description: { $regex: busqueda, $options: 'i' } }
          ]
      });
      res.render('busqueda.html', { productos, busqueda });
  } catch (error) {
      console.error('Error en la búsqueda:', error);
      res.status(500).send('Error del servidor');
  }
});

// Ruta de detalle del producto
router.get('/producto/:id', async (req, res) => {
  try {
      const producto = await Productos.findById(req.params.id);
      res.render('detalle-producto.html', { producto });
  } catch (error) {
      console.error('Error al obtener el producto:', error);
      res.status(500).send('Error del servidor');
  }
});

// Ruta para obtener productos por categoría
router.get('/categoria/:nombre', async (req, res) => {
  try {
      const nombreCategoria = req.params.nombre;
      const productos = await Productos.find({ category: nombreCategoria });
      res.render('categoria.html', { productos, nombreCategoria });
  } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      res.status(500).send('Error del servidor');
  }
});

// Ruta para añadir al carrito
router.post('/anadir-al-carrito', async (req, res) => {
  try {

      // Busca el producto por ID
      const producto = await Productos.findById(req.body.productoId);
      if (!producto) {
          return res.status(404).send('Producto no encontrado');
      }

      // Añade el producto al carrito en la sesión
      req.session.carrito.push({
          id: producto._id,
          title: producto.title, // Cambiado a title en lugar de nombre para que coincida con la clave en la vista
          price: producto.price,
          image: producto.image
      });

      // Redirige a la página del carrito después de añadir el producto
      res.redirect('/carrito'); 
  } catch (error) {
      console.error('Error al añadir al carrito:', error);
      res.status(500).send('Error del servidor');
  }
});



router.get('/carrito', (req, res) => {
  const carrito = req.session.carrito || [];
  // Calcular el total del carrito
  const total = carrito.reduce((acc, item) => acc + item.price, 0).toFixed(2);
  res.render('carrito.html', { carrito, total });
});

router.post('/eliminar-del-carrito', (req, res) => {
  const productoId = req.body.productoId;

  if (req.session.carrito) {
      req.session.carrito = req.session.carrito.filter(item => item.id !== productoId);
  }

  res.redirect('/carrito'); // Redirige de vuelta al carrito
});

export default router