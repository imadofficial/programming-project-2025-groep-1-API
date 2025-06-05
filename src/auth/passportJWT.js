const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const users = require('../../data/users.json'); // Assuming you have a users.json file with user data


passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_ACCESS_SECRET
}, (jwtPayload, done) => {
    // Find the user in the database based on the JWT payload
    const user = users.find(user => user.id === jwtPayload.id);
    if (user) {
        done(null, user);
    } else {
        done(null, false);
    }
}));
