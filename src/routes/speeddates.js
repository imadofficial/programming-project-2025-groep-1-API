const express = require('express');
const passport = require('passport');
const { getAllSpeeddates, getSpeeddateById, getSpeeddatesByUserId, addSpeeddate, isDateAvailable, getSpeeddateInfo, speeddateAkkoord, speeddateAfgekeurd, getAcceptedSpeeddatesByUserId, getRejectedSpeeddatesByUserId, getSpeeddateHistoryByUserId } = require('../sql/speeddates.js');

require('../auth/passportJWT.js');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }
    const id = req.query.id ? req.query.id : req.user.id;
    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    // Validate id as a number
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid User ID' });
    }
    const speeddates = await getSpeeddatesByUserId(userId);
    res.json(speeddates);
});

router.get('/history', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const id = req.query.id ? req.query.id : req.user.id;
    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    // Validate id as a number
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid User ID' });
    }
    const speeddates = await getSpeeddateHistoryByUserId(userId);
    res.json(speeddates);
});

router.get('/accepted', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const id = req.query.id ? req.query.id : req.user.id;
    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    // Validate id as a number
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid User ID' });
    }
    const speeddates = await getAcceptedSpeeddatesByUserId(userId);
    res.json(speeddates);
});

router.get('/pending', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const id = req.query.id ? req.query.id : req.user.id;
    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    // Validate id as a number
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid User ID' });
    }
    const speeddates = await getRejectedSpeeddatesByUserId(userId);
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
    const { id_bedrijf, id_student, datum } = req.body;
    if (!datum || !id_bedrijf || !id_student) {
        return res.status(400).json({ error: 'Datum (datetime), id_bedrijf, and id_student are required' });
    }

    // Check if datum is a valid MySQL DATETIME string (YYYY-MM-DD HH:MM:SS)
    const mysqlDatetimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    const isValidDate = typeof datum === 'string' && mysqlDatetimeRegex.test(datum);
    if (!isValidDate) {
        return res.status(400).json({ error: 'Invalid datetime format. Use MySQL DATETIME (e.g., 2025-06-13 15:30:00)' });
    }

    if (isNaN(id_bedrijf) || isNaN(id_student)) {
        return res.status(400).json({ error: 'id_bedrijf and id_student must be valid numbers' });
    }

    const isAvailable = await isDateAvailable(id_bedrijf, id_student, datum);

    if (!isAvailable) {
        return res.status(400).json({ error: 'The selected date and time is not available for the student or company' });
    }

    try {
        const newSpeeddate = await addSpeeddate(id_bedrijf, id_student, datum);
        if (newSpeeddate) {
            const info = await getSpeeddateInfo(newSpeeddate);
            res.status(201).json({ message: 'Speeddate created successfully', speeddate: info });
        } else {
            res.status(400).json({ message: 'Failed to create speeddate' });
        }
    } catch (error) {
        console.error('Error creating speeddate:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// POST /accept/:speeddateID
router.post('/accept/:speeddateID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const speeddateId = req.params['speeddateID'];
    if (!speeddateId) {
        return res.status(400).json({ error: 'Speeddate ID is required' });
    }
    try {
        const accepted = await speeddateAkkoord(speeddateId);
        if (!accepted) {
            return res.status(404).json({ error: 'Speeddate not found' });
        }
        const info = await getSpeeddateInfo(speeddateId);
        await sendNotification([info.id_bedrijf, info.id_student], 'Speeddate geaccepteerd', `Jouw speeddate met ${info.naam_bedrijf} om ${info.begin} is geaccepteerd.`);
        res.json({ message: 'Speeddate accepted', speeddate: info });
    } catch (error) {
        console.error('Error accepting speeddate:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// POST /reject/:speeddateID
router.post('/reject/:speeddateID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const speeddateId = req.params['speeddateID'];
    if (!speeddateId) {
        return res.status(400).json({ error: 'Speeddate ID is required' });
    }
    try {
        const rejected = await speeddateAfgekeurd(speeddateId);
        if (!rejected) {
            return res.status(404).json({ error: 'Speeddate not found' });
        }
        res.json({ message: 'Speeddate rejected' });
    } catch (error) {
        console.error('Error rejecting speeddate:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// GET /user/:userID/unavailable
router.get('/user/:userID/unavailable', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const userId = req.params['userID'];
    if (!userId) {
        return res.status(400).json({ error: 'userID is required' });
    }
    try {
        // Get all speeddates for the given id (bedrijf or student)
        const speeddates = await getSpeeddatesByUserId(userId);
        // Map to time windows
        const windows = speeddates.map(sd => {
            const id = sd.id;
            const begin = sd.datum;
            const einde = new Date(new Date(begin).getTime() + 10 * 60 * 1000).toISOString();
            return { id, begin, einde };
        });
        res.json(windows);
    } catch (error) {
        console.error('Error fetching unavailable time windows:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;