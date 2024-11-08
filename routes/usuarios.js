import express from "express";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt' // para comparar contraseñas cifradas
//import Productos from "../model/productos.js";

const router = express.Router();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Para mostrar formulario de login
router.get('/login', (req, res) => {
    // Si ya está autenticado, redirige a la página de bienvenida o a una página principal
    if (req.cookies.access_token) {
        return res.redirect('/bienvenida');
    }
    // Si no está autenticado, renderiza el formulario de login
    res.render('login.html');
})

// Para recoger datos del formulario de login 
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    console.log('Login attempt:', username, password); // Agregar logs

    // Aquí deberías verificar el usuario en la base de datos
    const usuario = await obtenerUsuario(username); // Función para obtener el usuario desde la DB

    if (usuario && bcrypt.compareSync(password, usuario.password)) {
        
        console.log('Usuario autenticado', usuario.username); // Confirmar que el usuario se encuentra
        
        // Si las credenciales son correctas, generar el token
        const token = jwt.sign({ usuario: username }, process.env.SECRET_KEY, { expiresIn: '1h' });
        // Guardar el token en la cookie
        res.cookie('access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        // Redirigir al usuario a la página de bienvenida o alguna otra página
        return res.render('bienvenida.html', { usuario: username }); // Redirige al usuario a la página de bienvenida
    } else {
        console.log('Credenciales incorrectas');
        
        // Si las credenciales son incorrectas, mostrar un error o redirigir
        res.status(401).send("Credenciales incorrectas");
    }
});

router.get('/logout', (req, res) => {
    // Elimina la cookie 'access_token'
    res.clearCookie('access_token');

    // Redirige a la página de inicio de sesión
    res.redirect('/login');
});
export default router