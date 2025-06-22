// Universal middleware to check if user is self or admin

const {  getLinkedUser } = require('../sql/profielFoto.js');

function canEdit(req, res, next) {
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
}

async function canEditProfilePicture(req, res, next) {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized: User information is missing.' });
    }
    const linkedUserId = await getLinkedUser(req.params.fotoKey);
    if (!linkedUserId) {
        return res.status(404).json({ message: 'Profile picture not found or not linked to any user.' });
    }
    
    if (user.id === linkedUserId || user.type === 1) {
        return next();
    }
    
    return res.status(403).json({ message: 'Forbidden: You can only update your own profile picture or must be admin.' });
}

module.exports = {
    canEdit,
    canEditProfilePicture
};
