const express = require('express');
const passport = require('passport');
const { getAllSkills, removeSkill, addSkill, getSkillById } = require('../sql/skills.js');
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

router.get('/:skillID', async (req, res) => {
    const skillId = req.params['skillID'];
    if (!skillId) {
        return res.status(400).json({ error: 'Skill ID is required' });
    }

    try {
        const skill = await getSkillById(skillId);
        if (!skill) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        res.json({ message: 'Skill retrieved successfully', skill: { id: skill.id, naam: skill.naam, type: skill.type } });
    } catch (error) {
        console.error('Error fetching skill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/', [passport.authenticate('jwt', { session: false })], async (req, res) => {
    const { naam, type } = req.body;
    if (!naam) {
        return res.status(400).json({ error: 'Skill name is required' });
    }

    if (!type) {
        return res.status(400).json({ error: 'Skill type is required' });
    }

    try {
        const newSkill = await addSkill(naam, type);
        res.status(201).json({ message: 'Skill added successfully', skill: { id: newSkill.id, naam: naam, type: type } });
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