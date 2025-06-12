const express = require('express');
const passport = require('passport');
const { getAllSpeeddates, getSpeeddateById, getSpeeddatesByUserId } = require('../sql/speeddates.js');

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