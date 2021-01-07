const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { pool } = require("./config");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const postEspecificoLugar = async (request, response) => {
  const { tipo_lugar, lugar, estado } = request.body;
  switch (tipo_lugar) {
    case "ESTADO":
      pool.query(
        'SELECT * FROM "LUGAR" WHERE tipo = $1',
        [tipo_lugar],
        (error, results) => {
          if (error) {
            throw error;
          }
          response.status(200).json(results.rows);
        }
      );
      break;
    case "MUNICIPIO":
      pool.query(
        'SELECT * FROM "LUGAR" WHERE tipo = $1 AND fk_lugar = (SELECT lugar_id FROM "LUGAR" WHERE nombre = $2 and tipo = $3)',
        [tipo_lugar, lugar, "ESTADO"],
        (error, results) => {
          if (error) {
            throw error;
          }
          response.status(200).json(results.rows);
        }
      );
      break;
    case "PARROQUIA":
      pool.query(
        'SELECT * FROM "LUGAR" WHERE tipo = $1 AND fk_lugar = (SELECT lugar_id FROM "LUGAR" WHERE nombre = $2 and tipo = $3 and fk_lugar = (SELECT lugar_id FROM "LUGAR" WHERE nombre = $4 and tipo =$5))',
        [tipo_lugar, lugar, "MUNICIPIO", estado, "ESTADO"],
        (error, results) => {
          if (error) {
            throw error;
          }
          response.status(200).json(results.rows);
        }
      );
      break;
    default:
      response
        .status(404)
        .json({ status: "failure", message: "NO HAY UN LUGAR ASIGNADO" });
  }
};

const POSTLugar = async (request, response) => {
  const { nombre, tipo, lugar, tipo_lugar, tipo_lugar2, lugar2 } = request.body;
  if (lugar2 !== undefined) {
    pool.query(
      'INSERT INTO "LUGAR" (nombre, tipo, fk_lugar) VALUES ($1, $2, ((SELECT lugar_id from "LUGAR" WHERE nombre = $3 AND tipo = $4 AND fk_lugar = (SELECT lugar_id from "LUGAR" WHERE nombre = $5 AND tipo = $6))))',
      [nombre, tipo, lugar, tipo_lugar, lugar2, tipo_lugar2],
      (error) => {
        if (error) {
          throw error;
        }
        response.status(201).json({ status: "success", message: "Funciono" });
      }
    );
  } else {
    pool.query(
      'INSERT INTO "LUGAR" (nombre, tipo, fk_lugar) VALUES ($1, $2, ((SELECT lugar_id from "LUGAR" WHERE nombre = $3 AND tipo = $4)))',
      [nombre, tipo, lugar, tipo_lugar],
      (error) => {
        if (error) {
          throw error;
        }
        response.status(201).json({ status: "success", message: "Funciono" });
      }
    );
  }
};

const postUsuario = async (request, response) => {
  const { correo, contrasena, tipo } = request.body;
  if (tipo == "natural") {
    pool.query(
      'SELECT * FROM "NATURAL" WHERE correo_electronico = $1 AND contrasena = $2',
      [correo, contrasena],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(201).json(results.rows);
      }
    );
  } else if (tipo == "empleado") {
    pool.query(
      'SELECT * FROM "EMPLEADO" WHERE correo_electronico = $1 AND contrasena = $2',
      [correo, contrasena],
      (error, results) => {
        if (error) {
          throw error;
        }
        response.status(201).json(results.rows);
      }
    );
  }
};


const buscarLugar = async (request, response) => {
  const {lugar} = request.body
  pool.query(
    'SELECT lugar_id FROM "LUGAR" WHERE nombre=$1 and tipo =$2',
    [lugar, 'PARROQUIA'],
    (error, results) =>{
      if (error){
        throw error;
      }
      response.status(201).json(results.rows)
    }
  );
};

const postNatural = async (request, response) => {
  const {
    rif,
    correo,
    cedula,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    contrasena,
    tipo_cedula,
    telefono,
    lugar
  } = request.body;
  pool.query(
    'INSERT INTO "NATURAL" (rif, correo_electronico, cedula_identidad, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, contrasena, tipo_cedula, fk_lugar) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9, $10)',
    [
      rif,
      correo,
      cedula,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      contrasena,
      tipo_cedula,
      lugar
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      pool.query('INSERT INTO "TELEFONO" (numero_telefonico, fk_natural) VALUES ($1, $2)',
      [telefono, rif],
      (error, results) => {
        if (error){
          throw error;
        }
        response.status(201).json(results);
      }
      )
    }
  );
};

const postJuridico = async (request, response) => {
  const {
    rif,
    correo,
    denominacion_comercial,
    razon_social,
    pagina_web,
    capital_disponible,
    UCABMART,
    contrasena,
  } = request.body;
  pool.query(
    'INSERT INTO "JURIDICO" (rif, correo, deonimacion_comercial, razon_social, pagina_web, capital_disponible, UCABMART, contrasena) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [
      rif,
      correo,
      denominacion_comercial,
      razon_social,
      pagina_web,
      capital_disponible,
      UCABMART,
      contrasena,
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).json(results);
    }
  );
};

const getControl = async (request, response) => {
  const { tipo } = request.body;
  pool.query(
    'SELECT * FROM "LUGAR" WHERE tipo = $1',
    [tipo],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rowCount);
    }
  );
};

const http = require('http');
const jsreport = require('jsreport');

const getwhatever = async =>{
  http.createServer((req, res) => {
    jsreport.render({
      template: {
        content: '<h1>Hello world</h1>',
        engine: 'handlebars',
        recipe: 'chrone-pdf'
      }
    }).then((out)  => {
      out.stream.pipe(res);
    }).catch((e) => {
      res.end(e.message);
    });

  })
}

app
  .route("/buscarLugar")
  .post(buscarLugar)

app
  .route("/lugar")
  // GET endpoint
  //.get(GETLugar)
  // POST endpoint
  .post(POSTLugar);
// Start server
app
  .route("/especificoLugar")

  .post(postEspecificoLugar)

  .get(getwhatever);
app
  .route("/control")

  .post(getControl);
app
  .route("/login")

  .post(postUsuario);
app
  .route("/usuarioNatural")

  .post(postNatural);
app
  .route("/usuarioJuridico")

  .post(postJuridico);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening`);
});
