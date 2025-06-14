const express = require('express');
const passport = require('passport');
const { getAllBedrijven, getBedrijfById, getGoedgekeurdeBedrijven, getNietGoedgekeurdeBedrijven, keurBedrijfGoed, updateBedrijf } = require('../sql/bedrijven.js');
const { addSkillToUser, removeSkillFromUser, getSkillsByUserId, addSkillsToUser } = require('../sql/skills.js');
const { getFunctiesByUserId, addFunctiesToUser, removeFunctieFromUser } = require('../sql/functie.js');
const authAdmin = require('../auth/authAdmin.js');
const canEdit = require('../auth/canEdit.js');

require('../auth/passportJWT.js');

const router = express.Router()


// GET /
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    for (const [param, value] of Object.entries(req.query)) {
        console.log(param, value);
    }
    const bedrijven = await getAllBedrijven();
    res.json(bedrijven);
});


// GET /goedgekeurd
router.get('/goedgekeurd', passport.authenticate('jwt', { session: false }), async (req, res) => {
   const bedrijven = await getGoedgekeurdeBedrijven();
   res.json(bedrijven);
});


// GET /nietgoedgekeurd
router.get('/nietgoedgekeurd', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const bedrijven = await getNietGoedgekeurdeBedrijven();
    res.json(bedrijven);
});


// GET /:bedrijfID
router.get('/:bedrijfID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const bedrijf = await getBedrijfById(req.params['bedrijfID']);
    res.json(bedrijf);
});


// POST /keur/:bedrijfID
router.post('/keur/:bedrijfID', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const bedrijfID = req.params['bedrijfID'];
    try {
        await keurBedrijfGoed(bedrijfID);
        res.status(200).json({ message: 'Bedrijf goedgekeurd' });
    } catch (error) {
        console.error('Error approving bedrijf:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// List of allowed columns for update
const allowedBedrijfColumns = [
    'naam', 'plaats', 'contact_email', 'linkedin', 'profiel_foto'
];

// PUT /:bedrijfID
router.put('/:bedrijfID', [passport.authenticate('jwt', { session: false }), canEdit], async (req, res) => {
    const bedrijfId = req.params['bedrijfID'];

    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ message: 'No data provided for update' });
    }

    // Only allow valid fields
    const invalidKeys = Object.keys(data).filter(key => !allowedBedrijfColumns.includes(key));
    if (invalidKeys.length > 0) {
        return res.status(400).json({ message: 'Invalid fields in update: ' + invalidKeys.join(', ') });
    }

    // Filter data to only allowed fields
    const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedBedrijfColumns.includes(key)));

    try {
        const success = await updateBedrijf(bedrijfId, filteredData);
        if (success) {
            const updatedBedrijf = await getBedrijfById(bedrijfId);
            if (!updatedBedrijf) {
                return res.status(404).json({ message: 'Bedrijf not found after update' });
            }
            res.json({ message: 'Bedrijf updated successfully', bedrijf: updatedBedrijf });
        } else {
            res.status(404).json({ message: 'Bedrijf not found or not updated' });
        }
    } catch (error) {
        console.error('Error updating bedrijf:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// GET /:bedrijfID/functies
router.get('/:bedrijfID/functies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const bedrijfId = req.params['bedrijfID'];
    if (!bedrijfId) {
        return res.status(400).json({ error: 'Bedrijf ID is required' });
    }

    try {
        const functies = await getFunctiesByUserId(bedrijfId);
        if (!functies) {
            return res.status(404).json({ message: 'Bedrijf not found' });
        }
        res.json(functies || []);
    } catch (error) {
        console.error('Error fetching functies:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// POST /:bedrijfID/functies
router.post('/:bedrijfID/functies', [passport.authenticate('jwt', { session: false }), canEdit], async (req, res) => {
    const bedrijfId = req.params['bedrijfID'];
    const { functies } = req.body;
    if (!bedrijfId) {
        return res.status(400).json({ error: 'Bedrijf ID is required' });
    }
    if (!functies || !Array.isArray(functies)) {
        return res.status(400).json({ error: 'Functies must be an array' });
    }

    try {
        const success = await addFunctiesToUser(bedrijfId, functies);
        if (success) {
            res.status(201).json({ message: 'Functies added successfully', functies: await getFunctiesByUserId(bedrijfId) });
        } else {
            res.status(404).json({ message: 'Bedrijf not found or functies not added' });
        }
    } catch (error) {
        console.error('Error adding functies:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// DELETE /:bedrijfID/functies/:functieID
router.delete('/:bedrijfID/functies/:functieID', [passport.authenticate('jwt', { session: false }), canEdit], async (req, res) => {
    const bedrijfId = req.params['bedrijfID'];
    const functieId = req.params['functieID'];

    if (!bedrijfId || !functieId) {
        return res.status(400).json({ error: 'Bedrijf ID and Functie ID are required' });
    }

    try {
        const success = await removeFunctieFromUser(bedrijfId, functieId);
        if (success) {
            res.json({ message: 'Functie removed successfully', functies: await getFunctiesByUserId(bedrijfId) });
        } else {
            res.status(404).json({ message: 'Functie not found for this bedrijf' });
        }
    } catch (error) {
        console.error('Error removing functie:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/:bedrijfID/skills', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const bedrijfId = req.params['bedrijfID'];
    if (!bedrijfId) {
        return res.status(400).json({ error: 'Bedrijf ID is required' });
    }

    try {
        const skills = await getSkillsByUserId(bedrijfId);
        res.json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /:bedrijfID/skills
router.post('/:bedrijfID/skills', [passport.authenticate('jwt', { session: false }), canEdit], async (req, res) => {
    const bedrijfId = req.params['bedrijfID'];
    if (!bedrijfId) {
        return res.status(400).json({ error: 'Bedrijf ID is required' });
    }

    let { skills } = req.body;
    if (!skills || !Array.isArray(skills)) {
        return res.status(400).json({ error: 'Skills must be an array' });
    }

    if (skills.length === 0) {
        return res.status(400).json({ error: 'Skills array cannot be empty' });
    }

    // Parse each skill to an integer
    skills = skills.map(skill => parseInt(skill, 10));

    // Validate each skill
    if (skills.some(skill => isNaN(skill) || skill <= 0)) {
        return res.status(400).json({ error: 'Each skill must be a valid positive integer' });
    }

    try {
        const success = await addSkillsToUser(bedrijfId, skills);
        if (success) {
            res.status(201).json({ message: 'Skills added successfully', skills: await getSkillsByUserId(bedrijfId) });
        } else {
            res.status(404).json({ message: 'Bedrijf not found or skills not added' });
        }
    } catch (error) {
        console.error('Error adding skills:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /:bedrijfID/skills/:skillID
router.delete('/:bedrijfID/skills/:skillID', [passport.authenticate('jwt', { session: false }), canEdit], async (req, res) => {
    const bedrijfId = req.params['bedrijfID'];
    const skillId = req.params['skillID'];

    if (!bedrijfId || !skillId) {
        return res.status(400).json({ error: 'Bedrijf ID and Skill ID are required' });
    }

    try {
        const success = await removeSkillFromUser(bedrijfId, skillId);
        if (success) {
            res.json({ message: 'Skill removed successfully', skills: await getSkillsByUserId(bedrijfId) });
        } else {
            res.status(404).json({ message: 'Skill not found for this bedrijf' });
        }
    } catch (error) {
        console.error('Error removing skill:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;