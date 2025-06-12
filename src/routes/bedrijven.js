const express = require('express');
const passport = require('passport');
const { getAllBedrijven, getBedrijfById, getGoedgekeurdeBedrijven, getNietGoedgekeurdeBedrijven, keurBedrijfGoed } = require('../sql/bedrijven.js');
const authAdmin = require('../auth/authAdmin.js');

require('../auth/passportJWT.js');

const router = express.Router()


router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }
    const bedrijven = await getAllBedrijven();
    res.json(bedrijven);
});

router.get('/:bedrijfID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const bedrijf = await getBedrijfById(req.params['bedrijfID']);
    res.json(bedrijf);
});

router.get('/goedgekeurd', passport.authenticate('jwt', { session: false }), async (req, res) => {
   const bedrijven = await getGoedgekeurdeBedrijven();
   res.json(bedrijven);
});

router.get('/nietgoedgekeurd', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const bedrijven = await getNietGoedgekeurdeBedrijven();
    res.json(bedrijven);
});

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

module.exports = router;