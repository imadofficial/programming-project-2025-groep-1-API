const express = require('express')
require('dotenv').config();
const userRouter = require('./filters.js');
const swaggerDocs = require('./docs/swagger.js');

const app = express();
app.use('/', userRouter);

const port = process.env.STATUS == "production" ? 3000 : 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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