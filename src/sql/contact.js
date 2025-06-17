const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

async function createContact(email, onderwerp, bericht) {
    const pool = getPool('ehbmatchdev');
    const query = 'insert into contact (email, onderwerp, bericht) values (?, ?, ?)';

    try {
        const [result] = await pool.query(query, [email, onderwerp, bericht]);
        return result.insertId; // Return the ID of the newly inserted contact
    } catch (error) {
        console.error('Database query error in createContact:', error.message, error.stack);
        throw new Error('Creating contact failed');
    }
}




async function deleteContact(id_contact) {
    const pool = getPool('ehbmatchdev');
    const query = 'DELETE FROM contact WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id_contact]);
        return result.affectedRows > 0; // Return true if a row was deleted
    } catch (error) {
        console.error('Database query error in deleteContact:', error.message, error.stack);
        throw new Error('Deleting contact failed');
    }
}

async function getContactById(id_contact) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM contact WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id_contact]);
        if (rows.length > 0) {
            return rows[0]; // Return the first row if found
        } else {
            return null; // Return null if no contact is found
        }
    } catch (error) {
        console.error('Database query error in getContactById:', error.message, error.stack);
        throw new Error('Getting contact by ID failed');
    }
}   

async function getAllContacts() {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM contact';

    try {
        const [rows] = await pool.query(query);
        return rows; // Return all rows
    } catch (error) {
        console.error('Database query error in getAllContacts:', error.message, error.stack);
        throw new Error('Getting all contacts failed');
    }
}

module.exports = {
    createContact,
    deleteContact,
    getContactById,
    getAllContacts
};