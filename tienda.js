import express   from "express"
import nunjucks  from "nunjucks"
      
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