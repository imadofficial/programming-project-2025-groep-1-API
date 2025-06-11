const express = require('express');
const multer = require('multer');
const { utapi } = require ('../modules/uploadthing.js');
const passport = require('passport');
const fileFromBuffer = require('file-from-buffer');

require('../auth/passportJWT.js'); // Ensure JWT authentication is set up

const router = express.Router();
const upload = multer();

async function uploadFiles(file) {
  "use server";
  const response = await utapi.uploadFiles(file);
  return response;
}

router.post('/', passport.authenticate('jwt', { session: false }), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = fileFromBuffer({
      buffer: req.file.buffer,
      size: req.file.size,
      name: req.file.originalname,
      type: req.file.mimetype,
      lastmodified: Date.now(),
    });

    console.log("Received file:", file);

    const uploadResponse = await uploadFiles(file);

    console.log("Upload response:", uploadResponse);
    res.json({ message: 'File uploaded successfully', data: uploadResponse });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

module.exports = router;