const { UTApi } = require('uploadthing/server');

require('dotenv').config();

const utapi = new UTApi({
    token: process.env.UPLOADTHING_API_TOKEN,
});

module.exports = utapi;