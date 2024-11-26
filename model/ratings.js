import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "productos", 
    required: true 
  },
  rate: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: false // Los comentarios no siempre serán obligatorios
  }
});

const Rating = mongoose.model("ratings", RatingSchema);
export default Rating;
