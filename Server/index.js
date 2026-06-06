import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getSecrets } from './config/secretManager.js';
import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/UserRoute.js';
import PostRoute from './Routes/PostRoute.js';
import UploadRoute from './Routes/UploadRoute.js';


const app = express();

// Serve static files
app.use(express.static('public'));
app.use('/images', express.static('images'));

// Body Parser
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});


const startServer = async () => {
    try {
        // Step 1: Load secrets from AWS Secret Manager
        await getSecrets();

        // Step 2: Setup CORS
        app.use(cors({
            origin: '*',
            credentials: true
        }));

        // Step 3: Connect to MongoDB
        await mongoose.connect(process.env.MONGO_DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB Connected");

        // Step 4: Routes
        app.use('/auth', AuthRoute);
        app.use('/user', UserRoute);
        app.use('/post', PostRoute);
        app.use('/upload', UploadRoute);

        // Step 5: Start Server
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`✅ Secret Manager: Active`);
            console.log(`✅ S3 Bucket: ${process.env.AWS_BUCKET_NAME}`);
        });

    } catch (error) {
        console.error("❌ Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
