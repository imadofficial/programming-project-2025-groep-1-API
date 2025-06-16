const express = require('express');
const passport = require('passport');
const multer = require('multer');
const { UTApi } = require('uploadthing/server');

require('./passportJWT.js');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
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


module.exports = router;