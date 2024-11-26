import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();

router.get('/home', async (req, res) => {
  try {
    const joya = await Productos.aggregate([
      { $match: { category: "jewelery" } },
      {$addFields: {
        ratingPromedio: "$rating.rate" // Usa directamente el campo "rating.rate"
      }
      }
    ]);

    const electronica = await Productos.aggregate([
      { $match: { category: "electronics" } },
      {$addFields: {
        ratingPromedio: "$rating.rate" // Usa directamente el campo "rating.rate"
      }
      }
    ]);

    const ropaMujer = await Productos.aggregate([
      { $match: { category: "women's clothing" } },
      {$addFields: {
        ratingPromedio: "$rating.rate" // Usa directamente el campo "rating.rate"
      }
      }
    ]);

    const ropaHombre = await Productos.aggregate([
      { $match: { category: "men's clothing" } },
      {$addFields: {
        ratingPromedio: "$rating.rate" // Usa directamente el campo "rating.rate"
      }
      }
    ]);

    // Renderizar la vista principal con los productos destacados y sus ratings promedio
    res.render('home.html', { 
      joya: joya[0], 
      electronica: electronica[0], 
      ropaMujer: ropaMujer[0], 
      ropaHombre: ropaHombre[0] 
    });
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

// GET /producto/:id - Obtener detalles de un producto por ID
router.get("/producto/:id", async (req, res) => {
  try {
    const producto = await Productos.findById(req.params.id).lean(); // Obtiene el producto con su ID
    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }
    // Renderizar la vista del detalle del producto
    res.render("detalle-producto.html", { producto });
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).send("Error del servidor");
  }
});

// Ruta de detalle del producto
router.get('/categoria/:nombre', async (req, res) => {
  try {
    const nombreCategoria = req.params.nombre;

    const productos = await Productos.aggregate([
      { $match: { category: nombreCategoria } },
      {$addFields: {
        ratingPromedio: "$rating.rate" // Usa directamente el campo "rating.rate"
      }
      }
    ]);

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

router.get('/logout', (req, res) => {
  // Elimina la cookie 'access_token'
  res.clearCookie('access_token');

  // Redirige a la página de inicio de sesión
  res.render('logout.html', { usuario_autenticado: false, carrito: [] });
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