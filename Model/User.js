import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String,  }, // removed required - testing
    phone: { type: Number, default: null }, // required ??
    profession: { type: String, default: null }, // required???
    category: { type: [String], default: null },
    rating: { type: Number, default: null },
    isMentor: { type: Boolean, default: false },
    isEmailConfirmed: { type: Boolean, default: null },
    isVerified: { type: Boolean, default: null },
    description: { type: String, default: null },
    img: { type: String, default: null }
    // video
});

const User = model("User", userSchema);

export default User;