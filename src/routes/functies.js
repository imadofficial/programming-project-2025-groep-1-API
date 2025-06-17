const express = require('express');
const passport = require('passport');

require('../auth/passportJWT.js');

const router = express.Router();

const { getAllFuncties, getFunctieById, addFunctie, removeFunctie } = require('../sql/functie.js');
const authAdmin = require('../auth/authAdmin.js');

// GET /
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const functies = await getAllFuncties();
        res.json(functies);
    } catch (error) {
        console.error('Error fetching functies:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// GET /:functieID
router.get('/:functieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const functie = await getFunctieById(req.params['functieID']);
        if (functie) {
            res.json(functie);
        } else {
            res.status(404).json({ message: 'Functie not found' });
        }
    } catch (error) {
        console.error('Error fetching functie:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// POST /
router.post('/', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const { naam } = req.body;

    if (!naam) {
        return res.status(400).json({ error: 'Naam is required' });
    }

    try {
        const functieId = await addFunctie(naam);
        res.status(201).json({ message: 'Functie added successfully', functieId });
    } catch (error) {
        console.error('Error adding functie:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// DELETE /:functieID
router.delete('/:functieID', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    try {
        const success = await removeFunctie(req.params['functieID']);
        if (success) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Functie not found' });
        }
    } catch (error) {
        console.error('Error removing functie:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;