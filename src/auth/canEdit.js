// Universal middleware to check if user is self or admin
module.exports = function canEdit(req, res, next) {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized: User information is missing.' });
    }
    // Accept id from either req.params.id or req.params.userID (case-insensitive)
    const idParam = req.params.id || req.params.userID || req.params.gebruikerID || req.params.studentID || req.params.bedrijfID;
    if (!idParam) {
        return res.status(400).json({ message: 'No user id provided in route parameters' });
    }
    if (user.type === 1 || String(user.id) === String(idParam)) {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden: You can only update your own user record or must be admin.' });
};
