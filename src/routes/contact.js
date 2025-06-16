const express = require('express');
const passport = require('passport');

require('dotenv').config();

require('../auth/passportJWT.js');

const router = express.Router();

const { createContact, deleteContact, getContactById, getAllContacts } = require('../sql/contact.js');
const authAdmin = require('../auth/authAdmin.js');


// GET /contact
router.get('/', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    try {
        const contacts = await getAllContacts();
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});


// GET /contact/:id
router.get('/:id', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'Contact ID is required' });
    }

    const contact = await getContactById(id);
    if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
});


// POST /contact
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { email, onderwerp, bericht } = req.body;

    if (!email || !onderwerp || !bericht) {
        return res.status(400).json({ error: 'Email, onderwerp and bericht are required' });
    }

    try {
        const contactId = await createContact(email, onderwerp, bericht);
        res.status(201).json({ message: 'Contact created successfully', id: contactId });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: 'Failed to create contact' });
    }
});

// DELETE /contact/:id
router.delete('/:id', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: 'Contact ID is required' });
    }

    try {
        const deleted = await deleteContact(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

module.exports = router;