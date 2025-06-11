const express = require('express');
const passport = require('passport');
const multer = require('multer');
const { genUploader } = require('uploadthing/client');
const { UploadRouter } = require('../modules/uploadthing.js');

const router = express.Router();
const upload = multer({
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB
    files: 1, // Limit to 1 file
  },
})

require('../auth/passportJWT.js'); // Ensure JWT authentication is set up

const { uploadFiles } = genUploader(UploadRouter);

router.post('/', passport.authenticate('jwt', { session: false }), upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const response = await uploadFiles((routeRegistry) => routeRegistry.imageUploader, {
      files: [req.file],
    });

    return res.json(response);
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: 'Error uploading file' });
  }
})

module.exports = router;