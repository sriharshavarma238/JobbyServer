const jwt = require('jsonwebtoken');

const { JWT_USER_PASSWORD } = require('../config');

function userAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid or missing token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_USER_PASSWORD);

        req.userId = decoded.id;
        req.user = decoded;

        next();
    } catch (err) {
        res.status(401).json({
            message: "Invalid or missing token."
        });
    }
}

module.exports = {
    userAuth
}