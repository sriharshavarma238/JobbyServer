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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function connectToMongoDB(retries = 5, backoff = 2000) {
    if (mongoConnected) return;

    const mongooseOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
        // For debug ONLY: set DEBUG_TLS=1 in your env to allow invalid certs while you troubleshoot.
        // Do NOT enable this in production.
        tls: true,
        tlsAllowInvalidCertificates: process.env.DEBUG_TLS === '1'
    };

    mongoose.set('debug', !!process.env.MONGOOSE_DEBUG);

    try {
        console.log(`Connecting to MongoDB (attempt ${6 - retries})...`);
        await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
        mongoConnected = true;
        console.log('MongoDB Connection Successful');
    } catch (error) {
        console.error('MongoDB connect error (attempt):', error.message || error);
        if (retries > 0) {
            console.log(`Retrying MongoDB connection in ${backoff}ms (${retries} retries left)...`);
            await sleep(backoff);
            return connectToMongoDB(retries - 1, Math.min(backoff * 2, 10000));
        }
        console.error('Could not connect to MongoDB after retries. Exiting.');
        // choose exit or rethrow depending on whether you want the process to continue
        process.exit(1);
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

app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/jobApplication', jobApplicationRouter)

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Jobby API is running', status: 'ok' });
});

// Export app for Vercel
module.exports = app;

if (require.main === module) {
    const port = process.env.PORT || 3000;
    connectToMongoDB().then(() => {
        app.listen(port, () => {
            console.log("This server is running on port", port);
        })
    })
}

module.exports = app;