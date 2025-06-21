const express = require('express');
const passport = require('passport');
const multer = require('multer');
const { UTApi } = require('uploadthing/server');

const { canEditProfilePicture } = require('../auth/canEdit.js');

require('./passportJWT.js');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // Limit file size to 3MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and GIF image files are allowed!'), false);
    }
  }
});
const utapi = new UTApi();

const { addTempProfielFoto, deleteProfielFoto, cleanupTempProfielFoto, isLinkedToUser } = require('../sql/profielFoto.js'); // Adjust the path as necessary
// TODO: implement Uploadthing using https://docs.uploadthing.com/api-reference/ut-api


async function uploadServerSideFile(file) {
    console.log('Uploading file:', file);
    try {
        const response = await utapi.uploadFiles(file);
        return response.data
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('File upload failed');
    }
}



router.post('/', upload.single('image'), async (req, res) => {
    console.log('File upload request received:', req.file);
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const ext = req.file.originalname.split('.').pop();
    const uniqueName = `profile_${Date.now()}_${Math.round(Math.random() * 1e9)}.${ext}`;

    const file = new File([req.file.buffer], uniqueName, {
        type: req.file.mimetype,
    });

    try {
        const uploadResult = await uploadServerSideFile(file);
        console.log('Upload result:', uploadResult);
        if (!uploadResult || !uploadResult.key || !uploadResult.ufsUrl) {
            return res.status(500).json({ message: 'File upload failed' });
        }
        const fileKey = uploadResult.key;
        const fileUrl = uploadResult.ufsUrl; // Assuming the URL is returned in the response
        const saveResult = await addTempProfielFoto(fileKey);
        if (!saveResult) {
            return res.status(500).json({ message: 'Failed to save profile picture' });
        }
        res.status(201).json({ message: 'File uploaded successfully', profiel_foto_key: fileKey, profiel_foto_url: fileUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// DELETE /:fotoKey
router.delete('/:fotoKey', async (req, res, next) => {
    const fotoKey = req.params.fotoKey;
    if (!fotoKey) {
        return res.status(400).json({ message: 'Foto key is required' });
    }

    try {
        const linked = await isLinkedToUser(fotoKey);
        if (linked) {
            // Require authentication and canEdit for linked files
            passport.authenticate('jwt', { session: false })(req, res, function (authErr) {
                if (authErr) return next(authErr);
                canEditProfilePicture(req, res, async function (editErr) {
                    if (editErr) return next(editErr);
                    try {
                        const cleanupResult = await cleanupTempProfielFoto(fotoKey);
                        if (!cleanupResult) {
                            return res.status(404).json({ message: 'Temporary profile picture not found' });
                        }
                        res.json({ message: 'Temporary profile picture deleted successfully' });
                    } catch (error) {
                        console.error('Error deleting temporary profile picture:', error);
                        res.status(500).json({ error: 'Internal server error: Could not delete profile picture' });
                    }
                });
            });
        } else {
            // Not linked, just cleanup (no auth required)
            const cleanupResult = await cleanupTempProfielFoto(fotoKey);
            if (!cleanupResult) {
                return res.status(404).json({ message: 'Temporary profile picture not found' });
            }
            res.json({ message: 'Temporary profile picture deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting temporary profile picture:', error);
        res.status(500).json({ error: 'Internal server error: Could not delete profile picture' });
    }
});

module.exports = router;