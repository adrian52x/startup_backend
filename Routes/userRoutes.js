import Router from "express";
const router = Router();

import User from "../Model/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";



// // Get all mentors
// router.get("/api/mentors", async (req, res) => {
//     try {
//         const { search, category } = req.query;
//         let query = { isMentor: true };
//         if (search || category) {
//             query = {
//                 ...query,
//                 // $or: [
//                 //     { firstName: search },
//                 //     { lastName: search }
//                 // ],
//                 firstName: search ,
//                 //category: category
//             };
//         }
//         console.log(query);
//         const mentors = await User.find(query).select("-__v");
//         res.status(200).json(mentors) 
//     } catch (error) {
//         res.status(400).json({ message: "something wrong, please try again." })
//     }
// });

// Get all mentors
router.get("/api/mentors", async (req, res) => {
    try {
        const { search, category } = req.query;
        

        let query = { isMentor: true };
        if (search) {
            query = {
                ...query,
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } }
                ],
            };
        }
        if (category) {
            query.category = { $in: [category] };
        }
        //console.log(query);
        const mentors = await User.find(query).select("-__v");
        res.status(200).json(mentors) 
    } catch (error) {
        res.status(400).json({ message: "something wrong, please try again." })
    }
});

// Get mentor by ID
router.get("/api/mentor/:id", async (req, res) => {
    try {
      const mentor = await User.findOne({ _id: req.params.id, isMentor: true }).select("-__v");
      if (!mentor) {
        return res.status(404).json({ message: "Mentor not found" });
      }
      res.status(200).json(mentor);
    } catch (error) {
      res.status(400).json({ message: "Something went wrong, please try again." });
    }
});

// Assert - user exists by email
router.post("/api/userExists", async (req, res) => {
    try {
        const { email } = req.body; 

      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(200).json({value: false});
      }
      res.status(200).json({value: true});
    } catch (error) {
      res.status(400).json({ message: "Something went wrong, please try again." });
    }
});

// Get all users
router.get("/api/users", async (req, res) => {
    try {
        const users = await User.find().select("-__v");
        res.status(200).json(users) 
    } catch (error) {
        res.status(400).json({ message: "something wrong, please try again." })
    }
});

// Get user by email
router.get("/api/user/email/:email", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.params.email}).select("-__v");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: "Something went wrong, please try again." });
    }
});

// Get user by ID
router.get("/api/user/id/:id", async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id}).select("-__v");
      console.log(user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: "Something went wrong, please try again." });
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
            console.log(error);  
            return res.status(500).json({ message: 'Failed to register user', error });
        }
    }    
});

// Register
router.post("/api/register-oauth", async (req, res) => {
    // Our register logic starts here
   try {
        // Get user input
        const { firstName, lastName, email } = req.body;

        // Validate user input
        if (!(firstName && lastName && email )) {
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
 
        
        // Create user in our database
        const user = await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email.toLowerCase(), // sanitize,
            password: null,
            registerMethod: "oauth"
        });

        // return new user
        return res.status(201).json(user);

    } catch (error) {
        if (error.code === 11000 && error.keyValue.email) {
            // Custom response for duplicate email
            res.status(400).json({ error: 'Email already exists' });
        } else {  
            console.log(error);  
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
        const user = await User.findOne({ email }).select("-__v");

    
        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            //const token = jwt.sign({ userId: user._id, email, isMentor: user.isMentor }, process.env.SECRET_KEY, { expiresIn: "5h"});

            // create cookie
            // res.cookie('jwt52x', token, {
            //     maxAge: 5 * 60 * 60 * 1000 // 5 hours
            // })
    

            const userWithoutPassword = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                profession: user.profession,
                category: user.category,
                rating: user.rating,
                isMentor: user.isMentor,
                isEmailConfirmed: user.isEmailConfirmed,
                isVerified: user.isVerified,
                description: user.description,
                img: user.img,
                registerMethod: user.registerMethod,
            };

            return res.status(200).json(userWithoutPassword);
        }
        return res.status(400).json({ message: "Wrong Credentials"});
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
// router.get("/api/user", async (req, res) => {
//     try {
//         const cookie = req.cookies['jwt52x']
        

//         const credentials = jwt.verify(cookie, process.env.SECRET_KEY)

//         const user = await User.findOne({ _id: credentials.userId })

//         // pass data without password
//         const {password, ...data} = user.toJSON()

        

//         return res.status(200).json(data);

//     } catch (error) {
//         return res.status(401).json({ message: 'Unauthenticated', error })
//     }
// });


export default router;