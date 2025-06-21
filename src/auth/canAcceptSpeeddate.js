// Middleware check if authenticated user is the id_student or id_bedrijf from the requested speeddate, or an admin
const { getPool } = require('../globalEntries.js');

const dotenv = require('dotenv');
dotenv.config();
const DB_NAME = process.env.DB_NAME || 'ehbmatch';

async function canAcceptSpeeddate(req, res, next) {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized: User information is missing.' });
    }

    const speeddateId = req.params.speeddateID;
    if (!speeddateId) {
        return res.status(400).json({ message: 'No speeddate id provided in route parameters' });
    }

    const pool = getPool(DB_NAME);
    const query = 'SELECT id_student, id_bedrijf, asked_by FROM speeddate WHERE id = ?';
    
    try {
        const [rows] = await pool.query(query, [speeddateId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Speeddate not found' });
        }

        const speeddate = rows[0];
        if (user.type === 1 || (user.id === speeddate.id_student && user.id !== speeddate.asked_by) || (user.id === speeddate.id_bedrijf && user.id !== speeddate.asked_by)) {
            return next();
        }

        return res.status(403).json({ message: 'Forbidden: You can only accept your own speeddates or must be admin.' });
    } catch (error) {
        console.error('Database query error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    canAcceptSpeeddate
};