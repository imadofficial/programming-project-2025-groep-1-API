const express = require('express');
const passport = require('passport');
const { getAllSpeeddates, getSpeeddateById, getSpeeddatesByUserId, addSpeeddate, isDateAvailable, getInfo } = require('../sql/speeddates.js');

require('../auth/passportJWT.js');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }
    const speeddates = await getSpeeddatesByUserId(req.user.id);
    res.json(speeddates);
});

router.get('/:speeddateID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const speeddate = await getSpeeddateById(req.params['speeddateID']);
    if (speeddate) {
        res.json(speeddate);
    } else {
        res.status(404).json({ message: 'Speeddate not found' });
    }
});

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { bedrijf_id, student_id, datum } = req.body;
    if (!datum || !bedrijf_id || !student_id) {
        return res.status(400).json({ error: 'Datum (datetime), bedrijf_id, and student_id are required' });
    }

    // Check if datum is a valid ISO datetime string (date and time)
    const dateObj = new Date(datum);
    const isValidDate = !isNaN(dateObj.getTime());
    const hasTime = typeof datum === 'string' && datum.includes('T');
    if (!isValidDate || !hasTime) {
        return res.status(400).json({ error: 'Invalid datetime format. Use ISO 8601 (e.g., 2025-06-13T15:30:00)' });
    }

    if (isNaN(bedrijf_id) || isNaN(student_id)) {
        return res.status(400).json({ error: 'bedrijf_id and student_id must be valid numbers' });
    }

    const isAvailable = await isDateAvailable(bedrijf_id, student_id, datum);

    if (!isAvailable) {
        return res.status(400).json({ error: 'The selected date and time is not available for the student or company' });
    }

    try {
        const newSpeeddate = await addSpeeddate(bedrijf_id, student_id, datum);
        if (newSpeeddate) {
            const info = await getInfo(newSpeeddate);
            res.status(201).json({ message: 'Speeddate created successfully', speeddate: info });
        } else {
            res.status(400).json({ message: 'Failed to create speeddate' });
        }
    } catch (error) {
        console.error('Error creating speeddate:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;