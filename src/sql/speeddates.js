const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

// Helper to construct profile photo URL
function getProfielFotoUrl(filename) {
    return filename ? `https://gt0kk4fbet.ufs.sh/f/${filename}` : null;
}

// Helper to map a speeddate row to API response
function mapSpeeddateRow(row, includeAkkoord = true, includeLokaal = true) {
    const { datum, profiel_foto_bedrijf, profiel_foto_student, ...rest } = row;
    const begin = datum instanceof Date ? datum.toISOString() : (datum ? datum.replace(' ', 'T') : null);
    const einde = begin ? new Date(new Date(begin).getTime() + 10 * 60 * 1000).toISOString() : null;
    const mapped = {
        ...rest,
        profiel_foto_bedrijf: getProfielFotoUrl(profiel_foto_bedrijf),
        profiel_foto_student: getProfielFotoUrl(profiel_foto_student),
        begin,
        einde,
    };
    if (includeAkkoord && typeof row.akkoord !== 'undefined') mapped.akkoord = row.akkoord;
    if (includeLokaal && typeof row.lokaal !== 'undefined') mapped.lokaal = row.lokaal;
    return mapped;
}

async function getSpeeddateById(id) {
    const pool = getPool('ehbmatchdev');
    const query = `
        SELECT s.id, s.asked_by AS asked_by, s.id_bedrijf, b.naam AS naam_bedrijf, b.profiel_foto AS profiel_foto_bedrijf, sec.naam AS sector_bedrijf, s.id_student, st.voornaam AS voornaam_student, st.achternaam AS achternaam_student, st.profiel_foto AS profiel_foto_student, s.akkoord, stand.lokaal, s.datum
        FROM speeddate s
        LEFT JOIN student st ON s.id_student = st.gebruiker_id
        LEFT JOIN bedrijf b ON s.id_bedrijf = b.gebruiker_id
        LEFT JOIN sector sec ON b.id_sector = sec.id
        LEFT JOIN stand ON s.id_bedrijf = stand.id_bedrijf
        WHERE s.id = ?
    `;
    try {
        const [rows] = await pool.query(query, [id]);
        return rows.map(row => mapSpeeddateRow(row));
    } catch (error) {
        console.error('Database query error in getSpeeddateById:', error);
        throw new Error('Database query failed');
    }
}

async function getSpeeddateHistoryByUserId(id) {
    const pool = getPool('ehbmatchdev');
    const query = `
        SELECT s.id, s.asked_by AS asked_by, s.id_bedrijf, b.naam AS naam_bedrijf, b.profiel_foto AS profiel_foto_bedrijf, sec.naam AS sector_bedrijf, s.id_student, st.voornaam AS voornaam_student, st.achternaam AS achternaam_student, st.profiel_foto AS profiel_foto_student, s.akkoord, stand.lokaal, s.datum
        FROM speeddate s
        LEFT JOIN student st ON s.id_student = st.gebruiker_id
        LEFT JOIN bedrijf b ON s.id_bedrijf = b.gebruiker_id
        LEFT JOIN sector sec ON b.id_sector = sec.id
        LEFT JOIN stand ON s.id_bedrijf = stand.id_bedrijf
        WHERE (s.id_bedrijf = ? OR s.id_student = ?) AND s.datum < NOW() - INTERVAL 10 MINUTE
        ORDER BY s.datum DESC
    `;
    try {
        const [rows] = await pool.query(query, [id, id]);
        return rows.map(row => mapSpeeddateRow(row));
    } catch (error) {
        console.error('Database query error in getSpeeddateHistoryByUserId:', error);
        throw new Error('Database query failed');
    }
}

// function to get all speeddates by user ID (id_bedrijf or id_student)
async function getSpeeddatesByUserId(id) {
    const pool = getPool('ehbmatchdev');
    const query = `
        SELECT s.id, s.asked_by AS asked_by, s.id_bedrijf, b.naam AS naam_bedrijf, b.profiel_foto AS profiel_foto_bedrijf, b.id_sector, sec.naam AS sector_bedrijf, s.id_student, st.voornaam AS voornaam_student, st.achternaam AS achternaam_student, st.profiel_foto AS profiel_foto_student, s.akkoord, stand.lokaal, s.datum
        FROM speeddate s
        LEFT JOIN student st ON s.id_student = st.gebruiker_id
        LEFT JOIN bedrijf b ON s.id_bedrijf = b.gebruiker_id
        LEFT JOIN sector sec ON b.id_sector = sec.id
        LEFT JOIN stand ON s.id_bedrijf = stand.id_bedrijf
        WHERE (s.id_bedrijf = ? OR s.id_student = ?) AND s.datum >= NOW() - INTERVAL 10 MINUTE
        ORDER BY s.datum ASC
    `;
    try {
        const [rows] = await pool.query(query, [id, id]);
        return rows.map(row => mapSpeeddateRow(row));
    } catch (error) {
        console.error('Database query error in getSpeeddatesByUserId:', error);
        throw new Error('Database query failed');
    }
}

async function getAcceptedSpeeddatesByUserId(id) {
    const pool = getPool('ehbmatchdev');
    const query = `
        SELECT 
            s.id AS id,
            s.asked_by AS asked_by,
            s.id_bedrijf,
            b.naam AS naam_bedrijf,
            b.profiel_foto AS profiel_foto_bedrijf,
            b.id_sector AS id_sector,
            sec.naam AS sector_bedrijf,
            s.id_student,
            st.voornaam AS voornaam_student,
            st.achternaam AS achternaam_student,
            st.profiel_foto AS profiel_foto_student,
            s.akkoord,
            stand.lokaal AS lokaal,
            s.datum
        FROM speeddate s
        LEFT JOIN student st ON s.id_student = st.gebruiker_id
        LEFT JOIN bedrijf b ON s.id_bedrijf = b.gebruiker_id
        LEFT JOIN sector sec ON b.id_sector = sec.id
        LEFT JOIN stand ON s.id_bedrijf = stand.id_bedrijf
        WHERE (s.id_bedrijf = ? OR s.id_student = ?) AND s.akkoord = 1 AND s.datum >= NOW() - INTERVAL 10 MINUTE
        ORDER BY s.datum ASC
    `;
    try {
        const [rows] = await pool.query(query, [id, id]);
        return rows.map(row => mapSpeeddateRow(row));
    } catch (error) {
        console.error('Database query error in getAcceptedSpeeddatesByUserId:', error);
        throw new Error('Database query failed');
    }
}

async function getRejectedSpeeddatesByUserId(id) {
    const pool = getPool('ehbmatchdev');
    const query = `
        SELECT 
            s.id AS id,
            s.asked_by AS asked_by,
            s.id_bedrijf,
            b.naam AS naam_bedrijf,
            b.profiel_foto AS profiel_foto_bedrijf,
            b.id_sector AS id_sector,
            sec.naam AS sector_bedrijf,
            s.id_student,
            st.voornaam AS voornaam_student,
            st.achternaam AS achternaam_student,
            st.profiel_foto AS profiel_foto_student,
            s.akkoord,
            stand.lokaal AS lokaal,
            s.datum
        FROM speeddate s
        LEFT JOIN student st ON s.id_student = st.gebruiker_id
        LEFT JOIN bedrijf b ON s.id_bedrijf = b.gebruiker_id
        LEFT JOIN sector sec ON b.id_sector = sec.id
        LEFT JOIN stand ON s.id_bedrijf = stand.id_bedrijf
        WHERE (s.id_bedrijf = ? OR s.id_student = ?) AND s.akkoord = 0 AND s.datum >= NOW() - INTERVAL 10 MINUTE
        ORDER BY s.datum ASC
    `;
    try {
        const [rows] = await pool.query(query, [id, id]);
        // For rejected, do not include begin/einde (optional: can include if needed)
        return rows.map(row => mapSpeeddateRow(row));
    } catch (error) {
        console.error('Database query error in getRejectedSpeeddatesByUserId:', error);
        throw new Error('Database query failed');
    }
}

async function getUnavailableDates(id1, id2) {
    const pool = getPool('ehbmatchdev');
    // Query for overlapping speeddates for the same student or company
    const query = `
        SELECT * FROM speeddate 
        WHERE (id_bedrijf = ? OR id_student = ?) OR (id_student = ? OR id_bedrijf = ?)
        `;
    try {
        const [rows] = await pool.query(query, [id1, id2, id1, id2]);
        const windows = rows.map(row => {
            const id = row.id;
            const begin = row.datum; // Already in ISO format
            const einde = new Date(new Date(begin).getTime() + 10 * 60 * 1000).toISOString();
            return { id, begin, einde };
        });
        return windows;
    } catch (error) {
        console.error('Database query error in getUnavailableDates:', error.message, error.stack);
        throw new Error('Checking unavailable dates failed');
    }
}

async function getAvailableDates(id1, id2) {
    const pool = getPool('ehbmatchdev');
    const bedrijfEvenementQuery = `SELECT * FROM bedrijf_evenement WHERE bedrijf_id = ? OR bedrijf_id = ?`;
    const speeddateQuery = `SELECT datum FROM speeddate WHERE id_bedrijf = ? OR id_bedrijf = ? OR id_student = ? OR id_student = ?`;
    try {
        const [beRows] = await pool.query(bedrijfEvenementQuery, [id1, id2]);
        if (beRows.length === 0) return [];
        // Get all speeddates for id1 or id2 (as bedrijf or student)
        const [sdRows] = await pool.query(speeddateQuery, [id1, id2, id1, id2]);
        // Precompute all taken windows
        const takenWindows = sdRows.map(row => {
            const takenBegin = new Date(row.datum);
            const takenEnd = new Date(takenBegin.getTime() + 10 * 60 * 1000);
            return { begin: takenBegin, einde: takenEnd };
        });
        let allAvailable = [];
        for (const row of beRows) {
            const startDate = new Date(row.begin);
            const stopDate = new Date(row.einde);
            let windowStart = new Date(startDate);
            while (windowStart.getTime() + 10 * 60 * 1000 <= stopDate.getTime()) {
                const windowEnd = new Date(windowStart.getTime() + 10 * 60 * 1000);
                // Only consider taken windows that overlap with this bedrijf_evenement window
                const overlaps = takenWindows.some(taken =>
                    windowStart < taken.einde && windowEnd > taken.begin
                );
                if (!overlaps) {
                    allAvailable.push({ begin: new Date(windowStart), einde: new Date(windowEnd) });
                }
                windowStart = new Date(windowStart.getTime() + 10 * 60 * 1000);
            }
        }
        return allAvailable.map(({ begin, einde }) => ({
            begin: begin.toISOString(),
            einde: einde.toISOString()
        }));
    } catch (error) {
        console.error('Database query error in getAvailableDates:', error.message, error.stack);
        throw new Error('Checking available dates failed');
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
    const query = `
        SELECT * FROM speeddate 
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

async function addSpeeddate(id_bedrijf, id_student, datum, asked_by) {
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO speeddate (id_bedrijf, id_student, datum, asked_by) VALUES (?,?,?,?)';

    try {
        const [result] = await pool.query(query, [id_bedrijf, id_student, datum, asked_by]);
        console.log('Speeddate added with ID:', result.insertId); // Log the ID of the newly inserted speeddate
        return result.insertId; // Return the ID of the newly inserted speeddate
    } catch (error) {
        console.error('Database query error in addSpeeddate:', error.message, error.stack);
        throw new Error('Adding speeddate failed');
    }
}

async function getSpeeddateInfo(id) {
    const pool = getPool('ehbmatchdev');
    const query = `
        SELECT s.id, s.asked_by AS asked_by, s.id_bedrijf, b.naam AS naam_bedrijf, b.profiel_foto AS profiel_foto_bedrijf, b.id_sector, sec.naam AS sector_bedrijf, s.id_student, st.voornaam AS voornaam_student, st.achternaam AS achternaam_student, st.profiel_foto AS profiel_foto_student, s.akkoord, stand.lokaal, s.datum
        FROM speeddate s
        LEFT JOIN student st ON s.id_student = st.gebruiker_id
        LEFT JOIN bedrijf b ON s.id_bedrijf = b.gebruiker_id
        LEFT JOIN sector sec ON b.id_sector = sec.id
        LEFT JOIN stand ON s.id_bedrijf = stand.id_bedrijf
        WHERE s.id = ?
    `;
    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return mapSpeeddateRow(rows[0]);
        } else {
            return null; // Return null if no row is found
        }
    } catch (error) {
        console.error('Database query error in getSpeeddateInfo:', error.message, error.stack);
        throw new Error('Getting speeddate info failed');
    }
}


async function isOwner(id, userId) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM speeddate WHERE id = ? AND asked_by = ?';

    try {
        const [rows] = await pool.query(query, [id, userId]);
        return rows.length > 0; // Return true if the user is the owner
    } catch (error) {
        console.error('Database query error in isOwner:', error.message, error.stack);
        throw new Error('Checking speeddate owner failed');
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
    getSpeeddateHistoryByUserId,
    getUnavailableDates,
    getAvailableDates,
    isOwner,
};
