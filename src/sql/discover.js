const { getPool } = require('../globalEntries.js');

/**
 * Returns bedrijven ordered by most common opleiding and skills matches for a specific student.
 * @param {number} studentId - The gebruiker_id of the student to compare to.
 */
async function getDiscoverBedrijven(studentId, suggestions = true) {
    const pool = getPool('ehbmatchdev');
    let query;
    let params = [studentId, studentId, studentId];
    if (suggestions) {
        query = `
            SELECT b.*, 
                COALESCE(opleiding_match.count, 0) AS opleiding_matches,
                COALESCE(skill_match.count, 0) AS skill_matches,
                (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0)) AS match_score,
                ROUND(
                    100 * ((COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0)) /
                    (3 + (
                        SELECT COUNT(*) FROM gebruiker_skills WHERE id_gebruiker = ?
                    )))
                , 2) AS match_percentage
            FROM bedrijf b
            LEFT JOIN (
                SELECT bo.id_bedrijf, 1 AS count
                FROM bedrijf_opleiding bo
                WHERE bo.id_opleiding = (SELECT opleiding_id FROM student WHERE gebruiker_id = ?)
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
            ORDER BY match_score DESC, b.naam ASC
        `;
        params = [studentId, studentId, studentId];
    } else {
        query = `
            SELECT b.*, 
                CASE WHEN bo.id_bedrijf IS NOT NULL THEN 1 ELSE 0 END AS same_opleiding,
                COALESCE(skill_matches.count, 0) AS skill_matches,
                ROUND(
                    100 * ((CASE WHEN bo.id_bedrijf IS NOT NULL THEN 3 ELSE 0 END + COALESCE(skill_matches.count, 0)) /
                    (3 + (
                        SELECT COUNT(*) FROM gebruiker_skills WHERE id_gebruiker = ?
                    )))
                , 2) AS match_percentage
            FROM bedrijf b
            LEFT JOIN bedrijf_opleiding bo 
                ON bo.id_bedrijf = b.gebruiker_id 
                AND bo.id_opleiding = (SELECT opleiding_id FROM student WHERE gebruiker_id = ?)
            LEFT JOIN (
                SELECT bedrijf_gebruiker.id AS bedrijf_id, COUNT(*) AS count
                FROM gebruiker bedrijf_gebruiker
                JOIN gebruiker_skills bedrijf_skills ON bedrijf_skills.id_gebruiker = bedrijf_gebruiker.id
                WHERE bedrijf_gebruiker.type = 3
                  AND bedrijf_skills.id_skill IN (
                      SELECT id_skill FROM gebruiker_skills WHERE id_gebruiker = ?
                  )
                GROUP BY bedrijf_gebruiker.id
            ) AS skill_matches ON skill_matches.bedrijf_id = b.gebruiker_id
            ORDER BY same_opleiding DESC, skill_matches DESC, b.naam ASC
        `;
        params = [studentId, studentId, studentId];
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
    let query;
    let params = [bedrijfId, bedrijfId, bedrijfId];
    if (suggestions) {
        query = `
            SELECT s.*, 
                COALESCE(opleiding_match.count, 0) AS opleiding_matches,
                COALESCE(skill_match.count, 0) AS skill_matches,
                (COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0)) AS match_score,
                ROUND(
                    100 * ((COALESCE(opleiding_match.count, 0) * 3 + COALESCE(skill_match.count, 0)) /
                    (3 + (
                        SELECT COUNT(*) FROM gebruiker_skills WHERE id_gebruiker = ?
                    )))
                , 2) AS match_percentage
            FROM student s
            LEFT JOIN (
                SELECT s2.gebruiker_id AS id_student, 1 AS count
                FROM student s2
                WHERE s2.opleiding_id IN (SELECT id_opleiding FROM bedrijf_opleiding WHERE id_bedrijf = ?)
            ) AS opleiding_match ON opleiding_match.id_student = s.gebruiker_id
            LEFT JOIN (
                SELECT student_skills.id_gebruiker AS student_id, COUNT(*) AS count
                FROM gebruiker_skills bedrijf_skills
                JOIN gebruiker_skills student_skills ON bedrijf_skills.id_skill = student_skills.id_skill
                WHERE bedrijf_skills.id_gebruiker = ?
                GROUP BY student_skills.id_gebruiker
            ) AS skill_match ON skill_match.student_id = s.gebruiker_id
            ORDER BY match_score DESC, s.voornaam ASC
        `;
        params = [bedrijfId, bedrijfId, bedrijfId];
    } else {
        query = `
            SELECT s.*, 
                CASE WHEN bo.id_bedrijf IS NOT NULL THEN 1 ELSE 0 END AS same_opleiding,
                COALESCE(skill_match.count, 0) AS skill_matches,
                ROUND(
                    100 * ((CASE WHEN bo.id_bedrijf IS NOT NULL THEN 3 ELSE 0 END + COALESCE(skill_match.count, 0)) /
                    (3 + (
                        SELECT COUNT(*) FROM gebruiker_skills WHERE id_gebruiker = ?
                    )))
                , 2) AS match_percentage
            FROM student s
            LEFT JOIN bedrijf_opleiding bo 
                ON bo.id_opleiding = s.opleiding_id 
                AND bo.id_bedrijf = ?
            LEFT JOIN (
                SELECT student_skills.id_gebruiker AS student_id, COUNT(*) AS count
                FROM gebruiker_skills bedrijf_skills
                JOIN gebruiker_skills student_skills ON bedrijf_skills.id_skill = student_skills.id_skill
                WHERE bedrijf_skills.id_gebruiker = ?
                GROUP BY student_skills.id_gebruiker
            ) AS skill_match ON skill_match.student_id = s.gebruiker_id
            ORDER BY same_opleiding DESC, skill_matches DESC, s.voornaam ASC
        `;
        params = [bedrijfId, bedrijfId, bedrijfId];
    }
    const [rows] = await pool.query(query, params);
    return rows;
}

module.exports = {
    getDiscoverBedrijven,
    getDiscoverStudenten
};
