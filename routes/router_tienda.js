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

      // Verificar si el campo de búsqueda está vacío
      if (!busqueda || busqueda.trim() === "") {
        return res.render('busqueda.html', { productos: [], busqueda: "", mensaje: "Introduce un término para buscar." });
    }
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
      const producto = await Productos.findById(req.body.productoId);
      if (!producto) {
          return res.status(404).send('Producto no encontrado');
      }

      // Carrito existe en la sesión
      if (!req.session.carrito) {
        req.session.carrito = [];
      }

      req.session.carrito.push({
          id: producto._id,
          title: producto.title,
          price: producto.price,
          image: producto.image
      });

      res.redirect('/carrito'); 
  } catch (error) {
      console.error('Error al añadir al carrito:', error);
      res.status(500).send('Error del servidor');
  }
});

router.get('/carrito', (req, res) => {
  const carrito = req.session.carrito || [];
  
  const total = carrito.reduce((acc, item) => acc + item.price, 0).toFixed(2);
  res.render('carrito.html', { carrito, total });
});

router.post('/eliminar-del-carrito', (req, res) => {
  const productoId = req.body.productoId;

  if (req.session.carrito) {
      req.session.carrito = req.session.carrito.filter(item => item.id !== productoId);
  }

  res.redirect('/carrito');
});
router.get('/producto/editar/:id', async (req, res) => {
  try {
      const producto = await Productos.findById(req.params.id);
      res.render('editar_producto.html', { producto });
  } catch (error) {
      console.error('Error al cargar el producto:', error);
      res.status(500).send('Error al cargar el producto');
  }
});

router.post('/producto/editar/:id', async (req, res) => {
  const { title, price } = req.body;
  try {
      await Productos.findByIdAndUpdate(req.params.id, { title, price }, {
        new: true,
        runValidators: true
      });
      res.redirect('/home');
  } catch (error) {
    if (error.message && error.message.includes('mayúscula')) {
      return res.status(400).send(error.message);
    }
    console.error('Error al actualizar el producto:', error);
    res.status(500).send('Error al actualizar el producto');
  } 
});

export default router