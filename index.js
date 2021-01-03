const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {pool} = require('./config')
const { query, response } = require('express')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

const GETLugar = async (request, response) => {
  pool.query('SELECT * FROM \"LUGAR\"', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const POSTLugar = async (request, response) => {
  const {nombre,tipo,lugar} = request.body
  pool.query(
    'INSERT INTO \"LUGAR\" (nombre, tipo, fk_lugar) VALUES ($1, $2, $3)',
    [nombre, tipo, lugar],
    (error) => {
      if (error) {
        throw error
      }
      response.status(201).json({status: 'success', message: 'Funciono'})
    },
  )
}

app
  .route('/prueba')
  // GET endpoint
  .get(GETLugar)
  // POST endpoint
  .post(POSTLugar)

// Start server
app.listen(process.env.PORT | 3002, () => {
  console.log(`Server listening`)
})