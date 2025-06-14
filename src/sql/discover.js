const { getPool } = require('../globalEntries.js');

/**
 * Returns bedrijven ordered by most common opleiding and skills matches for a specific student.
 * @param {number} studentId - The gebruiker_id of the student to compare to.
 */
async function getDiscoverBedrijven(studentId, suggestions = true) {
    const pool = getPool('ehbmatchdev');
    // Pre-fetch opleiding_id for the student to avoid subquery in every row
    const [[student]] = await pool.query('SELECT opleiding_id FROM student WHERE gebruiker_id = ?', [studentId]);
    const opleidingId = student ? student.opleiding_id : null;
    let query;
    let params;
    if (suggestions) {
        query = `
            SELECT b.*, 
                COALESCE(opleiding_match.count, 0) AS opleiding_matches,
                COALESCE(skill_match.count, 0) AS skill_matches,
                COALESCE(functie_match.count, 0) AS functie_matches,
                (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5) AS match_score,
                ROUND(
                    100 * ((COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5) /
                    (3 + (
                        SELECT COUNT(*) FROM gebruiker_skills WHERE id_gebruiker = ?
                    ) + 5)
                ), 2) AS match_percentage
            FROM bedrijf b
            LEFT JOIN (
                SELECT bo.id_bedrijf, 1 AS count
                FROM bedrijf_opleiding bo
                WHERE bo.id_opleiding = ?
            ) AS opleiding_match ON opleiding_match.id_bedrijf = b.gebruiker_id
            LEFT JOIN (
                SELECT bedrijf_gebruiker.id AS bedrijf_id, COUNT(*) AS count
                FROM gebruiker bedrijf_gebruiker
                JOIN gebruiker_skills bedrijf_skills ON bedrijf_skills.id_gebruiker = bedrijf_gebruiker.id
                WHERE bedrijf_gebruiker.type = 3
                  AND bedrijf_skills.id_skill IN (
                      SELECT id_skill FROM gebruiker_skills WHERE id_gebruiker = ?
                  )
                GROUP BY bedrijf_gebruiker.id
            ) AS skill_match ON skill_match.bedrijf_id = b.gebruiker_id
            LEFT JOIN (
                SELECT bedrijf_gebruiker.id AS bedrijf_id, CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS count
                FROM gebruiker bedrijf_gebruiker
                JOIN gebruiker_functie bedrijf_functie ON bedrijf_functie.id_gebruiker = bedrijf_gebruiker.id
                WHERE bedrijf_gebruiker.type = 3
                  AND bedrijf_functie.id_functie IN (
                      SELECT id_functie FROM gebruiker_functie WHERE id_gebruiker = ?
                  )
                GROUP BY bedrijf_gebruiker.id
            ) AS functie_match ON functie_match.bedrijf_id = b.gebruiker_id
            ORDER BY match_score DESC, b.naam ASC
        `;
        params = [studentId, opleidingId, studentId, studentId, studentId];
    } else {
        query = `
            SELECT b.*, 
                CASE WHEN functie_matches.count > 0 THEN 1 ELSE 0 END AS has_functie_match,
                CASE WHEN bo.id_bedrijf IS NOT NULL THEN 1 ELSE 0 END AS opleiding_matches,
                COALESCE(skill_matches.count, 0) AS skill_matches,
                COALESCE(functie_matches.count, 0) AS functie_matches,
                ROUND(
                    100 * ((CASE WHEN bo.id_bedrijf IS NOT NULL THEN 3 ELSE 0 END + COALESCE(skill_matches.count, 0) + COALESCE(functie_matches.count, 0) * 5) /
                    (3 + (
                        SELECT COUNT(*) FROM gebruiker_skills WHERE id_gebruiker = ?
                    ) + 5)
                ), 2) AS match_percentage
            FROM bedrijf b
            LEFT JOIN bedrijf_opleiding bo 
                ON bo.id_bedrijf = b.gebruiker_id 
                AND bo.id_opleiding = ?
            LEFT JOIN (
                SELECT id_gebruiker AS bedrijf_id, COUNT(*) AS count
                FROM gebruiker_skills
                WHERE id_skill IN (
                    SELECT id_skill FROM gebruiker_skills WHERE id_gebruiker = ?
                )
                GROUP BY id_gebruiker
            ) AS skill_matches ON skill_matches.bedrijf_id = b.gebruiker_id
            LEFT JOIN (
                SELECT id_gebruiker AS bedrijf_id, CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS count
                FROM gebruiker_functie
                WHERE id_functie IN (
                    SELECT id_functie FROM gebruiker_functie WHERE id_gebruiker = ?
                )
                GROUP BY id_gebruiker
            ) AS functie_matches ON functie_matches.bedrijf_id = b.gebruiker_id
            ORDER BY has_functie_match DESC, opleiding_matches DESC, skill_matches DESC, b.naam ASC
        `;
        params = [studentId, opleidingId, studentId, studentId, studentId];
    }
    const [rows] = await pool.query(query, params);
    return rows;
}

/**
 * Returns studenten ordered by most common opleiding and skills matches for a specific bedrijf.
 * @param {number} bedrijfId - The gebruiker_id of the bedrijf to compare to.
 * @param {boolean} suggestions - If true, use weighted total; if false, show all students with same opleiding first, then others.
 */
async function getDiscoverStudenten(bedrijfId, suggestions = true) {
    const pool = getPool('ehbmatchdev');
    // Pre-fetch all opleiding_ids for the bedrijf to avoid subquery in every row
    const [bedrijfOplRows] = await pool.query('SELECT id_opleiding FROM bedrijf_opleiding WHERE id_bedrijf = ?', [bedrijfId]);
    const bedrijfOplIds = bedrijfOplRows.map(row => row.id_opleiding);
    let query;
    let params;
    if (suggestions) {
        query = `
            SELECT s.*, 
                COALESCE(opleiding_match.count, 0) AS opleiding_matches,
                COALESCE(skill_match.count, 0) AS skill_matches,
                COALESCE(functie_match.count, 0) AS functie_matches,
                (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5) AS match_score,
                ROUND(
                    100 * ((COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5) /
                    (3 + (
                        SELECT COUNT(*) FROM gebruiker_skills WHERE id_gebruiker = ?
                    ) + 5)
                ), 2) AS match_percentage
            FROM student s
            LEFT JOIN (
                SELECT s2.gebruiker_id AS id_student, 1 AS count
                FROM student s2
                WHERE s2.opleiding_id IN (${bedrijfOplIds.length > 0 ? bedrijfOplIds.map(() => '?').join(',') : 'NULL'})
            ) AS opleiding_match ON opleiding_match.id_student = s.gebruiker_id
            LEFT JOIN (
                SELECT student_skills.id_gebruiker AS student_id, COUNT(*) AS count
                FROM gebruiker_skills bedrijf_skills
                JOIN gebruiker_skills student_skills ON bedrijf_skills.id_skill = student_skills.id_skill
                WHERE bedrijf_skills.id_gebruiker = ?
                GROUP BY student_skills.id_gebruiker
            ) AS skill_match ON skill_match.student_id = s.gebruiker_id
            LEFT JOIN (
                SELECT student_functie.id_gebruiker AS student_id, CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS count
                FROM gebruiker_functie bedrijf_functie
                JOIN gebruiker_functie student_functie ON bedrijf_functie.id_functie = student_functie.id_functie
                WHERE bedrijf_functie.id_gebruiker = ?
                GROUP BY student_functie.id_gebruiker
            ) AS functie_match ON functie_match.student_id = s.gebruiker_id
            ORDER BY match_score DESC, s.voornaam ASC
        `;
        params = [bedrijfId, ...bedrijfOplIds, bedrijfId, bedrijfId];
    } else {
        query = `
            SELECT s.*, 
                CASE WHEN functie_match.count > 0 THEN 1 ELSE 0 END AS has_functie_match,
                CASE WHEN opleiding_match.count > 0 THEN 1 ELSE 0 END AS opleiding_matches,
                COALESCE(skill_match.count, 0) AS skill_matches,
                COALESCE(functie_match.count, 0) AS functie_matches,
                ROUND(
                    100 * ((CASE WHEN opleiding_match.count > 0 THEN 3 ELSE 0 END + COALESCE(skill_match.count, 0) + COALESCE(functie_match.count, 0) * 5) /
                    (3 + (
                        SELECT COUNT(*) FROM gebruiker_skills WHERE id_gebruiker = ?
                    ) + 5)
                ), 2) AS match_percentage
            FROM student s
            LEFT JOIN (
                SELECT gebruiker_id, 1 AS count
                FROM student
                WHERE opleiding_id IN (${bedrijfOplIds.length > 0 ? bedrijfOplIds.map(() => '?').join(',') : 'NULL'})
            ) AS opleiding_match ON opleiding_match.gebruiker_id = s.gebruiker_id
            LEFT JOIN (
                SELECT id_gebruiker AS student_id, COUNT(*) AS count
                FROM gebruiker_skills
                WHERE id_skill IN (
                    SELECT id_skill FROM gebruiker_skills WHERE id_gebruiker = ?
                )
                GROUP BY id_gebruiker
            ) AS skill_match ON skill_match.student_id = s.gebruiker_id
            LEFT JOIN (
                SELECT id_gebruiker AS student_id, CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS count
                FROM gebruiker_functie
                WHERE id_functie IN (
                    SELECT id_functie FROM gebruiker_functie WHERE id_gebruiker = ?
                )
                GROUP BY id_gebruiker
            ) AS functie_match ON functie_match.student_id = s.gebruiker_id
            ORDER BY has_functie_match DESC, opleiding_matches DESC, skill_matches DESC, s.voornaam ASC
        `;
        params = [bedrijfId, ...bedrijfOplIds, bedrijfId, bedrijfId];
    }
    const [rows] = await pool.query(query, params);
    return rows;
}

module.exports = {
    getDiscoverBedrijven,
    getDiscoverStudenten
};
