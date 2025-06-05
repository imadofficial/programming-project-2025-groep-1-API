const express = require('express');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const { getPool } = require('../globalEntries.js');

require('../auth/passportJWT.js');

const router = express.Router()

const studentenData = JSON.parse(fs.readFileSync(path.join('data/studentenlijst.json'), 'utf8'));


router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }
    res.json(studentenData);
})

router.get('/:studentID', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json(studentenData[req.params['studentID']]);
})

module.exports = router;