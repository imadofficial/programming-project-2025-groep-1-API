const { createUploadthing } = require('uploadthing/next');

require('dotenv').config();

const f = createUploadthing();

const uploadthing = {
    profilePicture: f({ image: { maxFileSize: '4MB', maxFileCount: 1, minFileCount: 1 } })
        .middleware(async (req, res, next) => {
            console.log('Middleware for profile picture upload triggered');
            //if (!req.user) {
            //    return res.status(401).json({ message: 'Unauthorized' });
            //}
            next();
        })
        .onUploadComplete(async (data) => {
            console.log('File uploaded:', data);
            // Here you can handle the file, e.g., save it to a database or perform other actions
        }),
}

module.exports = uploadthing