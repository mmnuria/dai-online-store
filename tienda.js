import express   from "express"
import dotenv from "dotenv";
import nunjucks  from "nunjucks"
import session from "express-session"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
      
import connectDB from "./model/db.js"
import Usuarios from "./routes/usuarios.js"
import TiendaRouter from "./routes/router_tienda.js"
import RatingsRouter from "./routes/router_rating.js";

dotenv.config();
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
app.use(express.json())

app.use(session({
	secret: 'my-secret',      // a secret string used to sign the session ID cookie
	resave: false,            // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
}))

app.use(cookieParser())

// middleware de autentificacion
const autentificación = (req, res, next) => {
	const token = req.cookies.access_token;
	if (token) {
		try {
			const data = jwt.verify(token, process.env.SECRET_KEY);
			req.username = data.usuario;  // Guarda el usuario en el request
			res.locals.usuario_autenticado = true;
			res.locals.usuario_admin = data.admin || false;
			

		} catch (err) {
			console.error("Token no válido", err);
			res.locals.usuario_autenticado = false;
			res.locals.usuario_admin = false;
			res.redirect('login.html')

		}
	}next()
}
app.use(autentificación)

// Middleware para inicializar el carrito si no existe
app.use((req, res, next) => {
	//console.log(req.session);
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
app.use("/", TiendaRouter);

// Las demas rutas con código en el directorio routes

app.use("/usuarios", Usuarios);

app.use("/api/ratings", RatingsRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
})