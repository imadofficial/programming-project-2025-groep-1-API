const express = require('express');
const passport = require('passport');
const { getAllStudenten, getStudentById, updateStudent } = require('../sql/studenten.js');
const { getSkillsByUserId, addSkillsToUser } = require('../sql/skills.js');
const canEdit = require('../auth/canEdit.js');

require('../auth/passportJWT.js');

const router = express.Router()


// GET /
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }

    const studenten = await getAllStudenten();
    await Promise.all(studenten.map(async (student) => {
        student.skills = await getSkillsByUserId(student.id);
    }));
    res.json(studenten);
})


// GET /:studentID
router.get('/:studentID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const student = await getStudentById(req.params['studentID']);
    res.json(student);
})


// GET /:studentID/skills
router.get('/:studentID/skills', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const studentId = req.params['studentID'];
    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    try {
        const skills = await getSkillsByUserId(studentId);
        res.json(skills);
    } catch (error) {
        console.error('Error fetching student skills:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/:studentID/skills', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const studentId = req.params['studentID'];
    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) {
        return res.status(400).json({ error: 'Skills must be an array' });
    }

    if (skills.length === 0) {
        return res.status(400).json({ error: 'Skills array cannot be empty' });
    }

    try {
        const success = await addSkillsToUser(studentId, skills);
        if (success) {
            res.status(201).json({ message: 'Skills added successfully', skills: await getSkillsByUserId(studentId) });
        } else {
            res.status(404).json({ message: 'Student not found or skills not added' });
        }
    } catch (error) {
        console.error('Error adding skills:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:studentID/skills', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const studentId = req.params['studentID'];
    const skillId = req.params['skillID'];

    if (!studentId || !skillId) {
        return res.status(400).json({ error: 'Student ID and Skill ID are required' });
    }

    try {
        const success = await removeSkillFromUser(studentId, skillId);
        if (success) {
            res.json({ message: 'Skill removed successfully', skills: await getSkillsByUserId(studentId) });
        } else {
            res.status(404).json({ message: 'Skill not found for this student' });
        }
    } catch (error) {
        console.error('Error removing skill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// List of allowed columns for update
const allowedStudentColumns = [
    'voornaam', 'achternaam', 'date_of_birth', 'linkedin', 'profiel_foto', 'studiejaar', 'opleiding_id'
];

// PUT /:studentID
router.put('/:studentID', passport.authenticate('jwt', { session: false }), canEdit, async (req, res) => {
    const studentId = req.params.studentID;

    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'No data provided for update' });
    }

    // Only allow valid fields
    const invalidKeys = Object.keys(data).filter(key => !allowedStudentColumns.includes(key));
    if (invalidKeys.length > 0) {
        return res.status(400).json({ message: 'Invalid fields in update: ' + invalidKeys.join(', ') });
    }

    // Filter data to only allowed fields
    const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedStudentColumns.includes(key)));

    try {
        const success = await updateStudent(studentId, filteredData);
        if (success) {
            // Fetch the updated student and their skills
            const updatedStudent = await getStudentById(studentId);
            if (updatedStudent) {
                res.json({ message: "Student updated successfully", student: updatedStudent });
            } else {
                res.status(404).json({ message: 'Student not found after update' });
            }
        } else {
            res.status(404).json({ message: 'Student not found or not updated' });
        }
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;