const express = require('express');
const passport = require('passport');
const authAdmin = require('../auth/authAdmin.js');

require('../auth/passportJWT.js');

const router = express.Router();

const { getAllSectoren, getSectorById, addSector, deleteSector } = require('../sql/sectoren.js');

// GET /
router.get('/', async (req, res) => {
    try {
        const sectoren = await getAllSectoren();
        res.json(sectoren);
    } catch (error) {
        console.error('Error fetching sectoren:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// GET /:sectorID
router.get('/:sectorID', async (req, res) => {
    const sectorId = req.params['sectorID'];
    if (!sectorId) {
        return res.status(400).json({ error: 'Sector ID is required' });
    }

    try {
        const sector = await getSectorById(sectorId);
        if (!sector) {
            return res.status(404).json({ error: 'Sector not found' });
        }
        res.json(sector);
    } catch (error) {
        console.error('Error fetching sector:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// POST /
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { naam } = req.body;
    if (!naam) {
        return res.status(400).json({ error: 'Sector name is required' });
    }

    try {
        const newSector = await addSector(naam);
        res.status(201).json({ message: 'Sector added successfully', sector: newSector });
    } catch (error) {
        console.error('Error adding sector:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// DELETE /:sectorID
router.delete('/:sectorID', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const sectorId = req.params['sectorID'];
    if (!sectorId) {
        return res.status(400).json({ error: 'Sector ID is required' });
    }

    try {
        const deleted = await deleteSector(sectorId);
        if (!deleted) {
            return res.status(404).json({ error: 'Sector not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting sector:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;