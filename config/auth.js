import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './conf.js';
import { unauthorized, forbidden } from '../utils/httpResponses.js';

export function verifyToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return unauthorized(res, 'Unauthorized');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return forbidden(res, 'Invalid or expired token');
    }
}

export function verifyTokenOptional(req, res, next) {
    const token = req.cookies.token;
    if (!token) return next();
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
    } catch (_) {}
    next();
}

export function verifyAdmin(req, res, next) {
    if (!req.user) {
        return unauthorized(res, 'Authentication required');
    }
    if (req.user.role !== 'admin') {
        return forbidden(res, 'Admin access required');
    }
    next();
}

export default verifyToken;
