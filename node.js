/* ################################################
    ERROR: SI NO SE PUEDE INGRESAR UN OBJETO A LA TABLA (EJ: EL NOMBRE ESTA DEFINIDO COMO UNICO Y SE 
        REPITE AL HACER EL QUERY, EL ID SE SALTA UN NUMERO, REVISAR DB PARA QUE VEAN A QUE ME REFIERO <3*/

const { Client } = require("pg");

const conexion = {
  user: "ktysgjxxwfyyeb",
  host: "ec2-3-248-4-172.eu-west-1.compute.amazonaws.com",
  database: "davbfd5i39q17a",
  password: "add6ab6b55101aa28c323424cf2263e300fd0584f53274e9dad3b89118b4a4c2",
  port: 5432,
  ssl: { rejectUnauthorized: false },
};

const client = new Client(conexion);

client.connect((e) => {
  if (e) console.error(e);
});

const query = "INSERT INTO \"PRUEBA\" (username) VALUES ('william crack');";
client.query(query, (e, r) => {
  if (e) {
    console.error(e);
    return;
  }
  console.log("Se inserto en DB");
  client.end();
});
