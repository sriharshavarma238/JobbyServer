const express = require('express');
const { Router } = express;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();

// Enable CORS for frontend requests with proper headers
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

let mongoConnected = false;

async function connectToMongoDB() {
    if (mongoConnected || mongoose.connection.readyState === 1) {
        return;
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 50000,
            socketTimeoutMS: 45000,
        });
        mongoConnected = true;
        console.log('MongoDB Connection Successful');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
}

// async function connectToMongoDB() {
//     if (mongoConnected) {
//         return;
//     }

//     try{
//         await mongoose.connect(process.env.MONGO_URI, {
//             serverSelectionTimeoutMS: 5000,
//             socketTimeoutMS: 45000,
//         })
//         mongoConnected = true;
//         console.log('MongoDB Connection Successful');
//     }catch(error){  
//         console.error('Error connecting to MongoDB:', error);
//         throw error;
//     }
// }

app.use(express.json())

const { adminRouter } = require('./routes/admin');
const { userRouter } = require('./routes/user')
const { jobApplicationRouter } = require('./routes/jobApplication');
const { jobApplicationModel } = require('./db');

// Middleware to ensure MongoDB connection before handling requests
app.use(async (req, res, next) => {
    try {
        await connectToMongoDB();
        next();
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/jobApplication', jobApplicationRouter)

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Jobby API is running', status: 'ok', dbConnected: mongoConnected });
});

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