const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const kycRoutes = require('./routes/kyc');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
// CORS options
const corsOptions = {
    origin: [
        "http://172.31.13.34:3000",
        "https://172.31.13.34:3000",
        "https://172.31.13.11:3000",
        "http://172.31.13.11:3000",
        "https://172.31.13.11:3000/**",
        "http://localhost:3000",
        "https://localhost:3000",
        "http://172.31.13.30:3000",
        "https://172.31.13.30:3000"
    ],
    methods: "GET,POST,PUT,DELETE",  // Methods you want to allow
    allowedHeaders: "Content-Type,Authorization", // Allowed headers for your request
    credentials: true,  // If you are sending credentials (cookies, authorization headers)
    optionsSuccessStatus: 200
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://adi.dev.modernisc.com:27017/kycdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
