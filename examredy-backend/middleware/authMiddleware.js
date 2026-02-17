const jwt = require('jsonwebtoken');
const { query } = require('../db');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            // Fetch user from DB to ensure valid and attach to req
            const result = await query('SELECT id, username, email, role, is_premium, premium_expiry FROM users WHERE id = $1', [decoded.id]);

            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = result.rows[0];
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
