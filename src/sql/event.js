const { getPool } = require('../globalEntries.js');

const dotenv = require('dotenv');

dotenv.config();

async function getAllEvents() {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM evenement';

    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error('Database query error in getAllEvents:', error.message, error.stack);
        throw new Error('Getting all events failed');
    }
}


async function addBedrijfToEvent(id_bedrijf, id_event) {
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO evenement_bedrijf (id_event, id_bedrijf) VALUES (?, ?)';

    try {
        const [result] = await pool.query(query, [id_event, id_bedrijf]);
        return result.affectedRows > 0; // Return true if a row was inserted
    } catch (error) {
        console.error('Database query error in addBedrijfToEvent:', error.message, error.stack);
        throw new Error('Adding bedrijf to event failed');
    }
}

module.exports = {
    getAllEvents,
    addBedrijfToEvent
};