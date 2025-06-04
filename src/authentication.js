require('dotenv').config();


const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token || token !== process.env.TOKEN) {
        return res.status(403).json({ error: 'Forbidden: Invalid or missing token' });
    }
    
    next();
}

module.exports = {
    authenticate
};