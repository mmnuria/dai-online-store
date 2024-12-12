import { MongoClient } from 'mongodb';

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

// función asíncrona
async function Inserta_datos_en_colección(colección, url, relatedCollection) {
  try {
    // Obtenemos datos de la API
    const datos = await fetch(url).then(res => res.json());

    // Conectar al cliente de MongoDB
    await client.connect();
    console.log('Conectado a la base de datos');

    // Seleccionar la base de datos
    const db = client.db(dbName);

    // Obtener la colección de MongoDB
    const collection = db.collection(colección);

    if (relatedCollection) {
      // Si estamos trabajando con `ratings`, obtenemos también los productos
      const productos = await db.collection('productos').find().toArray();

      // Para cada producto, creamos un nuevo rating asociado
      const ratings = productos.map(producto => ({
        productId: producto._id,
        rate: producto.rating.rate, // Puedes establecer un valor predeterminado para el rating
        count: producto.rating.count, // Puedes dejar un comentario vacío si es necesario
        userId: null // O establecer un valor predeterminado para el userId
      }));

      // Insertar todos los ratings en la colección de `ratings`
      const ratingCollection = db.collection(relatedCollection);
      const resultado = await ratingCollection.insertMany(ratings);

      console.log(`Se insertaron ${resultado.insertedCount} documentos en la colección ${relatedCollection}`);
    } else {
      // Insertar datos normales en la colección
      const resultado = await collection.insertMany(datos);
      console.log(`Se insertaron ${resultado.insertedCount} documentos en la colección ${colección}`);
    }

    return `${datos.length} datos traidos para ${colección}`;
  } catch (err) {
    err.errorResponse += ` en fetch ${colección}`;
    throw err;
  }
}

// Inserción de ratings consecutiva
Inserta_datos_en_colección('productos', 'https://fakestoreapi.com/products', 'ratings')
  .then((r) => console.log(`Todo bien: ${r}`)) // OK
  .catch((err) => console.error('Algo mal: ', err.errorResponse));

console.log('Inserción de ratings completada');
