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
  count: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "usuarios", 
    required: false
  }
});

const Rating = mongoose.model("ratings", RatingSchema);
export default Rating;
