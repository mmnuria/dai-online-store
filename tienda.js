import express   from "express"
import nunjucks  from "nunjucks"
import session from "express-session"
      
import connectDB from "./model/db.js"
connectDB()

const app = express()

const IN = process.env.IN || 'development'

nunjucks.configure('views', {         // directorio 'views' para las plantillas html
	autoescape: true,
	noCache:    IN == 'development',   // true para desarrollo, sin cache
	watch:      IN == 'development',   // reinicio con Ctrl-S
	express: app
})
app.set('view engine', 'html')

app.use(express.static('public'))     // directorio public para archivos
app.use(express.urlencoded({ extended: true }));

app.use(session({
	secret: 'my-secret',      // a secret string used to sign the session ID cookie
	resave: false,            // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
}))

// Middleware para inicializar el carrito si no existe
app.use((req, res, next) => {
	console.log(req.session);
    if (!req.session.carrito) {
        req.session.carrito = [];
    }
    next();
});

// Middleware para hacer que el carrito esté disponible en todas las vistas
app.use((req, res, next) => {
    res.locals.carrito = req.session.carrito || [];
    next();
});

// test para el servidor
app.get("/hola", (req, res) => {
  res.send('Hola desde el servidor');
});

// Las demas rutas con código en el directorio routes
import TiendaRouter from "./routes/router_tienda.js"
app.use("/", TiendaRouter);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
})