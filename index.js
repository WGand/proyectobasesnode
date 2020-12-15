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
  pool.query(
    'SELECT * FROM \"PRUEBA\" WHERE username =$1',
    [username],
    (error, result) => {
      if (error) {
        throw error
      }
      else{
        if (result.rowCount > 0){
          response.status(203).json({status: 'cagada', message: 'matate, PS: Omar'})
        }
        else{
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
    },
  )
}


//const postPrueba = (request, response) => {
//    const {username} = request.body
//    var existe = pool.query('SELECT * FROM \"PRUEBA\" WHERE username =$1',username)
//    console.log(existe)
    //buscarBasura(username).then(data => console.log(data))
//    if(existe){
//      pool.query(
//        'INSERT INTO \"PRUEBA\" (username) VALUES ($1)',
//        [username],
//        (error) => {
//          if (error) {
//            throw error
//          }
//          response.status(201).json({status: 'success', message: 'Funciono'})
//        },
//      )
//  }
// }

function buscarBasura(basura){
  return pool.query(
    'SELECT * FROM \"PRUEBA\" WHERE username =$1',basura).then(a => !!a);
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