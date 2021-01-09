const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { pool } = require("./config");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const postLugarParroquia = async (request, response) => {
  const {parroquia} = request.body
  var ubicacion = []
  pool.query('SELECT * FROM "LUGAR" WHERE lugar_id = $1',
  [parroquia],
  (error, results) =>{
    if (error){
      throw error
    }
    ubicacion.push({
      key:'parroquia',
      value: results.rows[0]['nombre']
    })
    pool.query('SELECT * FROM "LUGAR" WHERE lugar_id = $1',
    [results.rows[0]['fk_lugar']],
    (error, results) =>{
      if (error){
        throw error
      }
      ubicacion.push({
        key: 'municipio',
        value: results.rows[0]['nombre']
      })
      pool.query('SELECT * FROM "LUGAR" WHERE lugar_id = $1',
      [results.rows[0]['fk_lugar']],
      (error, results) =>{
        if (error){
          throw error
        }
        ubicacion.push({
          key: 'estado',
          value: results.rows[0]['nombre']
        })
        response.status(200).json(ubicacion);
      }
      )
    }
    )
  }
  )
}

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
  var datosUsuario = []
  var rif
  if (tipo == "natural") {
    pool.query(
      'SELECT * FROM "NATURAL" WHERE correo_electronico = $1 AND contrasena = $2',
      [correo, contrasena],
      (error, results) => {
        if (error) {
          throw error;
        }
        rif = results.rows[0]['rif']
        datosUsuario.push(results.rows[0])
        pool.query(
          'SELECT * FROM "TELEFONO" WHERE fk_natural = $1 AND (prefijo = $2 OR prefijo = $3 OR prefijo = $4 OR prefijo = $5 OR prefijo = $6)',
          [rif, '0414','0424','0426','0412','0416'],
          (error, results) => {
            if (error) {
              throw error;
            }
            datosUsuario[0]['celular'] = results.rows[0]['numero_telefonico']
            datosUsuario[0]['prefijo_celular'] = results.rows[0]['prefijo']
            pool.query(
              'SELECT * FROM "TELEFONO" WHERE fk_natural = $1 AND prefijo = $2',
              [rif, '0212'],
              (error, results) => {
                if (error) {
                  throw error;
                }
                datosUsuario[0]['telefono'] = results.rows[0]['numero_telefonico']
                datosUsuario[0]['prefijo_telefono'] = results.rows[0]['prefijo']
                response.status(201).json(datosUsuario)
              }
            )
          }
        )
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

const registrarTelefono = async (celular, prefijo_celular, rif) =>{
  pool.query('INSERT INTO "TELEFONO" (numero_telefonico, prefijo, fk_natural) VALUES ($1, $2, $3)',
  [celular, prefijo_celular, rif],
  (error, results) => {
    if (error){
      throw error;
    }
    return results
  }
  )
}

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
    prefijo,
    celular,
    prefijo_celular,
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
      pool.query('INSERT INTO "TELEFONO" (numero_telefonico, prefijo, fk_natural) VALUES ($1, $2, $3)',
      [telefono, prefijo, rif],
      (error, results) => {
        if (error){
          throw error;
        }
        registrarTelefono(celular, prefijo_celular, rif)
        response.status(201).json({ status: "Funciono", message: "Registro exitoso" });
      }
      )
    }
  );
};

const postValidarRif = async(request, response) =>{
  const{
    rif,
    tipo
  } = request.body
  switch(tipo){
    case 'JURIDICO':
      pool.query('SELECT * FROM "JURIDICO" WHERE rif=$1',
      [rif],
      (error, results) => {
        if (error){
          throw error;
        }
        response.status(201).json(results.rowCount);
      }
      )
      break;
    case 'NATURAL':
      pool.query('SELECT * FROM "NATURAL" WHERE rif=$1',
      [rif],
      (error, results) => {
        if (error){
          throw error;
        }
        response.status(201).json(results.rowCount);
      }
      )
      break;
    case 'EMPLEADO':
      pool.query('SELECT * FROM "EMPLEADO" WHERE rif=$1',
      [rif],
      (error, results) => {
        if (error){
          throw error;
        }
        response.status(201).json(results.rowCount);
      }
      )
      break;
    default:
      response.status(404).json({ status: "Fallo", message: "Falta el tipo de usuario" });  
  }
}

const postValidarCorreo = async(request, response) =>{
  const{
    correo_electronico,
    tipo
  } = request.body
  switch(tipo){
    case 'JURIDICO':
      pool.query('SELECT * FROM "JURIDICO" WHERE correo_electronico=$1',
      [correo_electronico],
      (error, results) => {
        if (error){
          throw error;
        }
        response.status(201).json(results.rowCount);
      }
      )
      break;
    case 'NATURAL':
      pool.query('SELECT * FROM "NATURAL" WHERE correo_electronico=$1',
      [correo_electronico],
      (error, results) => {
        if (error){
          throw error;
        }
        response.status(201).json(results.rowCount);
      }
      )
      break;
    case 'EMPLEADO':
      pool.query('SELECT * FROM "EMPLEADO" WHERE correo_electronico=$1',
      [correo_electronico],
      (error, results) => {
        if (error){
          throw error;
        }
        response.status(201).json(results.rowCount);
      }
      )
      break;
    default:
      response.status(404).json({ status: "Fallo", message: "Falta el tipo de usuario" });  
  }
}

const postJuridico = async (request, response) => {
  const {
    rif,
    correo,
    denominacion_comercial,
    razon_social,
    pagina_web,
    capital_disponible,
    contrasena,
    telefono,
    prefijo_telefono,
    celular,
    prefijo_celular,
    lugar,
    persona_contacto_nombre,
    persona_contacto_apellido,
    persona_contacto_telefono,
    persona_contacto_celular,
    persona_contacto_prefijo_celular,
    persona_contacto_prefijo_telefono
  } = request.body;
  pool.query(
    'INSERT INTO "JURIDICO" (rif, correo_electronico, denominacion_comercial, razon_social, pagina_web, capital_disponible, contrasena, fk_lugar) VALUES ($1,$2,$3,$4,$5,$6,$7, $8)',
    [
      rif,
      correo,
      denominacion_comercial,
      razon_social,
      pagina_web,
      capital_disponible,
      contrasena,
      lugar
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      registrarTelefono(celular, prefijo_celular, rif)
      registrarTelefono(telefono, prefijo_telefono, rif)
      pool.query('INSERT INTO "PERSONA_CONTACTO" (nombre, primer_apellido, fk_juridico) VALUES ($1,$2,$3)',
      [persona_contacto_nombre, persona_contacto_apellido, rif],
      (error, results) => {
        if (error){
          throw error;
        }
        response.status(201).json(results.rows);
      }
      )
    }
  );
};

const postEmpleado = async (request, response) => {
  const {
    rif,
    correo,
    cedula,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    contrasena,
    telefono,
    prefijo,
    lugar,
    hora_inicio,
    hora_fin,
    dia
  } = request.body;
  pool.query(
    'INSERT INTO "EMPLEADO" (rif, correo_electronico, cedula_identidad, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, contrasena, fk_lugar) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9)',
    [
      rif,
      correo,
      cedula,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      contrasena,
      lugar
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      pool.query('INSERT INTO "TELEFONO" (numero_telefonico, fk_empleado, prefijo) VALUES ($1, $2, $3)',
      [telefono, prefijo, rif],
      (error, results) => {
        if (error){
          throw error;
        }
        pool.query('SELECT horario_id FROM "HORARIO" WHERE hora_inicio =$1 AND hora_fin =$2 and dia=$3',
        [hora_inicio, hora_fin, dia],
        (error, results) => {
          if (error){
            throw error;
          }
          pool.query('INSERT INTO "EMPLEADO_HORARIO" (fk_empleado, fk_horario) VALUES ($1, $2)',
          [rif, results.rows[0]['horario_id']],
          (error, results) => {
            if (error){
              throw error;
            }
            response.status(201).json({ status: "success", message: "Funciono" });    
          }
          )
        }
        )
      }
      )
    }
  );
};

const postHorario = async (request, response) => {
  const {
    hora_inicio,
    hora_fin,
    dia
  } = request.body;
  pool.query(
    'INSERT INTO "HORARIO" (hora_inicio, hora_fin, dia) VALUES ($1, $2, $3)',
    [
      hora_inicio,
      hora_fin,
      dia
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

app
  .route("/lugarparroquia")
  .post(postLugarParroquia)

app
  .route("/rif")
  .post(postValidarRif)

app
  .route("/correo")
  .post(postValidarCorreo)

app
  .route("/horario")
  .post(postHorario)

app
  .route("/empleado")
  .post(postEmpleado)

app
  .route("/buscarLugar")
  .post(buscarLugar)

app
  .route("/lugar")
  .post(POSTLugar)
app
  .route("/especificoLugar")
  .post(postEspecificoLugar)
app
  .route("/control")
  .post(getControl)
app
  .route("/login")
  .post(postUsuario)
app
  .route("/usuarioNatural")
  .post(postNatural)
app
  .route("/usuarioJuridico")
  .post(postJuridico)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening`);
});
