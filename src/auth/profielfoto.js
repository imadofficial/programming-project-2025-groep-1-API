const passport = require('passport');
const { createUploadthing } = require("uploadthing/next");
const f = createUploadthing();

// Define the file router for UploadThing
const uploadthingsRouter = f.router({
  profielFoto: f.file({
    maxFileSize: '4MB',
    maxFileCount: 1,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
  })
    .middleware(async ({ req }) => {
      // Use passport JWT authentication
      return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, (err, user) => {
          if (err || !user) {
            reject(new Error('Unauthorized'));
          } else {
            resolve();
          }
        })(req);
      });
    })
    .onUploadComplete(async ({ file, metadata }) => {
      // Optionally handle post-upload logic here
      // file.url contains the uploaded file URL
      return { url: file.url };
    }),
});

module.exports = uploadthingsRouter;