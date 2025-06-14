module.exports = (req, res, next) => {
    if (req.user.type !== 1) return res.status(403).json({ error: 'Forbidden: Only admins can access this resource' });
    next();
};