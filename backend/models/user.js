// This line imports the Mongoose library, which helps us interact with MongoDB in Node.js.
import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required:true
    },
    profilePic:{
        type:String,
        default:"https://res.cloudinary.com/dhcawltsr/image/upload/v1719572309/user_swzm7h.webp"
    },
    workingRegion: {
        type: String,
        required: function() {
            return this.role === 'courier';
        }
    }
});

export const User = mongoose.model("User", UserSchema);