const express = require('express');
const passport = require('passport');
const { getAllOpleidingen } = require('../sql/opleidingen.js');
const { addOpleiding, getOpleidingById, deleteOpleiding } = require('../sql/opleiding.js');
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
        res.status(201).json({ message: 'Opleiding created successfully', opleiding: await getOpleidingById(newOpleiding) });
    } catch (error) {
        console.error('Error creating opleiding:', error);
        res.status(500).json({ error: 'Failed to create opleiding' });
    }
});

router.get('/:opleidingId', async (req, res) => {
    const opleidingId = req.params.opleidingId;

    try {
        const opleiding = await getOpleidingById(opleidingId);
        if (!opleiding) {
            return res.status(404).json({ error: 'Opleiding not found' });
        }
        res.json(opleiding);
    } catch (error) {
        console.error('Error fetching opleiding:', error);
        res.status(500).json({ error: 'Failed to fetch opleiding' });
    }
});

router.delete('/:opleidingId', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const opleidingId = req.params.opleidingId;

    try {
        await deleteOpleiding(opleidingId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting opleiding:', error);
        res.status(500).json({ error: 'Failed to delete opleiding' });
    }
});
        
module.exports = router;