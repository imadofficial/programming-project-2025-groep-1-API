const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

async function getSpeeddateById(id) {
    const pool = getPool('ehbmatchdev');
    const query = `
        SELECT s.id, s.id_bedrijf, b.naam AS naam_bedrijf, b.profiel_foto AS profiel_foto_bedrijf, sec.naam AS sector_bedrijf, s.id_student, st.voornaam AS voornaam_student, st.achternaam AS achternaam_student, st.profiel_foto AS profiel_foto_student, s.datum
        FROM speeddate s
        LEFT JOIN student st ON s.id_student = st.id
        LEFT JOIN bedrijf b ON s.id_bedrijf = b.id
        LEFT JOIN sector sec ON b.id_sector = sec.id
        WHERE (s.id_bedrijf = ? OR s.id_student = ?)
    `;
    try {
        const [rows] = await pool.query(query, [id, id]);
        // Map each row to omit datum, add begin/einde
        return rows.map(speeddate => {
            const { datum, ...rest } = speeddate;
            const begin = datum;
            const einde = new Date(new Date(begin).getTime() + 10 * 60 * 1000).toISOString();
            return {
                ...rest,
                begin,
                einde,
            };
        });
    } catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}

// function to get all speeddates by user ID (id_bedrijf or id_student)
async function getSpeeddatesByUserId(id) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM speeddate WHERE id_bedrijf = ? OR id_student = ?';

    try {
        const [rows] = await pool.query(query, [id, id]);
        console.log('Query result:', rows); // Log the query result
        if (rows.length > 0) {
            return rows; // Return all speeddates for the user
        } else {
            return []; // Return an empty array if no speeddates are found
        }
    } catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}

async function getAcceptedSpeeddatesByUserId(id) {
    const pool = getPool('ehbmatchdev');
    const query = `
        SELECT s.id, s.id_bedrijf, b.naam AS naam_bedrijf, b.profiel_foto AS profiel_foto_bedrijf, sec.naam AS sector_bedrijf, s.id_student, st.voornaam AS voornaam_student, st.achternaam AS achternaam_student, st.profiel_foto AS profiel_foto_student, s.datum
        FROM speeddate s
        LEFT JOIN student st ON s.id_student = st.gebruiker_id
        LEFT JOIN bedrijf b ON s.id_bedrijf = b.gebruiker_id
        LEFT JOIN sector sec ON b.id_sector = sec.id
        WHERE (s.id_bedrijf = ? OR s.id_student = ?) AND s.akkoord = 1
    `;
    try {
        const [rows] = await pool.query(query, [id, id]);
        // Map each row to omit datum, add begin/einde
        return rows.map(speeddate => {
            const { datum, ...rest } = speeddate;
            const begin = datum.replace(' ', 'T'); // Convert to ISO format
            const einde = new Date(new Date(begin).getTime() + 10 * 60 * 1000).toISOString();
            return {
                ...rest,
                begin,
                einde,
            };
        });
    } catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}

async function getRejectedSpeeddatesByUserId(id) {
    const pool = getPool('ehbmatchdev');
    const query = `
        SELECT s.id, s.id_bedrijf, b.naam AS naam_bedrijf, b.profiel_foto AS profiel_foto_bedrijf, sec.naam AS sector_bedrijf, s.id_student, st.voornaam AS voornaam_student, st.achternaam AS achternaam_student, st.profiel_foto AS profiel_foto_student, s.datum
        FROM speeddate s
        LEFT JOIN student st ON s.id_student = st.gebruiker_id
        LEFT JOIN bedrijf b ON s.id_bedrijf = b.gebruiker_id
        LEFT JOIN sector sec ON b.id_sector = sec.id
        WHERE (s.id_bedrijf = ? OR s.id_student = ?) AND s.akkoord = 0
    `;
    try {
        const [rows] = await pool.query(query, [id, id]);
        // Map each row to omit datum, add begin/einde
        return rows.map(speeddate => {
            const { datum, ...rest } = speeddate;
            const begin = datum.replace(' ', 'T'); // Convert to ISO format
            const einde = new Date(new Date(begin).getTime() + 10 * 60 * 1000).toISOString();
            return {
                ...rest,
                begin,
                einde,
            };
        });
    } catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}

async function isDateAvailable(id_bedrijf, id_student, datum) {
    const pool = getPool('ehbmatchdev');
    // Calculate 10-minute window (+10 minutes)
    const dateObj = new Date(datum.replace(' ', 'T')); // Convert to ISO format
    if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
    }
    const startWindow = new Date(dateObj.getTime());
    const endWindow = new Date(dateObj.getTime() + 10 * 60 * 1000); // 10 min after
    // Query for overlapping speeddates for the same student or company
    const query = `SELECT * FROM speeddate 
        WHERE (id_bedrijf = ? OR id_student = ?)
        AND datum >= ?
        AND datum < ?`;
    try {
        const [rows] = await pool.query(query, [id_bedrijf, id_student, startWindow, endWindow]);
        return rows.length === 0; // true if available, false if overlap
    } catch (error) {
        console.error('Database query error in isDateAvailable:', error.message, error.stack);
        throw new Error('Checking date availability failed');
    }
}

async function getAllSpeeddates() {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM speeddate';

    try {
        const [rows] = await pool.query(query);
        console.log('Query result:', rows); // Log the query result
        if (rows.length > 0) {
            return rows; // Return all speeddates
        } else {
            return []; // Return an empty array if no speeddates are found
        }
    } catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}

async function getDatum(id) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT datum FROM speeddate WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0].datum; // Return the date of the speeddate
        } else {
            return null; // Return null if no date is found
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function speeddateAkkoord(id){
    const pool = getPool('ehbmatchdev');
    const query = 'UPDATE speeddate SET akkoord = 1 WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0; // Return true if a row was updated
    } catch (error) {
        console.error('Database query error in speeddateAkkoord:', error.message, error.stack);
        throw new Error('Speeddate agreement update failed');
    }
}

async function speeddateAfgekeurd(id){
    const pool = getPool('ehbmatchdev');
    const query = 'DELETE FROM speeddate WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0; // Return true if a row was updated
    } catch (error) {
        console.error('Database query error in speeddateAfgekeurd:', error.message, error.stack);
        throw new Error('Speeddate rejection update failed');
    }
}

async function addSpeeddate(id_bedrijf, id_student, datum) {
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO speeddate (id_bedrijf, id_student, datum) VALUES (?,?, ?)';

    try {
        const [result] = await pool.query(query, [id_bedrijf, id_student, datum]);
        console.log('Speeddate added with ID:', result.insertId); // Log the ID of the newly inserted speeddate
        return result.insertId; // Return the ID of the newly inserted speeddate
    } catch (error) {
        console.error('Database query error in addSpeeddate:', error.message, error.stack);
        throw new Error('Adding speeddate failed');
    }
}

async function getSpeeddateInfo(id) {
    const pool = getPool('ehbmatchdev');
    // Join with users and bedrijven to get names, and sector
    const query = `
        SELECT s.id, s.id_bedrijf, b.naam AS naam_bedrijf, b.profiel_foto AS profiel_foto_bedrijf, b.id_sector, sec.naam AS naam_sector, s.id_student, st.voornaam AS voornaam_student, st.achternaam AS achternaam_student, st.profiel_foto AS profiel_foto_student, s.datum
        FROM speeddate s
        LEFT JOIN student st ON s.id_student = st.gebruiker_id
        LEFT JOIN bedrijf b ON s.id_bedrijf = b.gebruiker_id
        LEFT JOIN sector sec ON b.id_sector = sec.id
        WHERE s.id = ?
    `;
    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            const speeddate = rows[0];
            // Rename datum to begin and add einde (10 minutes later), omit datum
            const { datum, ...rest } = speeddate;
            const begin = datum.replace(' ', 'T'); // Convert to ISO format
            const einde = new Date(new Date(begin).getTime() + 10 * 60 * 1000).toISOString();
            return {
                ...rest,
                begin,
                einde,
            };
        } else {
            return null; // Return null if no row is found
        }
    } catch (error) {
        console.error('Database query error in getInfo:', error.message, error.stack);
        throw new Error('Getting speeddate info failed');
    }
}

module.exports = {
    getSpeeddateById,
    getSpeeddatesByUserId,
    getAllSpeeddates,
    getDatum,
    speeddateAkkoord,
    speeddateAfgekeurd,
    addSpeeddate,
    getSpeeddateInfo,
    isDateAvailable,
    getAcceptedSpeeddatesByUserId,
    getRejectedSpeeddatesByUserId,
};