const express = require('express')
const dotenv = require('dotenv')
const app = express()
const port = 3000

app.get('/about', (req, res) => {
  res.json({
    
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
