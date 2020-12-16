const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {pool} = require('./config')
const { query } = require('express')

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

const postPrueba = async (request, response) => {
  const {username} = request.body
  if(await existe(username)){
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
  else{
    response.status(203).json({status: 'failure', message: 'El registro existe'})
  }
}

const existe = async usuario => {
  let response = await pool.query('SELECT * FROM \"PRUEBA\" WHERE username =$1',[usuario])
  if(response.rowCount > 0){
    return false
  }
  else{
    return true
  }
}
app
  .route('/prueba')
  // GET endpoint
  .get(getPrueba)
  // POST endpoint
  .post(postPrueba)

// Start server
app.listen(process.env.PORT | 3002, () => {
  console.log(`Server listening`)
})