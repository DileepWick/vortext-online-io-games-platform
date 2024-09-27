import mongoose from "mongoose";
const { Schema } = mongoose;

const cartSchema = Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true // Changed 'require' to 'required'
    }
});

export const Cart = mongoose.model("Cart", cartSchema);