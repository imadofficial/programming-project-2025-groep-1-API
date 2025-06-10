const express = require('express')
require('dotenv').config();
const swaggerDocs = require('../docs/swagger.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use(function(req, res, next) {
  res.locals.ua = req.get('User-Agent');
  next();
});

require('./auth/passportJWT.js');


const bedrijven = require('./routes/bedrijven.js');
const studenten = require('./routes/studenten.js');

const skills = require('./routes/skills.js');
const opleidingen = require('./routes/opleidingen.js');

const login = require('./auth/login.js');
const refresh = require('./auth/refresh.js');
const logout = require('./auth/logout.js');

const register = require('./auth/register.js');


app.use('/bedrijven', bedrijven);
app.use('/studenten', studenten);

app.use('/skills', skills);
app.use('/opleidingen', opleidingen);

// Authentication routes
app.use('/auth/login', login);
app.use('/auth/refresh', refresh);
app.use('/auth/logout', logout);
app.use('/auth/register', register);

const port = process.env.STATUS == "production" ? 3000 : 3001;

app.get('/about', (req, res) => {
  res.json({
    "ProdName": "EhBMatch",
    "Version": `v${process.env.VERSION} (Build: ${process.env.BUILD})`,
    "Description": "EhBMatch is a platform that connects students with companies for internships and projects, facilitating skill development and career opportunities.",
    "UserAgent": res.locals.ua,
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

swaggerDocs(app);