const express = require('express');
const passport = require('passport');
const { getAllOpleidingen } = require('../sql/opleidingen.js');
const { addOpleiding } = require('../sql/opleiding.js');
const authAdmin = require('../auth/authAdmin.js');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const opleidingen = await getAllOpleidingen();
        res.json(opleidingen);
    } catch (error) {
        console.error('Error fetching opleidingen:', error);
        res.status(500).json({ error: 'Failed to fetch opleidingen' });
    }
});

router.post('/', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const { naam, type } = req.body;

    try {
        const newOpleiding = await addOpleiding(naam, type);
        res.status(201).json(newOpleiding);
    } catch (error) {
        console.error('Error creating opleiding:', error);
        res.status(500).json({ error: 'Failed to create opleiding' });
    }
});

module.exports = router;