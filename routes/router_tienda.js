import express from "express";
import Productos from "../model/productos.js";
import Ratings from "../model/ratings.js";
import { ObjectId } from "mongodb";
const router = express.Router();


router.get('/home', async (req, res) => {
  try {
    const joya = await Productos.aggregate([
      { $match: { category: "jewelery" } },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'productId',
          as: 'ratingData'
        }
      },
      {
        $addFields: {
          ratingPromedio: { $avg: "$ratingData.rate" } // Calcula el promedio de rating directamente desde la colección ratings
        }
      }
    ]);

    const electronica = await Productos.aggregate([
      { $match: { category: "electronics" } },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'productId',
          as: 'ratingData'
        }
      },
      {
        $addFields: {
          ratingPromedio: { $avg: "$ratingData.rate" } // Calcula el promedio de rating directamente desde la colección ratings
        }
      }
    ]);

    const ropaMujer = await Productos.aggregate([
      { $match: { category: "women's clothing" } },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'productId',
          as: 'ratingData'
        }
      },
      {
        $addFields: {
          ratingPromedio: { $avg: "$ratingData.rate" } // Calcula el promedio de rating directamente desde la colección ratings
        }
      }
    ]);

    const ropaHombre = await Productos.aggregate([
      { $match: { category: "men's clothing" } },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'productId',
          as: 'ratingData'
        }
      },
      {
        $addFields: {
          ratingPromedio: { $avg: "$ratingData.rate" } // Calcula el promedio de rating directamente desde la colección ratings
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
    const producto = await Productos.findById(req.params.id).lean();
    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }

    // Obtener los ratings del producto desde la colección de ratings
    const ratingsResult = await Ratings.aggregate([
      { $match: { productId: producto._id } },
      {
        $group: {
          _id: "$productId",
          promedio: { $avg: "$rate" },
          totalVotos: { $sum: 1 },
        },
      },
    ]);

    // Si hay datos en los ratings, actualiza el campo `rating` directamente
    if (ratingsResult.length > 0) {
      const rating = ratingsResult[0];
      producto.rating = {
        rate: rating.promedio,
        count: rating.totalVotos,
      };
    } else {
      producto.rating = { rate: 0, count: 0 };
    }

    // Verificar usuario
    const user = req.username; // Ajustar según tu lógica de usuario
    if (!user || !user._id) {
      producto.myRating = -1;
    } else {
      const myRating = await Ratings.findOne({
        productId: producto._id,
        userId: new ObjectId(user._id),
      });
      producto.myRating = myRating ? myRating.rate : -1;
    }

    console.log('producto', producto);

    // Renderizar vista
    res.render("detalle-producto.html", { producto });
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).send("Error del servidor");
  }
});

router.get('/categoria/:nombre', async (req, res) => {
  try {
    const nombreCategoria = req.params.nombre;

    const productos = await Productos.aggregate([
      { $match: { category: nombreCategoria } },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'productId',
          as: 'ratingData'
        }
      },
      {
        $addFields: {
          ratingPromedio: { $avg: "$ratingData.rate" }, // Calcula el promedio de rating directamente desde la colección ratings
          totalVotos: { $sum: "$ratingData.count" } // Calcula la cantidad total de votos para el producto
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