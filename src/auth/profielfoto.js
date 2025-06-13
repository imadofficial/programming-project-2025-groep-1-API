const express = require('express');
const passport = require('passport');
const multer = require('multer');
const utapi = require('../modules/uploadthing.js');
const { UTFile } = require('uploadthing/server');

require('../auth/passportJWT.js');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// TODO: implement Uploadthing using https://docs.uploadthing.com/api-reference/ut-api

router.post('/', upload.single('image'), passport.authenticate('jwt', { session: false }), async (req, res) => {
    console.log('File upload request received:', req.file);
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Assuming utapi.upload is a method to handle file uploads
        const utFile = new UTFile([req.file.buffer], req.file.originalname, {
            type: req.file.mimetype,
            lastModified: Date.now(),
        });
        const uploadResult = await utapi.uploadFiles(utFile);
        res.status(201).json({ message: 'File uploaded successfully', data: uploadResult });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;