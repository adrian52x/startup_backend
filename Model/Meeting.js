import mongoose from "mongoose";
const { Schema, model } = mongoose;

const meetingSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  time: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'completed'], required: true },
  meetingLink: {type: String, default: null},
  note: { type: String, default: null },
});


const Meeting = model("Meeting", meetingSchema);

export default Meeting;