const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { swaggerDocs, swaggerUi } = require('./swagger'); // وارد کردن پیکربندی Swagger
const { sessionConfig } = require('./auth/session-config'); // Import session config
const keycloak = require('./auth/keycloak-config'); // Import Keycloak config
const authRoutes = require('./routes/auth');
const kycRoutes = require('./routes/kyc');
const adminRoutes = require('./routes/admin');
const session = require('express-session');

const app = express();

// CORS options
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://172.31.13.30:5000',
        'https://localhost:3000',
        'http://172.31.13.34:3000',
        'https://172.31.13.34:3000',
        "https://172.31.13.30:3000",
        "https://172.31.13.11:3000",
    ],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
    optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// استفاده از تنظیمات session
app.use(session(sessionConfig));

// استفاده از middleware Keycloak
app.use(keycloak.middleware());

// اضافه کردن Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// تعریف مسیرها
app.use('/api/auth', authRoutes);
app.use('/api/kyc', keycloak.protect(), kycRoutes);
app.use('/api/admin', keycloak.protect('admin'), adminRoutes);

// اتصال به MongoDB
mongoose.connect('mongodb://adi.dev.modernisc.com:27017/kycdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// راه‌اندازی سرور
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
