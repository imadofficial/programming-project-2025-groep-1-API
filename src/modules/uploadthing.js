const { UTApi } = require('uploadthing/server');

require('dotenv').config();

const utapi = new UTApi();

module.exports = utapi;