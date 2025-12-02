const express = require('express');

const { Router } = express;

const jwt = require('jsonwebtoken');

const { JWT_USER_PASSWORD } = require('../config');

const { userModel, jobApplicationModel, profileModel, jobModel } = require('../db');

const bcrypt = require('bcrypt');

const { userAuth } = require('../middleware/userAuth');

const userRouter = Router();

userRouter.post('/signup', async (req, res) => {
    const { username, name, email, password } = req.body;

    try {
        const hashedpassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            name,
            email,
            password: hashedpassword
        })

        await profileModel.create({
            _id: user._id,
            profileImageUrl: "",
            shortBio: "",
            name
        })

        res.json({
            message: "You are signed up successfully"
        })

    } catch (err) {
        console.error("Error during user signup:", err);

        if (err.code === 11000) {
            return res.status(400).json({
                message: "Username or email already exists"
            })
        }

        res.status(500).json({
            message: "Error in signing up user",
            error: err.message
        })
    }
})

userRouter.post('/signin', async (req, res,) => {
    const { username, password } = req.body;

    try {
        const user = await userModel.findOne({ username });

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (user && passwordMatch) {
            const token = jwt.sign({ id: user._id.toString(), role: 'user' }, JWT_USER_PASSWORD)

            res.json({
                message: "User Signed In Successfully",
                token
            })
        } else {
            res.status(403).json({
                message: "Invalid Credentials"
            })
        }
    } catch (err) {
        console.error("Error during user signin:", err);

        res.status(500).json({
            message: "Error while signing in user",
            error: err.message
        })
    }
})

userRouter.put('/profile', userAuth, async (req, res) => {
    const { profileImageUrl, name, shortBio } = req.body;

    try {
        const updatedProfile = await profileModel.findByIdAndUpdate(
            req.userId,
            {
                profileImageUrl,
                name,
                shortBio
            },
            { new: true }
        );

        res.json({
            profileImageUrl: updatedProfile.profileImageUrl,
            name: updatedProfile.name,
            shortBio: updatedProfile.shortBio
        });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({
            message: "Error updating profile",
            error: err.message
        });
    }
})

userRouter.get('/profile', userAuth, async (req, res) => {
    try {
        const user = await profileModel.findById(req.userId);
        res.json({
            profileImageUrl: user.profileImageUrl,
            name: user.name,
            shortBio: user.shortBio
        })
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({
            message: "Error fetching profile",
            error: err.message
        });
    }
})

userRouter.get('/jobs', userAuth, async (req, res) => {

    try {
        const jobs = await jobModel.find();
        res.json({
            jobs
        })
    } catch (err) {
        console.error("Error fetching jobs:", err);
        res.status(500).json({
            message: "Error fetching jobs",
            error: err.message
        })
    }

})

userRouter.get('/jobs/:jobId', userAuth, async (req, res) => {
    const { jobId } = req.params;
    
    try {
        const job = await jobModel.findById(jobId);
        
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check if user has already applied
        const existingApplication = await jobApplicationModel.findOne({
            userId: req.userId,
            jobId: jobId
        });

        res.json({
            job,
            hasApplied: !!existingApplication
        });
    } catch (err) {
        console.error("Error fetching job details:", err);
        res.status(500).json({
            message: "Error fetching job details",
            error: err.message
        });
    }
})

// userRouter.get('/applications', userAuth, async (req, res) => {

//     try{
//         const applications = await jobApplicationModel.find({userId: req.user.id});
//         res.json({
//             applications
//         })
//     }catch(err){
//         console.error("Error fetching applications:", err);
//         res.status(500).json({
//             message: "Error fetching applications",
//             error: err.message
//         })
//     }

// })

// userRouter.delete('/applications/:applicationId', userAuth, async (req, res) => {

//     const {applicationId} = req.params;
//     try{
//         await jobApplicationModel.deleteOne({_id: applicationId, userId: req.user.id});
//         res.json({
//             message: "Application deleted successfully"
//         })
//     }catch(err){
//         console.error("Error deleting application:", err);
//         res.status(500).json({
//             message: "Error deleting application",
//             error: err.message
//         })
//     }

// })

module.exports = {
    userRouter
}