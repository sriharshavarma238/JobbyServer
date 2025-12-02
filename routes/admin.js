const express = require('express');

const { Router } = express;

const jwt = require('jsonwebtoken');

const { JWT_ADMIN_PASSWORD } = require('../config');

const adminRouter = Router();

const bcrypt = require('bcrypt');

const { adminAuth } = require('../middleware/adminAuth');

const { adminModel, jobModel } = require('../db');

adminRouter.post('/signup', async (req, res) => {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'username, email and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await adminModel.create({
            username,
            name,
            email,
            password: hashedPassword
        })

        res.json({
            message: "You Have Signed Up Successfully"
        })


    } catch (err) {
        console.error("Error during admin signup:", err);

        if (err.code === 11000) {
            return res.status(400).json({ message: "Username or Email already exists." })
        }

        res.status(500).json({
            message: "Error in signing up admin",
            error: err.message
        })
    }
})

adminRouter.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await adminModel.findOne({ username });

        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (admin && passwordMatch) {
            const token = jwt.sign({ id: admin._id.toString(), role: 'admin' }, JWT_ADMIN_PASSWORD)

            res.json({
                message: "Signed In Successfully",
                token
            })
        } else {
            res.status(403).json({
                message: "Invalid Credentials"
            })
        }
    } catch (err) {
        console.error("Error during admin signin:", err);
        res.status(500).json({
            message: "Error in signing in admin",
            error: err.message
        });
    }
})

adminRouter.post('/jobs', adminAuth, async (req, res) => {
    const adminId = req.adminId

    const { title, rating, companyLogoUrl, location, jobDescription, employmentType, packagePerAnnum, creatorId } = req.body;

    try {
        const job = await jobModel.create({
            title,
            rating,
            companyLogoUrl,
            location,
            jobDescription,
            employmentType,
            packagePerAnnum,
            creatorId: adminId
        })

        res.json({
            message: "Job created successfully",
            jobId: job._id
        })
    } catch (err) {
        res.status(500).json({
            message: "Error Posting the Job",
            error: err.message
        })
    }


})

adminRouter.put('/jobs/:jobId', adminAuth, async (req, res) => {

    const jobId = req.params.jobId

    const adminId = req.adminId

    const { title, rating, companyLogoUrl, location, jobDescription, employmentType, packagePerAnnum } = req.body;

    if (!jobId) {
        return res.status(400).json({ message: "jobId is Required" });
    }

    try {
        const updatedJob = await jobModel.findByIdAndUpdate(
            jobId,
            {
                title,
                rating,
                companyLogoUrl,
                location,
                jobDescription,
                employmentType,
                packagePerAnnum
            },
            { new: true }
        )

        if (!updatedJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json({
            message: "Job updated successfully",
            job: updatedJob
        })
    } catch (err) {
        console.error("Error updating job:", err);
        res.status(500).json({
            message: "Error updating job",
            error: err.message
        })
    }
})

// adminRouter.put('/jobs', adminAuth, async (req, res) => {
//     console.log('PUT /admin/jobs body:', req.body);

//     const {
//         jobId,
//         title,
//         rating,
//         companyLogoUrl,
//         location,
//         jobDescription,
//         employmentType,
//         packagePerAnnum
//     } = req.body;

//     if (!jobId) return res.status(400).json({ message: 'jobId is required' });

//     const update = {};
//     if (title !== undefined) update.title = title;
//     if (rating !== undefined) update.rating = rating;
//     if (companyLogoUrl !== undefined) update.companyLogoUrl = companyLogoUrl;
//     if (location !== undefined) update.location = location;
//     if (jobDescription !== undefined) update.jobDescription = jobDescription;
//     if (employmentType !== undefined) update.employmentType = employmentType;
//     if (packagePerAnnum !== undefined) update.packagePerAnnum = packagePerAnnum;

//     if (Object.keys(update).length === 0) {
//         return res.status(400).json({ message: 'No fields to update' });
//     }

//     try {
//         // If you restrict to creatorId, ensure adminAuth sets req.adminId and use:
//         // const query = { _id: jobId, creatorId: req.adminId };
//         const updated = await jobModel.findByIdAndUpdate(
//             jobId,
//             { $set: update },
//             { new: true, runValidators: true }
//         );

//         console.log('updated job:', updated);

//         if (!updated) return res.status(404).json({ message: 'Job not found or not updated' });

//         return res.json({ message: 'Job updated', job: updated });
//     } catch (err) {
//         console.error('Error updating job:', err);
//         return res.status(500).json({ message: 'Error updating job', error: err.message });
//     }
// });

adminRouter.delete('/jobs/:jobId', adminAuth, async (req, res) => {
    const adminId = req.adminId
    const { jobId } = req.params;

    try {
        await jobModel.deleteOne({ _id: jobId, creatorId: adminId });
        res.json({
            message: "Job deleted successfully"
        })
    } catch (err) {
        console.error("Error deleting job:", err);
        res.status(500).json({
            message: "Error deleting job",
            error: err.message
        })
    }
})

adminRouter.get('/jobs', adminAuth, async (req, res) => {
    const adminId = req.adminId

    try {
        const jobs = await jobModel.find({ creatorId: adminId });
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

adminRouter.get('/all-jobs', adminAuth, async (req, res) => {
    try {
        const jobs = await jobModel.find();
        res.json({
            jobs
        })
    } catch (err) {
        console.error("Error fetching all jobs:", err);
        res.status(500).json({
            message: "Error fetching all jobs",
            error: err.message
        })
    }
})

adminRouter.get('/job/:jobId', adminAuth, async (req, res) => {
    const { jobId } = req.params;

    try {
        const job = await jobModel.findOne({ _id: jobId });
        res.json({
            job
        })
    } catch (err) {
        console.error("Error fetching job:", err);
        res.status(500).json({
            message: "Error fetching job",
            error: err.message
        })
    }
})


module.exports = {
    adminRouter
}