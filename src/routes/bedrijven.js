const express = require('express');
const passport = require('passport');
const { getAlleBedrijven, getBedrijfById, getGoedgekeurdeBedrijven } = require('../sql/bedrijven.js');

require('../auth/passportJWT.js');

const router = express.Router()


router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }
    const bedrijven = await getAlleBedrijven();
    res.json(bedrijven);
})

router.get('/:bedrijfID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const bedrijf = await getBedrijfById(req.params['bedrijfID']);
    res.json(bedrijf);
})

module.exports = router;