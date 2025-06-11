const { UTApi } = require('uploadthing/server');
require('dotenv').config(); // Ensure you have dotenv to load environment variables


const utapi = new UTApi({
  token: process.env.UPLOADTHING_API_KEY, // Your UploadThing API key
});

module.exports = { utapi };