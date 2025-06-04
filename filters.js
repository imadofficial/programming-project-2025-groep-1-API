const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router()

const bedrijvenData = JSON.parse(fs.readFileSync(path.join('bedrijvenlijst.json'), 'utf8'));

router.get('/bedrijven', (req, res) => {
    res.json(bedrijvenData);
})

router.get('/bedrijven/:bedrijfID', (req, res) => {
    res.json(bedrijvenData[req.params['bedrijfID']]);
})

module.exports = router;
