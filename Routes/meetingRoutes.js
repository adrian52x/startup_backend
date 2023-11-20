import Router from "express";
import mongoose from "mongoose";

const router = Router();

import Meeting from '../Model/Meeting.js';
import User from "../Model/User.js";


// Get all meetings
// router.get("/api/meetings", async (req, res) => {
//     try {
//         const { meetingId, senderId, receiverId } = req.query;

//         let query = {};

//         meetingId ? query._id = meetingId : null;
//         senderId ? query.sender = senderId : null;
//         receiverId ? query.receiver = receiverId : null;

        
//         const meetings = await Meeting.find(query).select("-__v");
//         res.status(200).json(meetings) 
//     } catch (error) {
//         res.status(400).json({ message: "something wrong, please try again." })
//     }
// });

router.get("/api/meetings", async (req, res) => {
    try {
      const { meetingId, senderId, receiverId } = req.query;
  
      let matchStage = {};
  
      if (meetingId) {
        matchStage._id = new mongoose.Types.ObjectId(meetingId);
      }
      if (senderId) {
        matchStage.sender = new mongoose.Types.ObjectId(senderId);
      }
      if (receiverId) {
        matchStage.receiver = new mongoose.Types.ObjectId(receiverId);
      }
  
      const meetings = await Meeting.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'users',
            localField: 'sender',
            foreignField: '_id',
            as: 'sender'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'receiver',
            foreignField: '_id',
            as: 'receiver'
          }
        },
        { $unwind: '$sender' },
        { $unwind: '$receiver' },
        {
          $project: {
            _id: 1,
            time: 1,
            date: 1,
            status: 1,
            'sender._id': 1,
            'sender.firstName': 1,
            'sender.lastName': 1,
            'sender.email': 1,
            'sender.phone': 1,
            'sender.profession': 1,
            'sender.rating': 1,
            'sender.img': 1,
            'receiver._id': 1,
            'receiver.firstName': 1,
            'receiver.lastName': 1,
            'receiver.email': 1,
            'receiver.phone': 1,
            'receiver.profession': 1,
            'receiver.rating': 1,
            'receiver.img': 1
          }
        }
      ]);
  
      res.status(200).json(meetings);
    } catch (error) {
      res.status(400).json({ message: "something wrong, please try again. " + error });
    }
  });

// Create a meeting
router.post("/api/meetings", async (req, res) => {
    try {
        let { sender, receiver, time, date, status } = req.body;
        
        // const senderUser = await User.findOne({ email: sender });
        // const receiverUser = await User.findOne({ email: receiver });

        // if (!senderUser) {
        //     return res.status(404).json({ message: 'Sender not found' });
        // }

        // if (!receiverUser) {
        //     return res.status(404).json({ message: 'Receiver not found' });
        // }
      
        // if (!receiverUser.isMentor) {
        //     return res.status(400).json({ message: 'Receiver is not a mentor' });
        // }

        const meetingData = {
            sender: sender,
            receiver: receiver,
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
