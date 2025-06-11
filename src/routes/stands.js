const express = require('express');
const passport = require('passport');
const { getAllStands } = require('../sql/stands.js');

require('../auth/passportJWT.js');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const stands = await getAllStands();
        res.json(stands);
    } catch (error) {
        console.error('Error fetching stands:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});