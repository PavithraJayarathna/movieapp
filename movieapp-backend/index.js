const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const MovieRouter = require('./routes/movie');
const UserRouter = require('./routes/user');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser());  // Parse cookies

// Enable CORS with proper origin and credentials handling
app.use(cors({
    origin: ["http://localhost:3001"], // Allow requests from frontend
    credentials: true, // Allow cookies and authorization headers
}));

// Use routers
app.use('/api', UserRouter);
app.use('/api', MovieRouter);

// Connect to MongoDB using environment variable for connection string

mongoose.connect('mongodb+srv://madumalijayarathna09:Chanmadu@cluster0.ekd0ilq.mongodb.net/movieapp?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 7000; // Use PORT from .env or fallback to 7000
app.listen(PORT, () => {
    console.log(`Server is Running on http://localhost:${PORT}`);
});
