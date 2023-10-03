import dotenv from "dotenv";
dotenv.config();
import express from "express";

const app = express();


import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import userRouter from "./Routes/userRoutes.js";
import meetingRouter from "./Routes/meetingRoutes.js";


let mongoURL;
let frontendIP;
let backendIP;


if (process.env.NODE_ENV.trim() === 'production') {
  mongoURL = process.env.MONGO_PROD_URL;
  frontendIP = process.env.PROD_FRONTEND_IP;
  backendIP = process.env.PROD_BACKEND_IP;
} else {
  mongoURL = process.env.MONGO_DEV_URL;
  frontendIP = process.env.DEV_FRONTEND_IP;
  backendIP = process.env.DEV_BACKEND_IP;

  app.use(morgan("tiny")); // display in console HTTP requests
}


app.use(
  cors({
    credentials: true,
    origin: frontendIP
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(helmet());

app.use(userRouter);
app.use(meetingRouter);

// Set strictQuery to false to prepare for the change in Mongoose 7
//mongoose.set('strictQuery', false);



const connectToDatabase = async () => {
    try {
      await mongoose.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Mongoose version:', mongoose.version);
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.log('Failed to connect to MongoDB:', error);
      // Retry connection or handle the error accordingly
    }
  } 

// Initial connection attempt
connectToDatabase();





app.listen(process.env.PORT, backendIP, () => {
 console.log(`Server running: ${backendIP} : ${process.env.PORT}, Environment: ${process.env.NODE_ENV}`);
});