const { createUploadthing } = require('uploadthing/express');
const passport = require('passport');

require('../auth/passportJWT.js'); // Ensure JWT authentication is set up

const f = createUploadthing();

const uploadRouter = {
    imageUploader: f({
        image: {
            maxFileSize: '4MB',
            maxFileCount: 1,
            allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
        },
    })
        .middleware(async (req, res, next) => {
            // authenticate the user using JWT
            await passport.authenticate('jwt', { session: false })(req, res, next);
        })
        .onUploadComplete(async (file, req) => {
            console.log("File uploaded successfully:", file);
        }),

};

module.exports = uploadRouter;