import express from "express";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt' // para comparar contraseñas cifradas
import usuario from "../model/usuarios.js";
import logger from '../logger.js'; 

const router = express.Router();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function obtenerUsuario(username) {
    return usuario.findOne({ username }); 
}

function obtenerCorreo(email) {
    return usuario.findOne({ email }); 
}

router.get('/login', (req, res) => {
    // Si ya está autenticado, redirige a la página de bienvenida o a una página principal
    if (req.cookies.access_token) {
        return res.render('bienvenida.html');
    }
    // Si no está autenticado, renderiza el formulario de login
    res.render('login.html');
})

router.post('/', async (req, res) => {
    console.log('Registrando usuario', { usuario: req.body.username, password: req.body.password.trim() });

    const usuarioExistente = await obtenerUsuario(req.body.username);
    
    if (usuarioExistente) {
        logger.warn('Nombre del usuario en uso');
        return res.status(500).render('registro.html', { err: 'El nombre de usuario ya está en uso.' });
    }

    const correoExistente = await obtenerCorreo(req.body.email);

    if (correoExistente) {
        logger.warn('Correo en uso');
        return res.status(500).render('registro.html', { err: 'El correo electrónico ya está en uso.' });
    }

    try {

        const passwordHash = await bcrypt.hash(req.body.password.trim(), 10);

        await usuario.create({
            id: Math.trunc(Math.random() * 10000000),
            admin: false,
            ...req.body,
            password: passwordHash
        });

        const token = jwt.sign({usuario:usuario.username, admin:usuario.admin}, process.env.SECRET_KEY, { expiresIn: '1h' })
        
        // Si el usuario seleccionó "Recordarme", extender la duración de la cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expiresIn: '1h'
            // expires: remember ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined // 30 días si "Recordarme"
        };

        res.cookie('access_token', token, cookieOptions);
        logger.info('Registro completado');
        return res.render('bienvenida.html', { usuario: req.body.username, usuario_autenticado: true });
    } catch (err) {
        console.log('Error en el registro', err);
        res.status(500).render('registro.html', {err: 'Hubo un problema al procesar tu solicitud. Intenta de nuevo más tarde.'});
        logger.error('Error de registro');
    } 
})

router.get('/registro', (req, res) => {
    res.render('registro.html');
})  

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send("Usuario y contraseña son necesarios.");
    }
    
    try{

        const usuario = await obtenerUsuario(username); // Función para obtener el usuario desde la DB

        if (!usuario) {
            logger.error('Usuario no encontrado');
            return res.status(401).render('login.html', {error: "Usuario no encontrado"});
        }

        const correctPass = password === usuario.password || await bcrypt.compare(password.trim(), usuario.password);

        if (!correctPass) {
            logger.error('Contraseña incorrecta');
            return res.status(401).render('login.html', {error: "Contraseña incorrecta"});
        }
        const token = jwt.sign({usuario:usuario.username, admin:usuario.admin}, process.env.SECRET_KEY, { expiresIn: '1h' })
        
        // Si el usuario seleccionó "Recordarme", extender la duración de la cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            //expires: remember ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined // 30 días si "Recordarme"
        };

        res.cookie('access_token', token, cookieOptions);
        logger.info('Usuario ha iniciado sesion correctamente');
        // Redirigir al usuario a la página de bienvenida
        return res.render('bienvenida.html', { usuario: username, usuario_autenticado: true });
        
    } catch (error) {
        console.error("Error en autenticación:", error);
        res.status(500).render('login.html', {error});
        logger.error('Error en autenticación');
    }

});

router.get('/', (req, res) => {
    // Verificar si el usuario tiene un token de autenticación
    const token = req.cookies.access_token;

    if (token) {
        // Decodificar el token para obtener los datos del usuario
        jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
            if (err) {
                logger.error('Sesión expirada');
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