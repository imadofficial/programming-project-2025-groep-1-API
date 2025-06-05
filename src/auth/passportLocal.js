const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const users = require('../../data/users.json'); // Assuming you have a users.json file with user data

passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
    },
    async function(username, password, done) {
        const user = users.find(u => u.username === username);
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    }
));