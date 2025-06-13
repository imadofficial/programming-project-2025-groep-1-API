const express = require('express');
const passport = require('passport');
const { getAllSkills, removeSkill, addSkill } = require('../sql/skills.js');
const authAdmin = require('../auth/authAdmin.js');

require('../auth/passportJWT.js');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const skills = await getAllSkills();
        res.json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/', [passport.authenticate('jwt', { session: false })], async (req, res) => {
    const { naam } = req.body;
    if (!naam) {
        return res.status(400).json({ error: 'Skill name is required' });
    }

    try {
        const newSkill = await addSkill(naam);
        res.status(201).json(newSkill);
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.delete('/:skillID', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const skillId = req.params['skillID'];
    if (!skillId) {
        return res.status(400).json({ error: 'Skill ID is required' });
    }

    try {
        await removeSkill(skillId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;