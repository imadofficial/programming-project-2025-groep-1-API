const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const users = require('../../data/users.json'); // Assuming you have a users.json file with user data
const { login, getUserType } = require('../sql/login.js'); // Adjust the path as necessary

console.log("Loading passport local strategy...");

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
    },
    async function(email, password, done) {
        email = email.toLowerCase();
        console.log("LocalStrategy called with email:", email);
        const userId = await login(email, password); 
        if (userId === null) {
            return done(null, false, { message: 'Incorrect email or password.' });
        }
        const type = await getUserType(userId);
        return done(null, { id: userId, type: type });
    }
));