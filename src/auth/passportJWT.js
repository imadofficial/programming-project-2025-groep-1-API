const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const users = require('../../data/users.json'); // Assuming you have a users.json file with user data
const { getUserById } = require('../sql/users.js'); // Adjust the path as necessary


passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_ACCESS_SECRET
}, async (jwtPayload, done) => {
    // Find the user in the database based on the JWT payload
    console.log("JWT Payload:", jwtPayload);
    const user = await getUserById(jwtPayload.id);
    if (user) {
        done(null, user);
    } else {
        done(null, false);
    }
}));
