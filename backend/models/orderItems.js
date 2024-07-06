import mongoose from "mongoose";

const {Schema} = mongoose;

const orderItemsSchema = new Schema({
    order:{
        type:Schema.Types.ObjectId,
        ref:"Order",
        require:true
    },
    stockid:{
        type:Schema.Types.ObjectId,
        ref:"GameStock",
        require:true
    },
    quantity:{
        type:Number,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

export const OrderItems = mongoose.model("OrderItems",orderItemsSchema);