const express = require('express');

const { Router } = require('express')

const { jobApplicationModel, jobModel } = require('../db');

const { userAuth } = require('../middleware/userAuth');

const jobApplicationRouter = Router();

jobApplicationRouter.post('/apply', userAuth, async (req, res) => {

    const { jobId } = req.body;

    try {

        const job = await jobModel.findById(jobId);

        await jobApplicationModel.create({
            jobId,
            userId: req.userId,
            job
        })
        res.json({
            message: "Applied successfully"
        })
    } catch (err) {
        console.error("Error applying for job:", err);
        res.status(500).json({
            error: "Failed to apply for job"
        });
    }
});

jobApplicationRouter.get('/', userAuth, async (req, res) => {

    try {
        const applications = await jobApplicationModel.find({ userId: req.userId })

        res.json({
            applications
        })
    } catch (err) {
        console.error("Error Fetching Applications:", err);
        res.status(500).json({
            message: "Error Fetching Applications",
            error: err.message
        })
    }
});

// jobApplicationRouter.delete('/:applicationId', userAuth, async (req, res) => {
//     const { applicationId } = req.params;

//     try{
//         await jobApplicationModel.findOneAndDelete({_id: applicationId, userId: req.user.id})
//         req.json({
//             message: "JobApplication delted Successfully"
//         })
//     }catch(err){
//         console.error("Error while deleting JobApplication", err);
//         req.status(500).json({
//             message: "Error while deleting JobApplication",
//             error: err.message
//         })
//     }
// });

jobApplicationRouter.delete('/:applicationId', userAuth, async (req, res) => {
    try {
        const { applicationId } = req.params;
        if (!applicationId) return res.status(400).json({ message: 'applicationId is required' });

        const application = await jobApplicationModel.findById(applicationId).lean();
        if (!application) return res.status(404).json({ message: 'Application not found' });

        if (String(application.userId) !== String(req.userId)) {
            return res.status(403).json({ message: 'Forbidden: not the owner' });
        }

        await jobApplicationModel.deleteOne({ _id: applicationId });
        return res.json({ message: 'JobApplication deleted Successfully' });
    } catch (err) {
        console.error('Error while deleting JobApplication', err);
        return res.status(500).json({ message: 'Error while deleting JobApplication', error: err.message });
    }
});

module.exports = {
    jobApplicationRouter
}