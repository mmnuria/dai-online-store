import mongoose from "mongoose";
 
const ProductosSchema = new mongoose.Schema({
  "id": {
    "type": "Number",
    "unique": true
  },
  //...
})
const Productos = mongoose.model("productos", ProductosSchema);
export default Productos