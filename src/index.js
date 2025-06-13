const express = require('express')
require('dotenv').config();
const swaggerDocs = require('../docs/swagger.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'https://www.ehb-match.me',
  'https://ehb-match.me',
  'https://dev.ehb-match.me',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(function(req, res, next) {
  res.locals.ua = req.get('User-Agent');
  next();
});

require('./auth/passportJWT.js');


app.use('/bedrijven', require('./routes/bedrijven.js'));
app.use('/studenten', require('./routes/studenten.js'));

app.use('/skills', require('./routes/skills.js'));
app.use('/opleidingen', require('./routes/opleidingen.js'));
app.use('/stands', require('./routes/stands.js'));

app.use('/speeddates', require('./routes/speeddates.js'));

// User routes
app.use('/user', require('./routes/user.js'));

// Authentication routes
app.use('/auth/info', require('./auth/info.js'));

app.use('/auth/profielfoto', require('./auth/profielfoto.js')); // TODO: implement Uploadthing using https://docs.uploadthing.com/api-reference/ut-api

app.use('/auth/login', require('./auth/login.js'));
app.use('/auth/refresh', require('./auth/refresh.js'));
app.use('/auth/logout', require('./auth/logout.js'));
app.use('/auth/register', require('./auth/register.js'));

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
