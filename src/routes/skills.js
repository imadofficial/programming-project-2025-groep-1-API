const express = require('express');
const passport = require('passport');
const { getAllSkills } = require('../sql/skills.js');

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

module.exports = router;