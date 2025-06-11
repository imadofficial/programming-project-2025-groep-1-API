const passport = require('passport');
const { createUploadthing } = require("uploadthing/express");

const f = createUploadthing();

const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
      allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
    },
  })
    .middleware(async ({ req, res }) => {
      // Use passport JWT authentication
      return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, (err, user) => {
          if (err || !user) {
            reject(new Error('Unauthorized'));
          } else {
            resolve();
          }
        })(req, res);
      });
    })
    .onUploadComplete(async ({ file, metadata }) => {
      // Optionally handle post-upload logic here
      return { url: file.ufsUrl };
    }),
};

module.exports = uploadRouter;