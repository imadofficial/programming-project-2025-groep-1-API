require('dotenv').config();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {
        // Here you would typically look up the user in your database
        // For this example, we'll just check against environment variables
        if (username === process.env.USER && password === process.env.PASS) {
            return done(null, { username: username });
        } else {
            return done(null, false, { message: 'Invalid credentials' });
        }
    }
))

const authenticatePassport = () => {
    passport.authenticate('local', { session: false, failureRedirect: '/login' });
}

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token || token !== process.env.TOKEN) {
        return res.status(403).json({ error: 'Forbidden: Invalid or missing token' });
    }
    
    next();
}

module.exports = {
    authenticate
};