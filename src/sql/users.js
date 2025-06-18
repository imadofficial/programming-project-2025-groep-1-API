const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');

async function getUserById(id) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT id, email, type FROM gebruiker WHERE id = ?'; // Corrected table name

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0]; // Return the first user found
        } else {
            return null; // Return null if no user is found
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function getUserInfo(id) {
    const pool = getPool('ehbmatchdev');
    console.log('Fetching user info for ID:', id); // Log the ID being fetched
    const query = `
        SELECT 
            g.id, g.email, g.type,
            s.voornaam AS student_voornaam, s.achternaam AS student_achternaam, s.date_of_birth, s.linkedin AS student_linkedin, s.profiel_foto AS profiel_foto_student, s.studiejaar, o.naam AS opleiding,
            b.naam AS bedrijf_naam, b.plaats, b.contact_email, b.linkedin AS bedrijf_linkedin, b.profiel_foto AS profiel_foto_bedrijf, sr.naam AS sector_bedrijf, sr.id AS id_sector_bedrijf
        FROM gebruiker g
        LEFT JOIN student s ON g.id = s.gebruiker_id
        LEFT JOIN bedrijf b ON g.id = b.gebruiker_id
        LEFT JOIN opleiding o ON s.opleiding_id = o.id
        LEFT JOIN sector sr ON b.id_sector = sr.id
        WHERE g.id = ?
    `;

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length === 0) return null;

        const row = rows[0];
        // Check which table has data and return accordingly
        switch (row.type) {
            case 2:
                // User is a student
                return {
                    type: 2,
                    id: row.id,
                    email: row.email,
                    voornaam: row.student_voornaam,
                    achternaam: row.student_achternaam,
                    date_of_birth: row.date_of_birth,
                    profiel_foto_key: row.profiel_foto_student,
                    profiel_foto_url: row.profiel_foto_student ? `https://gt0kk4fbet.ufs.sh/f/${row.profiel_foto_student}` : null,
                    linkedin: row.student_linkedin,
                    studiejaar: row.studiejaar,
                    opleiding: row.opleiding
                };
            case 3:
                // User is a company
                return {
                    type: 3,
                    id: row.id,
                    email: row.email,
                    naam: row.bedrijf_naam,
                    plaats: row.plaats,
                    profiel_foto_key: row.profiel_foto_bedrijf,
                    profiel_foto_url: row.profiel_foto_bedrijf ? `https://gt0kk4fbet.ufs.sh/f/${row.profiel_foto_bedrijf}` : null,
                    contact_email: row.contact_email,
                    linkedin: row.bedrijf_linkedin,
                    sector_bedrijf: row.sector_bedrijf
                };
            default:
                // User is neither student nor company
                return {
                    type: row.type,
                    id: row.id,
                    email: row.email,
                };
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function deleteUserById(id) {
    const pool = getPool('ehbmatchdev');
    try {
        await pool.query('START TRANSACTION');
    } catch (error) {
        console.error('Failed to start transaction:', error);
        throw new Error('Transaction initiation failed');
    }

    const query = 'DELETE FROM gebruiker WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id]);
        if (result.affectedRows > 0) {
            await pool.query('COMMIT');
            return true; // Return true if the user was deleted
        } else {
            await pool.query('ROLLBACK');
            return false; // Return false if no user was found to delete
        }
    } catch (error) {
        console.error('Database query error:', error);
        await pool.query('ROLLBACK');
        throw new Error('Database query failed');
    }
}

async function updateUser(id, data) {
    const pool = getPool('ehbmatchdev');
    const query = 'UPDATE gebruiker SET ? WHERE id = ?';

    if (!id || !data) {
        throw new Error('ID and data are required for update');
    }

    try {
        const [result] = await pool.query(query, [data, id]);
        return result.affectedRows > 0; // Return true if the update was successful
    } catch (error) {
        console.error('Database update error:', error);
        throw new Error('Database update failed');
    }
}

module.exports = {
    getUserById,
    getUserInfo,
    deleteUserById,
    updateUser
};