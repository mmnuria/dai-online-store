import mongoose from "mongoose";
 
const ProductosSchema = new mongoose.Schema({
  "id": {
    "type": "Number",
    "unique": true
  },
  title: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[A-Z]/.test(v);
      },
    message: 'El título debe comenzar con una letra mayúscula',
    }
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  }
})
const Productos = mongoose.model("productos", ProductosSchema);
export default Productos