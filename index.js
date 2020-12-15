const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {pool} = require('./config')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

const getPrueba = (request, response) => {
  pool.query('SELECT * FROM \"PRUEBA\" ', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const postPrueba = (request, response) => {
    const {username} = request.body
    if(buscarBasura(username)){
      pool.query(
        'INSERT INTO \"PRUEBA\" (username) VALUES ($1)',
        [username],
        (error) => {
          if (error) {
            throw error
          }
          response.status(201).json({status: 'success', message: 'Funciono'})
        },
      )
  }
  }

function buscarBasura(basura){
  pool.query(
    'SELECT * FROM \"PRUEBA\" WHERE username =$1',
    [basura],
    (err, result) => {
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      if(result){return true}
    })
}

app
  .route('/prueba')
  // GET endpoint
  .get(getPrueba)
  // POST endpoint
  .post(postPrueba)

// Start server
app.listen(process.env.PORT , () => {
  console.log(`Server listening`)
})