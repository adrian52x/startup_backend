import Router from "express";
const router = Router();

import Meeting from '../Model/Meeting.js';
import User from "../Model/User.js";


// Get all meetings
router.get("/api/meetings", async (req, res) => {
    try {
        const meetings = await Meeting.find().select("-__v");
        res.status(200).json(meetings) 
    } catch (error) {
        res.status(400).json({ message: "something wrong, please try again." })
    }
});

// Create a meeting
router.post("/api/meetings", async (req, res) => {
    try {
        let { sender, receiver, time, date, status } = req.body;
        
        const senderUser = await User.findOne({ email: sender });
        const receiverUser = await User.findOne({ email: receiver });

        if (!senderUser) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        if (!receiverUser) {
            return res.status(404).json({ message: 'Receiver not found' });
        }
      
        if (!receiverUser.isMentor) {
            return res.status(400).json({ message: 'Receiver is not a mentor' });
        }

        const meetingData = {
            sender: senderUser._id,
            receiver: receiverUser._id,
            time: time,
            date: date,
            status: status,
        };
        
        const meeting = await Meeting.create(meetingData);

        return res.status(201).json(meeting);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create meeting', error });
    }
  });



export default router;
