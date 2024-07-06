import mongoose from "mongoose";

const {Schema} = mongoose;

const cartSchema = Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    }
})

export const Cart = mongoose.model("Cart",cartSchema);