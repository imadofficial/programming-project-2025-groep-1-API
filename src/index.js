const express = require('express')
require('dotenv').config();
const swaggerDocs = require('../docs/swagger.js');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

require('./auth/passportJWT.js');

const skills = require('./routes/skills.js');

const bedrijven = require('./routes/bedrijven.js');
const studenten = require('./routes/studenten.js');

const login = require('./auth/login.js');
const refresh = require('./auth/refresh.js');
const logout = require('./auth/logout.js');

app.use('/skills', skills);

app.use('/bedrijven', bedrijven);
app.use('/studenten', studenten);

app.use('/auth/login', login);
app.use('/auth/refresh', refresh);
app.use('/auth/logout', logout);

const port = process.env.STATUS == "production" ? 3000 : 3001;


app.get('/about', (req, res) => {
  res.json({
    "ProdName": "EhBMatch",
    "Version": `v${process.env.VERSION} (Build: ${process.env.BUILD})`
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

swaggerDocs(app);