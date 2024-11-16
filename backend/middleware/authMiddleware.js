const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Authorization header missing or malformed');
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, 'SECRET_KEY', (err, user) => {
        if (err) {
            console.error('JWT verification error:', err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token has expired' });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ error: 'Invalid token' });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
        req.user = user;
        next();
    });
};


exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    next();
};
