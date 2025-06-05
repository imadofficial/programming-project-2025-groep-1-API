const express = require('express')
require('dotenv').config();
const swaggerDocs = require('../docs/swagger.js');
const auth = require('./authentication.js');

const app = express();
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

require('./auth/authentication.js'); // Initialize authentication strategies

const bedrijven = require('./routes/bedrijven.js');
const studenten = require('./routes/studenten.js');
const login = require('./auth/login.js');

app.use('/bedrijven', bedrijven);
app.use('/studenten', studenten);
app.use('/login', login);

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