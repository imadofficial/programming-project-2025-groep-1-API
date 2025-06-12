const express = require('express');
const passport = require('passport');

require('../auth/passportJWT.js');

const { addSkillToUser } = require('../sql/skills.js');
const authAdmin = require('../auth/authAdmin.js');
const { deleteUserById } = require('../sql/users.js');

const router = express.Router();

router.post('/skills', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { id_skill } = req.body;

    const id_gebruiker = req.user.id;

    if (!id_skill) {
        return res.status(400).json({ error: 'id_skill is required' });
    }

    try {
        const result = await addSkillToUser(id_gebruiker, id_skill);
        res.status(201).json({ message: 'Skill added successfully', skillId: result });
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ error: 'Failed to add skill' });
    }
});

router.delete('/:userID', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const userId = req.params['userID'];
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        await deleteUserById(userId);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});



module.exports = router;