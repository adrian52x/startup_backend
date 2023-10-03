import Router from "express";
const router = Router();

import User from "../Model/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";



// Get all users
router.get("/api/mentors", async (req, res) => {
    try {
        const mentors = await User.find({ isMentor: true }).select("-__v");
        res.status(200).json(mentors) 
    } catch (error) {
        res.status(400).json({ message: "something wrong, please try again." })
    }
});

// Get all mentors
router.get("/api/users", async (req, res) => {
    try {
        const users = await User.find().select("-__v");
        res.status(200).json(users) 
    } catch (error) {
        res.status(400).json({ message: "something wrong, please try again." })
    }
});


// Register
router.post("/api/register", async (req, res) => {
    // Our register logic starts here
   try {
        // Get user input
        const { firstName, lastName, email, password } = req.body;

        // Validate user input
        if (!(firstName && lastName && email && password )) {
            return res.status(400).send("All input are required");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send("Invalid email format");
        }

        // checks if user already exist
        // Validates if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("Email already in use");
        } 
 
        //Encrypt user password
        const encryptedUserPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email.toLowerCase(), // sanitize,
            password: encryptedUserPassword
        });

        // return new user
        return res.status(201).json(user);

    } catch (error) {
        if (error.code === 11000 && error.keyValue.email) {
            // Custom response for duplicate email
            res.status(400).json({ error: 'Email already exists' });
        } else {    
            return res.status(500).json({ message: 'Failed to register user', error });
        }
    }    
});

// Login
router.post("/api/login", async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body;
    
        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });
        
    
        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign({ userId: user._id, email, isMentor: user.isMentor }, process.env.SECRET_KEY, { expiresIn: "5h"});

            // create cookie
            res.cookie('jwt52x', token, {
                maxAge: 5 * 60 * 60 * 1000 // 5 hours
            })
    
            
            return res.status(200).json(user);
        }
        return res.status(400).send("Invalid Credentials");
    } catch (error) {
        return res.status(400).json({ message: "something wrong"})
    }    
});


// Logout
router.post("/api/logout", async (req, res) => {
    try {
        res.cookie('jwt52x', '', {maxAge: 0}) 
        return res.status(200).json({ message: "Logged out"});
    } catch (error) {
        return res.status(500).json({ message: error});
    } 
});

// Current user by token
router.get("/api/user", async (req, res) => {
    try {
        const cookie = req.cookies['jwt52x']
        

        const credentials = jwt.verify(cookie, process.env.SECRET_KEY)

        const user = await User.findOne({ _id: credentials.userId })

        // pass data without password
        const {password, ...data} = user.toJSON()

        

        return res.status(200).json(data);

    } catch (error) {
        return res.status(401).json({ message: 'Unauthenticated', error })
    }
});


export default router;