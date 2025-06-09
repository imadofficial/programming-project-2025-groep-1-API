const express = require('express');
const passport = require('passport');
const { getAllOpleidingen } = require('../sql/opleidingen.js');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const opleidingen = await getAllOpleidingen();
        res.json(opleidingen);
    } catch (error) {
        console.error('Error fetching opleidingen:', error);
        res.status(500).json({ error: 'Failed to fetch opleidingen' });
    }
});

module.exports = router;