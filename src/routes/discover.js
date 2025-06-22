const express = require('express');
const passport = require('passport');
const { getDiscoverBedrijven, getDiscoverStudenten } = require('../sql/discover.js');

require('../auth/passportJWT.js');

const router = express.Router();

// GET /discover/bedrijven
router.get('/bedrijven', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // Get studentId from authenticated user
    let studentId = req.query.id ? req.query.id : req.user.id;
    let limit = req.query.limit ? parseInt(req.query.limit, 10) : null; // Default limit to null (no limit)
    let offset = req.query.offset ? parseInt(req.query.offset, 10) : 0; // Default offset to 0

    // Parse and validate studentId as integer
    studentId = parseInt(studentId, 10);
    if (isNaN(studentId)) {
        return res.status(400).json({ error: 'Student ID must be a valid integer' });
    }

    // Check if suggestion parameter is provided
    const suggestions = req.query.suggestions === undefined ? true : req.query.suggestions === 'true';

    const onlyNew = req.query.onlyNew === undefined ? false : req.query.onlyNew === 'true';

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }
    try {
        const rows = await getDiscoverBedrijven(studentId, suggestions, onlyNew, limit, offset);
        res.json(rows);
    } catch (error) {
        console.error('Error in /discover/bedrijven:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /discover/studenten
router.get('/studenten', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // Get bedrijfId from authenticated user
    let bedrijfId = req.query.id ? req.query.id : req.user.id;
    let limit = req.query.limit ? parseInt(req.query.limit, 10) : null; // Default limit to null (no limit)
    let offset = req.query.offset ? parseInt(req.query.offset, 10) : 0; // Default offset to 0

    // Parse and validate bedrijfId as integer
    bedrijfId = parseInt(bedrijfId, 10);
    if (isNaN(bedrijfId)) {
        return res.status(400).json({ error: 'Bedrijf ID must be a valid integer' });
    }

    // Check if suggestion parameter is provided
    const suggestions = req.query.suggestions === undefined ? true : req.query.suggestions === 'true';

    const onlyNew = req.query.onlyNew === undefined ? false : req.query.onlyNew === 'true';

    if (!bedrijfId) {
        return res.status(400).json({ error: 'Bedrijf ID is required' });
    }
    try {
        const rows = await getDiscoverStudenten(bedrijfId, suggestions, onlyNew, limit, offset);
        res.json(rows);
    } catch (error) {
        console.error('Error in /discover/studenten:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;