const express = require('express');
const passport = require('passport');
const { getAllSkills } = require('../sql/skills.js');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const skills = await getAllSkills();
        res.json({
            message: 'List of skills',
            skills: skills.map(skill => ({
                id: skill.id,
                skill: skill.skill,
            }))
        });
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;