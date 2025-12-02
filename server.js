const express = require('express');
const { Router } = express;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();

// Enable CORS for frontend requests
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Set FRONTEND_URL in .env for production
    credentials: true
}));

let mongoConnected = false;

async function connectToMongoDB() {
    if (mongoConnected || mongoose.connection.readyState === 1) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        mongoConnected = true;
        console.log('MongoDB Connection Successful');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
}

app.use(express.json())

const { adminRouter } = require('./routes/admin');
const { userRouter } = require('./routes/user')
const { jobApplicationRouter } = require('./routes/jobApplication');

// Initialize MongoDB connection immediately
connectToMongoDB().catch(err => console.error('Initial MongoDB connection failed:', err));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Jobby API is running', 
        status: 'ok', 
        dbConnected: mongoose.connection.readyState === 1 
    });
});

app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/jobApplication', jobApplicationRouter)

if (require.main === module) {
    const port = process.env.PORT || 3000;
    connectToMongoDB().then(() => {
        app.listen(port, () => {
            console.log("This server is running on port", port);
        })
    })
}

// Export app for Vercel
module.exports = app;