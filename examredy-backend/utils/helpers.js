const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (id, role, email) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.warn('⚠️ Critical: JWT_SECRET not found in environment, using insecure fallback.');
    }
    return jwt.sign({ id, role, email }, secret || 'dev-secret-123', {
        expiresIn: '7d',
    });
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken
};
