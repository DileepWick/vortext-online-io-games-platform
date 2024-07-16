import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        default: "https://res.cloudinary.com/dhcawltsr/image/upload/v1719572309/user_swzm7h.webp"
    },
    //Courier attributes
    workingRegion: {
        type: String,
        required: function() {
            return this.role === 'courier';
        }
    },
    status: {
        type: String,
        enum: ['free', 'working', 'not available'],
        required: function() {
            return this.role === 'courier';
        },
        default: 'free'
    }
});

export const User = mongoose.model("User", UserSchema);
