const { getPool } = require('../globalEntries.js');

const dotenv = require('dotenv');

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'ehbmatchdev';

async function getAllEvents() {
    const pool = getPool(DB_NAME);
    const query = 'SELECT * FROM evenement';

    try {
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error('Database query error in getAllEvents:', error.message, error.stack);
        throw new Error('Getting all events failed');
    }
}


async function addBedrijfToEvent(id_bedrijf, id_event, begin = '2025-10-01 10:00:00', einde = '2025-10-01 18:00:00') {
    const pool = getPool(DB_NAME);
    const query = 'INSERT INTO bedrijf_evenement (evenement_id, bedrijf_id, begin, einde) VALUES (?, ?, ?, ?)';

    try {
        const [result] = await pool.query(query, [id_event, id_bedrijf, begin, einde]);
        return result.affectedRows > 0; // Return true if a row was inserted
    } catch (error) {
        console.error('Database query error in addBedrijfToEvent:', error.message, error.stack);
        throw new Error('Adding bedrijf to event failed');
    }
}


async function getEventsByBedrijfId(id_bedrijf) {
    const pool = getPool(DB_NAME);
    const query = `
        SELECT be.evenement_id, be.begin, be.einde
        FROM bedrijf_evenement be
        WHERE be.bedrijf_id = ?
    `;

    try {
        const [rows] = await pool.query(query, [id_bedrijf]);
        return rows;
    } catch (error) {
        console.error('Database query error in getEventsByBedrijfId:', error.message, error.stack);
        throw new Error('Getting events by bedrijf ID failed');
    }
}

module.exports = {
    getAllEvents,
    addBedrijfToEvent,
    getEventsByBedrijfId
};