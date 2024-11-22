//hacer schema como en productos.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    address: {
        geolocation: {
            lat: { type: String },
            long: { type: String }
        },
        city: { type: String },
        street: { type: String },
        number: { type: Number },
        zipcode: { type: String }
    },
    id: { type: Number, unique: true },
    admin: { type: Boolean, default: false, required: false },
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: {
        firstname: { type: String },
        lastname: { type: String }
    },
    phone: { type: String }
}, { versionKey: false });

export default mongoose.model('usuario', UserSchema);
