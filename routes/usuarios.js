import express from "express";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt' // para comparar contraseñas cifradas
import usuario from "../model/usuarios.js";

const router = express.Router();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Función para buscar el usuario en la base de datos
async function obtenerUsuario(username) {
    console.log(usuario);
    return await usuario.findOne({ username });
    
}

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
    if (!username || !password) {
        return res.status(400).send("Usuario y contraseña son necesarios.");
    }
    
    try{

        const usuario = await obtenerUsuario(username); // Función para obtener el usuario desde la DB

        if (!usuario) {
            // Si el usuario no existe
            return res.status(401).send("Usuario no encontrado");
        }

        if (password !== usuario.password) {
            // Si la contraseña no es correcta
            return res.status(401).send("Contraseña incorrecta");
        }

        // Si las credenciales son correctas
        const token = jwt.sign({ usuario: username }, process.env.SECRET_KEY, { expiresIn: '1h' });
        
        // Si el usuario seleccionó "Recordarme", extender la duración de la cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            //expires: remember ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined // 30 días si "Recordarme"
        };

        res.cookie('access_token', token, cookieOptions);

        // Redirigir al usuario a la página de bienvenida
        return res.render('bienvenida.html', { usuario: username });
        
    } catch (error) {
        console.error("Error en autenticación:", error);
        res.status(500).send("Error del servidor");
        
    }

});

router.get('/logout', (req, res) => {
    // Elimina la cookie 'access_token'
    res.clearCookie('access_token');

    // Redirige a la página de inicio de sesión
    res.redirect('/login');
});

router.get('/', (req, res) => {
    // Verificar si el usuario tiene un token de autenticación
    const token = req.cookies.access_token;

    if (token) {
        // Decodificar el token para obtener los datos del usuario
        jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
            if (err) {
                return res.status(401).send('Sesión expirada');
            }
            // Pasar el nombre de usuario al frontend
            res.render('login.html', { usuario: data.usuario });
        });
    } else {
        // Si no hay token, renderizar sin usuario autenticado
        res.render('home.html', { usuario: null });
    }
});

export default router