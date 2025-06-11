const express = require('express');
const passport = require('passport');
const { getAllStands, getStandById, addStand, removeStand } = require('../sql/stands.js');
const authAdmin = require('../auth/authAdmin.js');

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

router.get('/:standId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const stand = getStandById(req.params['standId']);

    if (!stand) {
        return res.status(404).json({ message: 'Stand not found' });
    }

    res.json(stand);
});

router.post('/', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const { lokaal, id_bedrijf } = req.body;
    if (!lokaal || !id_bedrijf) {
        return res.status(400).json({ message: 'Lokaal and id_bedrijf are required' });
    }

    try {
        const newStand = await addStand(lokaal, id_bedrijf);
        res.status(201).json(newStand);
    } catch (error) {
        console.error('Error adding stand:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:standId', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const standId = req.params['standId'];

    if (!standId) {
        return res.status(400).json({ message: 'Stand ID is required' });
    }

    try {
        const result = await removeStand(standId);
        if (result) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Stand not found' });
        }
    } catch (error) {
        console.error('Error removing stand:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;