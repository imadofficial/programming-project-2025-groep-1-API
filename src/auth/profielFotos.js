const express = require('express');
const passport = require('passport');
const multer = require('multer');
const { UTApi } = require('uploadthing/server');

require('./passportJWT.js');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const utapi = new UTApi();

const { addTempProfielFoto } = require('../sql/profielFoto.js'); // Adjust the path as necessary
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



router.post('/', upload.single('file'), async (req, res) => {
    console.log('File upload request received:', req.file);
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = new File([req.file.buffer], req.file.originalname, {
        type: req.file.mimetype,
    });

    try {
        const uploadResult = await uploadServerSideFile(file);
        if (!uploadResult || uploadResult.length === 0) {
            return res.status(500).json({ message: 'File upload failed' });
        }
        const fileKey = uploadResult.key;
        const fileUrl = uploadResult.ufUrl; // Assuming the URL is returned in the response
        const gebruikerId = req.user.id; // Get the user ID from the request
        const saveResult = await addTempProfielFoto(fileKey);
        if (!saveResult) {
            return res.status(500).json({ message: 'Failed to save profile picture' });
        }
        res.status(201).json({ message: 'File uploaded successfully', key: fileKey, url: fileUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;