var express = require('express');
var app = express();
const { Client } = require("pg");
const conexion = {
    user: "ktysgjxxwfyyeb",
    host: "ec2-3-248-4-172.eu-west-1.compute.amazonaws.com",
    database: "davbfd5i39q17a",
    password: "add6ab6b55101aa28c323424cf2263e300fd0584f53274e9dad3b89118b4a4c2",
    port: 5432,
    ssl: { rejectUnauthorized: false },
  };
  
app.get('/listUsers', function (req, res) {


    
    const client = new Client(conexion);
    
    client.connect((e) => {
      if (e) console.error(e);
    });
    
    const query = "INSERT INTO \"PRUEBA\" (username) VALUES ('ANA K, VEN A MI');";
    client.query(query, (e, r) => {
      if (e) {
        console.error(e);
        return;
      }
      console.log("Se inserto en DB");
      client.end();
    });
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})