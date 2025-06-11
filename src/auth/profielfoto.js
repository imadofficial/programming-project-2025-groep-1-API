const express = require('express');
const multer = require('multer');
const { uploadFile } = require ('../modules/uploadthing.js');
const passport = require('passport');

require('../auth/passportJWT.js'); // Ensure JWT authentication is set up

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    maxFiles: 1 // Limit to one file per request
  }
});

router.post('/', passport.authenticate('jwt', { session: false }), upload.single('image'), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files are allowed' });
    }

    const file = req.file;

    console.log("Received file:", file);

    const uploadResponse = await uploadFile(file);

    console.log("Upload response:", uploadResponse);
    res.json({ message: 'File uploaded successfully', data: uploadResponse });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

module.exports = router;