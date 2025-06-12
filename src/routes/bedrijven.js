const express = require('express');
const passport = require('passport');
const { getAllBedrijven, getBedrijfById, getGoedgekeurdeBedrijven, getNietGoedgekeurdeBedrijven, keurBedrijfGoed, updateBedrijf } = require('../sql/bedrijven.js');
const authAdmin = require('../auth/authAdmin.js');
const canEdit = require('../auth/canEdit.js');

require('../auth/passportJWT.js');

const router = express.Router()


// GET /
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }
    const bedrijven = await getAllBedrijven();
    res.json(bedrijven);
});


// GET /goedgekeurd
router.get('/goedgekeurd', passport.authenticate('jwt', { session: false }), async (req, res) => {
   const bedrijven = await getGoedgekeurdeBedrijven();
   res.json(bedrijven);
});


// GET /nietgoedgekeurd
router.get('/nietgoedgekeurd', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const bedrijven = await getNietGoedgekeurdeBedrijven();
    res.json(bedrijven);
});


// GET /:bedrijfID
router.get('/:bedrijfID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const bedrijf = await getBedrijfById(req.params['bedrijfID']);
    res.json(bedrijf);
});


// POST /keur/:bedrijfID
router.post('/keur/:bedrijfID', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const bedrijfID = req.params['bedrijfID'];
    try {
        await keurBedrijfGoed(bedrijfID);
        res.status(200).json({ message: 'Bedrijf goedgekeurd' });
    } catch (error) {
        console.error('Error approving bedrijf:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// List of allowed columns for update
const allowedBedrijfColumns = [
    'naam', 'plaats', 'contact_email', 'linkedin', 'profiel_foto'
];

// PUT /:bedrijfID
router.put('/:bedrijfID', passport.authenticate('jwt', { session: false }), canEdit, async (req, res) => {
    const bedrijfId = req.params['bedrijfID'];

    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'No data provided for update' });
    }

    // Only allow valid fields
    const invalidKeys = Object.keys(data).filter(key => !allowedBedrijfColumns.includes(key));
    if (invalidKeys.length > 0) {
        return res.status(400).json({ message: 'Invalid fields in update: ' + invalidKeys.join(', ') });
    }

    // Filter data to only allowed fields
    const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedBedrijfColumns.includes(key)));

    try {
        const success = await updateBedrijf(bedrijfId, filteredData);
        if (success) {
            const updatedBedrijf = await getBedrijfById(bedrijfId);
            if (!updatedBedrijf) {
                return res.status(404).json({ message: 'Bedrijf not found' });
            }
            res.json({ message: 'Bedrijf updated successfully', bedrijf: updatedBedrijf });
        } else {
            res.status(404).json({ message: 'Bedrijf not found or not updated' });
        }
    } catch (error) {
        console.error('Error updating bedrijf:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;