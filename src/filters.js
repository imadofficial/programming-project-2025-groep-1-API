const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('./authentication.js');

const router = express.Router()

const bedrijvenData = JSON.parse(fs.readFileSync(path.join('data/bedrijvenlijst.json'), 'utf8'));

router.get('/bedrijven', auth.authenticate, (req, res) => {
    res.json(bedrijvenData);
})

router.get('/bedrijven/:bedrijfID', auth.authenticate, (req, res) => {
    res.json(bedrijvenData[req.params['bedrijfID']]);
})

module.exports = router;