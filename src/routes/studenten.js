const express = require('express');
const passport = require('passport');
const { getAllStudenten, getStudentById } = require('../sql/studenten.js');

require('../auth/passportJWT.js');

const router = express.Router()


router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }

    const studenten = await getAllStudenten();
    res.json(studenten);
})

router.get('/:studentID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const student = await getStudentById(req.params['studentID']);
    res.json(student);
})

module.exports = router;