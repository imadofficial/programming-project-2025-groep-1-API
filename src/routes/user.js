const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

require('../auth/passportJWT.js');

const { addSkillToUser } = require('../sql/skills.js');
const { updateUser, deleteUserById, getUserById } = require('../sql/users.js');

const authAdmin = require('../auth/authAdmin.js');
const canEdit = require('../auth/canEdit.js');

const router = express.Router();


// POST /skills
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


// List of allowed columns for update
const allowedUserColumns = [
    'email', 'password'
];

// PUT /:userID
router.put('/:userID', passport.authenticate('jwt', { session: false }), canEdit, async (req, res) => {
    const userId = req.params['userID'];

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'No data provided for update' });
    }

    // Only allow valid fields
    const invalidKeys = Object.keys(data).filter(key => !allowedUserColumns.includes(key));
    if (invalidKeys.length > 0) {
        return res.status(400).json({ message: 'Invalid fields in update: ' + invalidKeys.join(', ') });
    }

    // Filter data to only allowed fields
    const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedUserColumns.includes(key)));

    // Validate password if provided
    if (filteredData.password && typeof filteredData.password !== 'string') {
        return res.status(400).json({ message: 'Password must be a string' });
    }

    // Check password length if provided
    if (filteredData.password && filteredData.password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // If password is provided, hash it
    if (filteredData.password) {
        // Get user type to determine salt rounds
        const userType = await getUserById(userId).then(user => user.type);

        const saltRounds = userType === 1 ? 14 : 11; // Use different salt rounds for admin vs regular users

        try {
            // Hash and map to wachtwoord for DB
            filteredData.wachtwoord = await bcrypt.hash(filteredData.password, saltRounds);

            // Remove the original password field (now renamed to wachtwoord)
            delete filteredData.password;
        } catch (error) {
            console.error('Error hashing password:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    try {
        const success = await updateUser(userId, filteredData);
        if (success) {
            res.json({ message: 'User updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found or not updated' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// DELETE /:userID
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