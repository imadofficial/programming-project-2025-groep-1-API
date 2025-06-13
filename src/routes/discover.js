const express = require('express');
const passport = require('passport');
const { getDiscoverBedrijven, getDiscoverStudenten } = require('../sql/discover.js');

require('../auth/passportJWT.js');

const router = express.Router();

// GET /discover/bedrijven
router.get('/bedrijven', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // Get studentId from authenticated user
    const studentId = req.query.id ? req.query.id : req.user.id;

    // Check if suggestion parameter is provided
    const suggestions = req.query.suggestions === undefined ? true : req.query.suggestions === 'true';

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }
    try {
        const rows = await getDiscoverBedrijven(studentId, suggestions);
        res.json(rows);
    } catch (error) {
        console.error('Error in /discover/bedrijven:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /discover/studenten
router.get('/studenten', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // Get bedrijfId from authenticated user
    const bedrijfId = req.query.id ? req.query.id : req.user.id;

    // Check if suggestion parameter is provided
    const suggestions = req.query.suggestions === undefined ? true : req.query.suggestions === 'true';

    if (!bedrijfId) {
        return res.status(400).json({ error: 'Bedrijf ID is required' });
    }
    try {
        const rows = await getDiscoverStudenten(bedrijfId, suggestions);
        res.json(rows);
    } catch (error) {
        console.error('Error in /discover/studenten:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;