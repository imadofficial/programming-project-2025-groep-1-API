// Automatic cleanup for unused temporary profile photos
const { getPool } = require('../globalEntries.js');
const { UTApi } = require('uploadthing/server');

const utapi = new UTApi();

// Cleanup temp profile photos older than 1 hour and not linked to any user
async function cleanupTempProfielFotos() {
    const pool = getPool('ehbmatchdev');
    // Find temp photos older than 1 hour and not linked to any bedrijf or student
    const [rows] = await pool.query(`
        SELECT file_key
        FROM temp_uploaded_profiel_fotos t
        WHERE uploaded_at < NOW() - INTERVAL 1 HOUR
        AND NOT EXISTS (
            SELECT 1 FROM bedrijf b WHERE b.profiel_foto = t.file_key
        )
        AND NOT EXISTS (
            SELECT 1 FROM student s WHERE s.profiel_foto = t.file_key
        )
    `);
    if (rows.length === 0) return;
    const keys = rows.map(r => r.file_key);
    // Delete from Uploadthing (if you want to actually remove the files)
    try {
        await utapi.deleteFiles(keys);
    } catch (err) {
        console.error('Error deleting files from Uploadthing:', err);
    }
    // Remove from temp_uploaded_profiel_fotos table
    try {
        await pool.query('DELETE FROM temp_uploaded_profiel_fotos WHERE file_key IN (?)', [keys]);
        console.log(`Cleaned up ${keys.length} unused temp profile photos.`);
    } catch (err) {
        console.error('Error deleting records from temp_uploaded_profiel_fotos:', err);
    }
}

// Run cleanup every hour if this script is run directly
if (require.main === module) {
    cleanupTempProfielFotos().then(() => process.exit(0));
}

module.exports = { cleanupTempProfielFotos };
