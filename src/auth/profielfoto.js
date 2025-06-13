const express = require('express');
const passport = require('passport');
const multer = require('multer');
const { UTApi } = require('uploadthing/server');
const { UTFile } = require('uploadthing/server');

require('../auth/passportJWT.js');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const utapi = new UTApi();

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

    try {
        const uploadResult = await uploadServerSideFile(req.file);
        res.status(201).json({ message: 'File uploaded successfully', data: uploadResult });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;