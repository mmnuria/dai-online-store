import { MongoClient } from 'mongodb'

// del archivo .env
const USER_DB = process.env.USER_DB
const PASS    = process.env.PASS
const url    = `mongodb://${USER_DB}:${PASS}@localhost:27017`
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';
// Seleccionar la base de datos
const db = client.db(dbName);

// Obtener la colección de MongoDB
const col_productos = db.collection('productos')
const col_usuarios = db.collection('usuarios')

//
const indices_pro = await col_productos.listIndexes().toArray()
const indices_usu = await col_usuarios.listIndexes().toArray()

console.log("Existing indexes:\n")

console.log(indices_pro)
console.log(indices_usu)