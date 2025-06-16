const { getPool } = require('../globalEntries.js');

/**
 * Returns bedrijven ordered by most relevant match_percentage, match_score, and name for a specific student.
 * If suggestions=false, orders by functie_matches, opleiding_matches, match_percentage, match_score, and name.
 * @param {number} studentId - The gebruiker_id of the student to compare to.
 */

const baseUrl = "https://gt0kk4fbet.ufs.sh/f/";

async function getDiscoverBedrijven(studentId, suggestions = true, onlyNew = false) {
    const pool = getPool('ehbmatchdev');
    // Pre-fetch opleiding_id for the student to avoid subquery in every row
    const [[student]] = await pool.query('SELECT opleiding_id FROM student WHERE gebruiker_id = ?', [studentId]);
    const opleidingId = student ? student.opleiding_id : null;
    let query;
    let params;
    let onlyNewCondition = '';
    if (onlyNew) {
        onlyNewCondition = `AND NOT EXISTS (SELECT 1 FROM speeddate s WHERE s.id_student = ? AND s.id_bedrijf = b.gebruiker_id)`;
    }
    if (suggestions) {
        query = `
            WITH bedrijf_reqs AS (
                SELECT
                    b.gebruiker_id,
                    (SELECT COUNT(*) FROM bedrijf_opleiding WHERE id_bedrijf = b.gebruiker_id) AS opleiding_count,
                    (SELECT COUNT(*) FROM gebruiker_skills WHERE id_gebruiker = b.gebruiker_id) AS skill_count,
                    (SELECT COUNT(*) FROM gebruiker_functie WHERE id_gebruiker = b.gebruiker_id) AS functie_count
                FROM bedrijf b
            )
            SELECT
                b.*, 
                COALESCE(opleiding_match.count, 0) AS opleiding_matches,
                COALESCE(skill_match.count, 0) AS skill_matches,
                COALESCE(functie_match.count, 0) AS functie_matches,
                (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5) AS match_score,
                COALESCE(
                    ROUND(
                        100 * (
                            (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5)
                            /
                            NULLIF(( (CASE WHEN br.opleiding_count > 0 THEN 3 ELSE 0 END) + br.skill_count + (CASE WHEN br.functie_count > 0 THEN 5 ELSE 0 END) ), 0)
                        ), 2
                    ), 0
                ) AS match_percentage
            FROM bedrijf b
            JOIN bedrijf_reqs br ON br.gebruiker_id = b.gebruiker_id
            LEFT JOIN (
                SELECT bo.id_bedrijf, 1 AS count
                FROM bedrijf_opleiding bo
                WHERE bo.id_opleiding = ?
            ) AS opleiding_match ON opleiding_match.id_bedrijf = b.gebruiker_id
            LEFT JOIN (
                SELECT bedrijf_skills.id_gebruiker AS bedrijf_id, COUNT(*) AS count
                FROM gebruiker_skills bedrijf_skills
                WHERE bedrijf_skills.id_skill IN (
                    SELECT id_skill FROM gebruiker_skills WHERE id_gebruiker = ?
                )
                GROUP BY bedrijf_skills.id_gebruiker
            ) AS skill_match ON skill_match.bedrijf_id = b.gebruiker_id
            LEFT JOIN (
                SELECT bedrijf_functie.id_gebruiker AS bedrijf_id, 1 AS count
                FROM gebruiker_functie bedrijf_functie
                WHERE bedrijf_functie.id_functie IN (
                    SELECT id_functie FROM gebruiker_functie WHERE id_gebruiker = ?
                )
                GROUP BY bedrijf_functie.id_gebruiker
            ) AS functie_match ON functie_match.bedrijf_id = b.gebruiker_id
            WHERE 1=1 ${onlyNewCondition}
            ORDER BY match_percentage DESC, match_score DESC, b.naam ASC
        `;
        // params: [opleidingId, studentId, studentId, (studentId if onlyNew)]
        params = onlyNew ? [opleidingId, studentId, studentId, studentId] : [opleidingId, studentId, studentId];
    } else {
        query = `
            WITH bedrijf_reqs AS (
                SELECT
                    b.gebruiker_id,
                    (SELECT COUNT(*) FROM bedrijf_opleiding WHERE id_bedrijf = b.gebruiker_id) AS opleiding_count,
                    (SELECT COUNT(*) FROM gebruiker_skills WHERE id_gebruiker = b.gebruiker_id) AS skill_count,
                    (SELECT COUNT(*) FROM gebruiker_functie WHERE id_gebruiker = b.gebruiker_id) AS functie_count
                FROM bedrijf b
            )
            SELECT
                b.*, 
                COALESCE(opleiding_match.count, 0) AS opleiding_matches,
                COALESCE(skill_match.count, 0) AS skill_matches,
                COALESCE(functie_match.count, 0) AS functie_matches,
                (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5) AS match_score,
                COALESCE(
                    ROUND(
                        100 * (
                            (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5)
                            /
                            NULLIF(( (CASE WHEN br.opleiding_count > 0 THEN 3 ELSE 0 END) + br.skill_count + (CASE WHEN br.functie_count > 0 THEN 5 ELSE 0 END) ), 0)
                        ), 2
                    ), 0
                ) AS match_percentage
            FROM bedrijf b
            JOIN bedrijf_reqs br ON br.gebruiker_id = b.gebruiker_id
            LEFT JOIN (
                SELECT bo.id_bedrijf, 1 AS count
                FROM bedrijf_opleiding bo
                WHERE bo.id_opleiding = ?
            ) AS opleiding_match ON opleiding_match.id_bedrijf = b.gebruiker_id
            LEFT JOIN (
                SELECT bedrijf_skills.id_gebruiker AS bedrijf_id, COUNT(*) AS count
                FROM gebruiker_skills bedrijf_skills
                WHERE bedrijf_skills.id_skill IN (
                    SELECT id_skill FROM gebruiker_skills WHERE id_gebruiker = ?
                )
                GROUP BY bedrijf_skills.id_gebruiker
            ) AS skill_match ON skill_match.bedrijf_id = b.gebruiker_id
            LEFT JOIN (
                SELECT bedrijf_functie.id_gebruiker AS bedrijf_id, 1 AS count
                FROM gebruiker_functie bedrijf_functie
                WHERE bedrijf_functie.id_functie IN (
                    SELECT id_functie FROM gebruiker_functie WHERE id_gebruiker = ?
                )
                GROUP BY bedrijf_functie.id_gebruiker
            ) AS functie_match ON functie_match.bedrijf_id = b.gebruiker_id
            WHERE 1=1 ${onlyNewCondition}
            ORDER BY functie_matches DESC, opleiding_matches DESC, match_percentage DESC, match_score DESC, b.naam ASC
        `;
        params = onlyNew ? [opleidingId, studentId, studentId, studentId] : [opleidingId, studentId, studentId];
    }
    try {
        const [rows] = await pool.query(query, params);
        if (rows.length > 0) {
            const bedrijven = rows.map(bedrijf => {
                if (bedrijf.profiel_foto) {
                    bedrijf.profiel_foto_key = bedrijf.profiel_foto;
                    bedrijf.profiel_foto_url = baseUrl + bedrijf.profiel_foto;
                } else {
                    bedrijf.profiel_foto_key = null;
                    bedrijf.profiel_foto_url = null;
                }
                delete bedrijf.profiel_foto; // Remove the original profiel_foto field
                return bedrijf; // Return the modified bedrijf object
            });

            return bedrijven; // Return the modified bedrijven array
        }
        return rows;
    } catch (error) {
        console.error('Error fetching bedrijf data:', error);
        throw new Error('Database query failed');
    }
}

/**
 * Returns studenten ordered by most common opleiding and skills matches for a specific bedrijf.
 * @param {number} bedrijfId - The gebruiker_id of the bedrijf to compare to.
 * @param {boolean} suggestions - If true, use weighted total; if false, show all students with same opleiding first, then others.
 */
async function getDiscoverStudenten(bedrijfId, suggestions = true, onlyNew = false) {
    const pool = getPool('ehbmatchdev');
    // Pre-fetch all opleiding_ids for the bedrijf to avoid subquery in every row
    const [bedrijfOplRows] = await pool.query('SELECT id_opleiding FROM bedrijf_opleiding WHERE id_bedrijf = ?', [bedrijfId]);
    const bedrijfOplIds = bedrijfOplRows.map(row => row.id_opleiding);
    // Pre-fetch skill and functie counts for de bedrijf
    const [[{ skill_count }]] = await pool.query('SELECT COUNT(*) AS skill_count FROM gebruiker_skills WHERE id_gebruiker = ?', [bedrijfId]);
    const [[{ functie_count }]] = await pool.query('SELECT COUNT(*) AS functie_count FROM gebruiker_functie WHERE id_gebruiker = ?', [bedrijfId]);
    const [[{ opleiding_count }]] = await pool.query('SELECT COUNT(*) AS opleiding_count FROM bedrijf_opleiding WHERE id_bedrijf = ?', [bedrijfId]);
    let query;
    let params;
    let onlyNewCondition = '';
    if (onlyNew) {
        onlyNewCondition = `AND NOT EXISTS (SELECT 1 FROM speeddate s WHERE s.id_bedrijf = ? AND s.id_student = s2.gebruiker_id)`;
    }
    if (suggestions) {
        query = `
            WITH bedrijf_reqs AS (
                SELECT
                    s.gebruiker_id,
                    ? AS opleiding_count,
                    ? AS skill_count,
                    ? AS functie_count
                FROM student s
            )
            SELECT
                s.*, 
                g.email AS contact_email,
                COALESCE(opleiding_match.count, 0) AS opleiding_matches,
                COALESCE(skill_match.count, 0) AS skill_matches,
                COALESCE(functie_match.count, 0) AS functie_matches,
                (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5) AS match_score,
                COALESCE(
                    ROUND(
                        100 * (
                            (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5)
                            /
                            NULLIF(( (CASE WHEN br.opleiding_count > 0 THEN 3 ELSE 0 END) + br.skill_count + (CASE WHEN br.functie_count > 0 THEN 5 ELSE 0 END) ), 0)
                        ), 2
                    ), 0
                ) AS match_percentage
            FROM student s
            JOIN bedrijf_reqs br ON br.gebruiker_id = s.gebruiker_id
            JOIN gebruiker g ON g.id = s.gebruiker_id
            LEFT JOIN (
                SELECT s2.gebruiker_id AS id_student, 1 AS count
                FROM student s2
                WHERE s2.opleiding_id IN (${bedrijfOplIds.length > 0 ? bedrijfOplIds.map(() => '?').join(',') : 'NULL'})
                ${onlyNewCondition}
            ) AS opleiding_match ON opleiding_match.id_student = s.gebruiker_id
            LEFT JOIN (
                SELECT student_skills.id_gebruiker AS student_id, COUNT(*) AS count
                FROM gebruiker_skills bedrijf_skills
                JOIN gebruiker_skills student_skills ON bedrijf_skills.id_skill = student_skills.id_skill
                WHERE bedrijf_skills.id_gebruiker = ?
                GROUP BY student_skills.id_gebruiker
            ) AS skill_match ON skill_match.student_id = s.gebruiker_id
            LEFT JOIN (
                SELECT student_functie.id_gebruiker AS student_id, 1 AS count
                FROM gebruiker_functie bedrijf_functie
                JOIN gebruiker_functie student_functie ON bedrijf_functie.id_functie = student_functie.id_functie
                WHERE bedrijf_functie.id_gebruiker = ?
                GROUP BY student_functie.id_gebruiker
            ) AS functie_match ON functie_match.student_id = s.gebruiker_id
            ORDER BY match_percentage DESC, match_score DESC, s.voornaam ASC
        `;
        // params: [opleiding_count, skill_count, functie_count, ...bedrijfOplIds, (bedrijfId if onlyNew), bedrijfId, bedrijfId]
        params = onlyNew ? [opleiding_count, skill_count, functie_count, ...bedrijfOplIds, bedrijfId, bedrijfId, bedrijfId] : [opleiding_count, skill_count, functie_count, ...bedrijfOplIds, bedrijfId, bedrijfId];
    } else {
        query = `
            WITH bedrijf_reqs AS (
                SELECT
                    s.gebruiker_id,
                    ? AS opleiding_count,
                    ? AS skill_count,
                    ? AS functie_count
                FROM student s
            )
            SELECT
                s.*, 
                g.email AS contact_email,
                COALESCE(opleiding_match.count, 0) AS opleiding_matches,
                COALESCE(skill_match.count, 0) AS skill_matches,
                COALESCE(functie_match.count, 0) AS functie_matches,
                (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5) AS match_score,
                COALESCE(
                    ROUND(
                        100 * (
                            (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5)
                            /
                            NULLIF(( (CASE WHEN br.opleiding_count > 0 THEN 3 ELSE 0 END) + br.skill_count + (CASE WHEN br.functie_count > 0 THEN 5 ELSE 0 END) ), 0)
                        ), 2
                    ), 0
                ) AS match_percentage
            FROM student s
            JOIN bedrijf_reqs br ON br.gebruiker_id = s.gebruiker_id
            JOIN gebruiker g ON g.id = s.gebruiker_id
            LEFT JOIN (
                SELECT s2.gebruiker_id AS id_student, 1 AS count
                FROM student s2
                WHERE s2.opleiding_id IN (${bedrijfOplIds.length > 0 ? bedrijfOplIds.map(() => '?').join(',') : 'NULL'})
                ${onlyNewCondition}
            ) AS opleiding_match ON opleiding_match.id_student = s.gebruiker_id
            LEFT JOIN (
                SELECT student_skills.id_gebruiker AS student_id, COUNT(*) AS count
                FROM gebruiker_skills bedrijf_skills
                JOIN gebruiker_skills student_skills ON bedrijf_skills.id_skill = student_skills.id_skill
                WHERE bedrijf_skills.id_gebruiker = ?
                GROUP BY student_skills.id_gebruiker
            ) AS skill_match ON skill_match.student_id = s.gebruiker_id
            LEFT JOIN (
                SELECT student_functie.id_gebruiker AS student_id, 1 AS count
                FROM gebruiker_functie bedrijf_functie
                JOIN gebruiker_functie student_functie ON bedrijf_functie.id_functie = student_functie.id_functie
                WHERE bedrijf_functie.id_gebruiker = ?
                GROUP BY student_functie.id_gebruiker
            ) AS functie_match ON functie_match.student_id = s.gebruiker_id
            ORDER BY functie_matches DESC, opleiding_matches DESC, match_percentage DESC, match_score DESC, s.voornaam ASC
        `;
        params = onlyNew ? [opleiding_count, skill_count, functie_count, ...bedrijfOplIds, bedrijfId, bedrijfId, bedrijfId] : [opleiding_count, skill_count, functie_count, ...bedrijfOplIds, bedrijfId, bedrijfId];
    }
    try {
        const [rows] = await pool.query(query, params);
        if (rows.length > 0) {
            const studenten = rows.map(student => {
                if (student.profiel_foto) {
                    student.profiel_foto_key = student.profiel_foto;
                    student.profiel_foto_url = baseUrl + student.profiel_foto;
                } else {
                    student.profiel_foto_key = null;
                    student.profiel_foto_url = null;
                }
                delete student.profiel_foto; // Remove the original profiel_foto field
                return student; // Return the modified student object
            });

            return studenten; // Return the modified studenten array
        }
        return rows; // Return all rows if no specific student is found
    } catch (error) {
        console.error('Error fetching student data:', error);
    }
}

module.exports = {
    getDiscoverBedrijven,
    getDiscoverStudenten
};
