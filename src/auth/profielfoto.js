const express = require('express');
const { utapi } = require ('../modules/uploadthing.js');
const passport = require('passport');

require('../auth/passportJWT.js'); // Ensure JWT authentication is set up

const router = express.Router();

async function uploadFiles(formData) {
  "use server";
  const files = formData.getAll("files");
  const response = await utapi.uploadFiles(files);
  return response;
}

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const formData = req.body;
    if (!formData || !formData.files || formData.files.length === 0) {
      return res.status(400).json({ message: 'No files provided' });
    }

    console.log("Received form data:", formData);
    
    const uploadResponse = await uploadFiles(formData);
    
    console.log("Upload response:", uploadResponse);
    res.status(200).json({ message: 'Files uploaded successfully', data: uploadResponse });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

module.exports = router;