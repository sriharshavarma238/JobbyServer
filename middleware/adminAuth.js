const jwt = require('jsonwebtoken');

const { JWT_ADMIN_PASSWORD } = require('../config')

function adminAuth(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid or missing token.' });
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD)

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        req.adminId = decoded.id;
        req.admin = decoded;

        next();

    } catch (err) {
        return res.status(401).json({ message: 'Invalid or missing token.' });
    }

}

module.exports = { adminAuth }