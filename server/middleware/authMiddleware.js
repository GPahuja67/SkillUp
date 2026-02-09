// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ error: 'No token, authorization denied' });

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user; // { id: ... }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
