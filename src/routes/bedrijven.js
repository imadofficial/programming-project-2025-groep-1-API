const express = require('express');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const { getPool } = require('../globalEntries.js');

const router = express.Router()

const bedrijvenData = JSON.parse(fs.readFileSync(path.join('data/bedrijvenlijst.json'), 'utf8'));


router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }
    res.json(bedrijvenData);
})

router.get('/:bedrijfID', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json(bedrijvenData[req.params['bedrijfID']]);
})

module.exports = router;