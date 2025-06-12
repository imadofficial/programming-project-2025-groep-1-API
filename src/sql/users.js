const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');

async function getUserById(id) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT id, email, is_admin FROM gebruiker WHERE id = ?'; // Corrected table name

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
            s.voornaam AS student_voornaam, s.achternaam AS student_achternaam, s.date_of_birth, s.linkedin AS student_linkedin, s.profiel_foto, s.studiejaar, o.naam AS opleiding,
            b.naam AS bedrijf_naam, b.plaats, b.contact_email, b.linkedin AS bedrijf_linkedin, b.profiel_foto AS bedrijf_profiel_foto
        FROM gebruiker g
        LEFT JOIN student s ON g.id = s.gebruiker_id
        LEFT JOIN bedrijf b ON g.id = b.gebruiker_id
        LEFT JOIN opleiding o ON s.opleiding_id = o.id
        WHERE g.id = ?
    `;

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length === 0) return null;

        const row = rows[0];
        // Check which table has data and return accordingly
        switch (row.type) {
            // User is a student
            case 2:
                return {
                    type: 2,
                    id: row.id,
                    email: row.email,
                    voornaam: row.student_voornaam,
                    achternaam: row.student_achternaam,
                    date_of_birth: row.date_of_birth,
                    profiel_foto: row.profiel_foto,
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
                    profiel_foto: row.bedrijf_profiel_foto,
                    contact_email: row.contact_email,
                    linkedin: row.bedrijf_linkedin
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

module.exports = {
    getUserById,
    getUserInfo
};