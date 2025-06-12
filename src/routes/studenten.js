const express = require('express');
const passport = require('passport');
const { getAllStudenten, getStudentById } = require('../sql/studenten.js');
const { getSkillsByUserId } = require('../sql/skills.js');``

require('../auth/passportJWT.js');

const router = express.Router()


router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }

    const studenten = await getAllStudenten();
    for (const student of studenten) {
        student.skills = await getSkillsByUserId(student.id);
    }
    res.json(studenten);
})

router.get('/:studentID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const student = await getStudentById(req.params['studentID']);
    res.json(student);
})

router.get('/:studentID/skills', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const studentId = req.params['studentID'];
    if (!studentId) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    try {
        const skills = await getSkillsByUserId(studentId);
        res.json(skills);
    } catch (error) {
        console.error('Error fetching student skills:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;