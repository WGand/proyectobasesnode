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
        .status(201)
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
        if(results.rowCount == 1){
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
        else if(results.rowCount == 0){
          response.status(201).json([])
        }
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
        if(results.rowCount == 1){
          rif = results.rows[0]['rif']
          datosUsuario.push(results.rows[0])
          pool.query(
            'SELECT * FROM "TELEFONO" WHERE fk_empleado = $1 AND (prefijo = $2 OR prefijo = $3 OR prefijo = $4 OR prefijo = $5 OR prefijo = $6)',
            [rif, '0414','0424','0426','0412','0416'],
            (error, results) => {
              if (error) {
                throw error;
              }
              datosUsuario[0]['celular'] = results.rows[0]['numero_telefonico']
              datosUsuario[0]['prefijo_celular'] = results.rows[0]['prefijo']
              pool.query(
                'SELECT * FROM "TELEFONO" WHERE fk_empleado = $1 AND prefijo = $2',
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
        else if(results.rowCount == 0){
          response.status(201).json([])
        }
      }
    );
  }
  else if (tipo == 'juridico'){
    pool.query(
      'SELECT * FROM "JURIDICO" WHERE correo_electronico = $1 AND contrasena = $2',
      [correo, contrasena],
      (error, results) => {
        if (error) {
          throw error;
        }
        if(results.rowCount == 1){
          rif = results.rows[0]['rif']
          datosUsuario.push(results.rows[0])
          pool.query(
            'SELECT * FROM "TELEFONO" WHERE fk_juridico = $1 AND (prefijo = $2 OR prefijo = $3 OR prefijo = $4 OR prefijo = $5 OR prefijo = $6)',
            [rif, '0414','0424','0426','0412','0416'],
            (error, results) => {
              if (error) {
                throw error;
              }
              datosUsuario[0]['celular'] = results.rows[0]['numero_telefonico']
              datosUsuario[0]['prefijo_celular'] = results.rows[0]['prefijo']
              pool.query(
                'SELECT * FROM "TELEFONO" WHERE fk_juridico = $1 AND prefijo = $2',
                [rif, '0212'],
                (error, results) => {
                  if (error) {
                    throw error;
                  }
                  datosUsuario[0]['telefono'] = results.rows[0]['numero_telefonico']
                  datosUsuario[0]['prefijo_telefono'] = results.rows[0]['prefijo']
                  //response.status(201).json(datosUsuario)
                  pool.query(
                    'SELECT * FROM "PERSONA_CONTACTO" WHERE fk_juridico = $1',
                    [rif],
                    (error, results) => {
                      if (error) {
                        throw error;
                      }
                      usuarioID = results.rows[0]['persona_id']
                      datosUsuario[0]['persona_contacto_nombre'] = results.rows[0]['nombre']
                      datosUsuario[0]['persona_contacto_primer_apellido'] = results.rows[0]['primer_apellido']
                      datosUsuario[0]['persona_contacto_segundo_apellido'] = results.rows[0]['segundo_apellido']
                      datosUsuario[0]['persona_contacto_nombre'] = results.rows[0]['nombre']
                      pool.query(
                        'SELECT * FROM "TELEFONO" WHERE fk_persona_contacto = $1 AND (prefijo = $2 OR prefijo = $3 OR prefijo = $4 OR prefijo = $5 OR prefijo = $6)',
                        [usuarioID, '0414','0424','0426','0412','0416'],
                        (error, results) => {
                          if (error) {
                            throw error;
                          }
                          datosUsuario[0]['persona_contacto_celular']=results.rows[0]['numero_telefonico']
                          datosUsuario[0]['persona_contacto_prefijo_celular']=results.rows[0]['prefijo']
                          pool.query(
                            'SELECT * FROM "TELEFONO" WHERE fk_persona_contacto = $1 AND prefijo =$2',
                            [usuarioID, '0212'],
                            (error, results) => {
                              if (error) {
                                throw error;
                              }
                              datosUsuario[0]['persona_contacto_telefono']=results.rows[0]['numero_telefonico']
                              datosUsuario[0]['persona_contacto_prefijo_telefono']=results.rows[0]['prefijo']
                              response.status(201).json(datosUsuario)
                            }
                          )
                        }
                      )
                    }
                  )
                }
              )
            }
          )
        }
        else if(results.rowCount == 0){
          response.status(201).json([])
        }
      }
    );
  }
};

function ordenarTelefonos(telefonos){
  var data = []
  if(telefonos[0]['prefijo'] == ('0414' || '0416' || '0412' || '0424' || '0426')){
    data[0]={['prefijo_celular']:telefonos[0]['prefijo']}
    data[0]['celular'] = telefonos[0]['numero_telefonico']
    data[0]['prefijo_telefono'] = telefonos[1]['prefijo']
    data[0]['telefono'] = telefonos[1]['numero_telefonico']
  }
  else{
    data[0]={['prefijo_celular']:telefonos[1]['prefijo']}
    data[0]['celular'] = telefonos[1]['numero_telefonico']
    data[0]['prefijo_telefono'] = telefonos[0]['prefijo']
    data[0]['telefono'] = telefonos[0]['numero_telefonico']
  }
  return data
}

const actualizarTelefono = async (celular, telefono, prefijo, prefijo_celular, rif, tipo) =>{
  switch(tipo){
    case 'natural':
      pool.query(
        'SELECT * FROM "TELEFONO" WHERE fk_natural = $1',
        [rif],
        (error, results) => {
          if (error) {
            throw error;
          }
          telefonos = results.rows
          data = ordenarTelefonos(telefonos)
          pool.query('UPDATE "TELEFONO" SET numero_telefonico=$1, prefijo=$2 WHERE fk_natural=$4 AND prefijo=$3',
          [celular, prefijo_celular, data[0]['prefijo_celular'], rif],
          (error, results) => {
            if (error){
              throw error;
            }
            pool.query('UPDATE "TELEFONO" SET numero_telefonico=$1, prefijo=$2 WHERE fk_natural=$4 AND prefijo=$3',
            [telefono, prefijo, data[0]['prefijo_telefono'], rif],
            (error, results) => {
              if (error){
                throw error;
              }
            }
            )
          }
          )
        }
      )
      break
    case 'juridico':
      pool.query(
        'SELECT * FROM "TELEFONO" WHERE fk_juridico = $1',
        [rif],
        (error, results) => {
          if (error) {
            throw error;
          }
          telefonos = results.rows
          data = ordenarTelefonos(telefonos)
          pool.query('UPDATE "TELEFONO" SET numero_telefonico=$1, prefijo=$2 WHERE fk_juridico=$4 AND prefijo=$3',
          [celular, prefijo_celular, data[0]['prefijo_celular'], rif],
          (error, results) => {
            if (error){
              throw error;
            }
            pool.query('UPDATE "TELEFONO" SET numero_telefonico=$1, prefijo=$2 WHERE fk_juridico=$4 AND prefijo=$3',
            [telefono, prefijo, data[0]['prefijo_telefono'], rif],
            (error, results) => {
              if (error){
                throw error;
              }
            }
            )
          }
          )
        }
      )
      break
    case 'empleado':
      pool.query(
        'SELECT * FROM "TELEFONO" WHERE fk_empleado = $1',
        [rif],
        (error, results) => {
          if (error) {
            throw error;
          }
          telefonos = results.rows
          data = ordenarTelefonos(telefonos)
          pool.query('UPDATE "TELEFONO" SET numero_telefonico=$1, prefijo=$2 WHERE fk_empleado=$4 AND prefijo=$3',
          [celular, prefijo_celular, data[0]['prefijo_celular'], rif],
          (error, results) => {
            if (error){
              throw error;
            }
            pool.query('UPDATE "TELEFONO" SET numero_telefonico=$1, prefijo=$2 WHERE fk_empleado=$4 AND prefijo=$3',
            [telefono, prefijo, data[0]['prefijo_telefono'], rif],
            (error, results) => {
              if (error){
                throw error;
              }
            }
            )
          }
          )
        }
      )
      break
    case 'persona_contacto':
      pool.query(
        'SELECT * FROM "TELEFONO" WHERE fk_persona_contacto = $1',
        [rif],
        (error, results) => {
          if (error) {
            throw error;
          }
          telefonos = results.rows
          console.log(data)
          pool.query('UPDATE "TELEFONO" SET numero_telefonico=$1, prefijo=$2 WHERE fk_persona_contacto=$4 AND prefijo=$3',
          [celular, prefijo_celular, data[0]['prefijo_celular'], rif],
          (error, results) => {
            if (error){
              throw error;
            }
            pool.query('UPDATE "TELEFONO" SET numero_telefonico=$1, prefijo=$2 WHERE fk_persona_contacto=$4 AND prefijo=$3',
            [telefono, prefijo, data[0]['prefijo_telefono'], rif],
            (error, results) => {
              if (error){
                throw error;
              }
            }
            )
          }
          )
        }
      )
      break
  }

}

const registrarTelefono = async (celular, prefijo_celular, rif, tipo) =>{
  switch(tipo){
    case 'natural':
      pool.query('INSERT INTO "TELEFONO" (numero_telefonico, prefijo, fk_natural) VALUES ($1, $2, $3)',
      [celular, prefijo_celular, rif],
      (error, results) => {
        if (error){
          throw error;
        }
        return results
      }
      )
      break
    case 'juridico':
      pool.query('INSERT INTO "TELEFONO" (numero_telefonico, prefijo, fk_juridico) VALUES ($1, $2, $3)',
      [celular, prefijo_celular, rif],
      (error, results) => {
        if (error){
          throw error;
        }
        return results
      }
      )
      break
    case 'empleado':
      pool.query('INSERT INTO "TELEFONO" (numero_telefonico, prefijo, fk_empleado) VALUES ($1, $2, $3)',
      [celular, prefijo_celular, rif],
      (error, results) => {
        if (error){
          throw error;
        }
        return results
      }
      )
      break
    case 'persona_contacto':
      pool.query('INSERT INTO "TELEFONO" (numero_telefonico, prefijo, fk_persona_contacto) VALUES ($1, $2, $3)',
      [celular, prefijo_celular, rif],
      (error, results) => {
        if (error){
          throw error;
        }
        return results
      }
      )
      break
  }

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
        registrarTelefono(celular, prefijo_celular, rif, 'natural')
        response.status(201).json({ status: "Funciono", message: "Registro exitoso" });
      }
      )
    }
  );
};

const updateNatural = async (request, response) => {
  const {
    rif,
    correo,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    contrasena,
    telefono,
    prefijo,
    celular,
    prefijo_celular,
    lugar
  } = request.body;
  var usuario
  pool.query(
    'SELECT * FROM "NATURAL" WHERE correo_electronico=$1',
    [
      correo
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      usuarioCantidad = results.rowCount
      usuario = results.rows[0]
      if(usuarioCantidad == 0){
        pool.query(
          'UPDATE "NATURAL" SET  correo_electronico=$2, primer_nombre=$3, segundo_nombre =$4, primer_apellido=$5, segundo_apellido=$6, contrasena=$7, fk_lugar=$8 WHERE rif=$1',
          [
            rif,
            correo,
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
            actualizarTelefono(celular, telefono, prefijo, prefijo_celular, rif,'natural')
            response.status(201).json({ status: "Funciono", message: "Registro exitoso" });
          }
        );
      }
      else if(usuarioCantidad > 0 && (usuario['rif'] != rif)){
        response.status(201).json({ status: "Error", message: "Existe una cuenta registrada con ese correo" });
      }
      else if(usuarioCantidad > 0 && usuario['rif'] == rif){
        pool.query(
          'UPDATE "NATURAL" SET primer_nombre=$2, segundo_nombre =$3, primer_apellido=$4, segundo_apellido=$5, contrasena=$6, fk_lugar=$7 WHERE rif=$1',
          [
            rif,
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
            actualizarTelefono(celular, telefono, prefijo, prefijo_celular, rif,'natural')
            response.status(201).json({ status: "Funciono", message: "Registro exitoso" });
          }
        );
      }
    }
  );
};

const updateJuridico = async (request, response) => {
  var persona_contacto_id
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
    persona_contacto_segundo_apellido,
    persona_contacto_telefono,
    persona_contacto_celular,
    persona_contacto_prefijo_celular,
    persona_contacto_prefijo_telefono
  } = request.body;
  pool.query(
    'SELECT * FROM "JURIDICO" WHERE correo_electronico =$1',
    [
      correo
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      usuarioCantidad = results.rowCount
      usuario = results.rows[0]
      if(usuarioCantidad == 0){
        pool.query(
          'UPDATE "JURIDICO" SET correo_electronico =$2, denominacion_comercial=$3, razon_social=$4, pagina_web=$5, capital_disponible=$6, contrasena=$7, fk_lugar=$8 WHERE rif=$1',
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
            actualizarTelefono(celular,telefono, prefijo_telefono, prefijo_celular, rif, 'juridico')
            pool.query('UPDATE "PERSONA_CONTACTO" SET nombre=$1, primer_apellido=$2, segundo_apellido=$3 WHERE fk_juridico=$4',
            [persona_contacto_nombre, persona_contacto_apellido, persona_contacto_segundo_apellido, rif],
            (error, results) => {
              if (error){
                throw error;
              }
              pool.query('SELECT persona_id FROM "PERSONA_CONTACTO" WHERE fk_juridico = $1',
              [rif],
              (error, results) => {
                if (error){
                  throw error;
                }
                persona_contacto_id = results.rows[0]['persona_id']
                actualizarTelefono(persona_contacto_celular, persona_contacto_telefono, persona_contacto_prefijo_telefono, persona_contacto_prefijo_celular, persona_contacto_id, 'persona_contacto')
                response.status(201).json({ status: "success", message: "Funciono" })
              }
              )
            }
            )
          }
        );
      }
      else if(usuarioCantidad > 0 && (usuario['rif'] != rif)){
      response.status(201).json({ status: "Error", message: "Existe una cuenta registrada con ese correo" });
      }
      else if(usuarioCantidad > 0 && usuario['rif'] == rif){
          pool.query(
            'UPDATE "JURIDICO" SET denominacion_comercial=$2, razon_social=$3, pagina_web=$4, capital_disponible=$5, contrasena=$6, fk_lugar=$7 WHERE rif=$1',
            [
              rif,
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
              actualizarTelefono(celular,telefono, prefijo_telefono, prefijo_celular, rif, 'juridico')
              pool.query('UPDATE "PERSONA_CONTACTO" SET nombre=$1, primer_apellido=$2, segundo_apellido=$3 WHERE fk_juridico=$4',
              [persona_contacto_nombre, persona_contacto_apellido, rif],
              (error, results) => {
                if (error){
                  throw error;
                }
                pool.query('SELECT persona_id FROM "PERSONA_CONTACTO" WHERE fk_juridico = $1',
                [rif],
                (error, results) => {
                  if (error){
                    throw error;
                  }
                  persona_contacto_id = results.rows[0]['persona_id']
                  actualizarTelefono(persona_contacto_celular, persona_contacto_telefono, persona_contacto_prefijo_telefono, persona_contacto_prefijo_celular, persona_contacto_id, 'persona_contacto')
                  response.status(201).json({ status: "success", message: "Funciono" })
                  }
                )
              }
            )
          }
        )
      }
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
      response.status(201).json({ status: "Fallo", message: "Falta el tipo de usuario" });  
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
      response.status(201).json({ status: "Fallo", message: "Falta el tipo de usuario" });  
  }
}

const postJuridico = async (request, response) => {
  var persona_contacto_id
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
      registrarTelefono(celular, prefijo_celular, rif, 'juridico')
      registrarTelefono(telefono, prefijo_telefono, rif, 'juridico')
      pool.query('INSERT INTO "PERSONA_CONTACTO" (nombre, primer_apellido, fk_juridico) VALUES ($1,$2,$3)',
      [persona_contacto_nombre, persona_contacto_apellido, rif],
      (error, results) => {
        if (error){
          throw error;
        }
        pool.query('SELECT persona_id FROM "PERSONA_CONTACTO" WHERE fk_juridico = $1',
        [rif],
        (error, results) => {
          if (error){
            throw error;
          }
          persona_contacto_id = results.rows[0]['persona_id']
          registrarTelefono(persona_contacto_celular, persona_contacto_prefijo_celular, persona_contacto_id, 'persona_contacto')
          registrarTelefono(persona_contacto_telefono, persona_contacto_prefijo_telefono, persona_contacto_id, 'persona_contacto')
          response.status(201).json({ status: "success", message: "Funciono" })
        }
        )
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
    celular,
    prefijo_celular,
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
      registrarTelefono(telefono, prefijo, 'empleado')
      registrarTelefono(celular, prefijo_celular, 'empleado')
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
            response.status(201).json({ status: "Funciono", message: "Usuario registrado exitosamente" });    
          }
          )
        }
      )
    }
  );
};

//pool.query('UPDATE "EMPLEADO_HORARIO" SET fk_empleado=$1, fk_horario=$2',
//[rif, results.rows[0]['horario_id']],
//(error, results) => {
//  if (error){
//    throw error;
//  }
//  response.status(201).json({ status: "Funciono", message: "Usuario registrado exitosamente" });
//}
//)

const updateEmpleado = async (request, response) => {
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
    celular,
    prefijo_celular,
    lugar,
    hora_inicio,
    hora_fin,
    dia
  } = request.body;
  pool.query(
    'SELECT * FROM "EMPLEADO" WHERE correo_electronico = $1',
    [correo],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rowCount);
      usuarioCantidad = results.rowCount
      usuario = results.rows[0]
      if(usuarioCantidad == 0){
        pool.query(
          'UPDATE "EMPLEADO" SET correo_electronico=$2, primer_nombre = $3, segundo_nombre=$4, primer_apellido=$5, segundo_apellido=$6, contrasena=$7, fk_lugar=$8 WHERE rif=$1',
          [
            rif,
            correo,
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
            actualizarTelefono(celular, telefono, prefijo, prefijo_celular, 'empleado')
            response.status(201).json({ status: "Funciono", message: "Usuario registrado exitosamente" })
          }
        );
      }
      else if(usuarioCantidad > 0 && (usuario['rif'] != rif)){
        response.status(201).json({ status: "Error", message: "Existe una cuenta registrada con ese correo" });
      }
      else if(usuarioCantidad > 0 && usuario['rif'] == rif){
        pool.query(
          'UPDATE "EMPLEADO" SET primer_nombre = $2, segundo_nombre=$3, primer_apellido=$4, segundo_apellido=$5, contrasena=$6, fk_lugar=$7 WHERE rif=$1',
          [
            rif,
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
            actualizarTelefono(celular, telefono, prefijo, prefijo_celular, 'empleado')
            response.status(201).json({ status: "Funciono", message: "Usuario registrado exitosamente" })
          }
        );
      }
    }
  )
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

const getTodos = async (request, response) => {
  var todo = {}
  pool.query(
    'SELECT * FROM "JURIDICO"',
    (error, results) => {
      if (error) {
        throw error;
      }
      for(i=0; i < results.rowCount; i++){
        results.rows[i]['id'] = results.rows[i]['rif']
      }
      todo['JURIDICO'] = results.rows
      pool.query(
        'SELECT * FROM "NATURAL"',
        (error, results) => {
          if (error) {
            throw error;
          }
          for(i=0; i < results.rowCount; i++){
            results.rows[i]['id'] = results.rows[i]['rif']
          }
          todo['NATURAL'] = results.rows
          pool.query(
            'SELECT * FROM "EMPLEADO"',
            (error, results) => {
              if (error) {
                throw error;
              }
              for(i=0; i < results.rowCount; i++){
                results.rows[i]['id'] = results.rows[i]['rif']
              }
              todo['EMPLEADO'] = results.rows
              response.status(201).json(todo)
            }
          );
        }
      );
    }
  );
}

const deleteNatural = async (request, response) => {
  const { rif } = request.body;
  pool.query(
    'SELECT * FROM "NATURAL" WHERE rif = $1',
    [rif],
    (error, results) => {
      if (error) {
        throw error;
      }
      borrarTelefono(rif, 'natural')
      pool.query(
        'DELETE FROM "NATURAL" WHERE rif = $1',
        [rif],
        (error, results) => {
          if (error) {
            throw error;
          }
          response.status(200).json({ status: "Funciono", message: "Usuario registrado exitosamente" })
        }
      )
    }
  )
}

const deleteJuridico = async (request, response) => {
  const { rif } = request.body;
  pool.query(
    'SELECT * FROM "JURIDICO" WHERE rif = $1',
    [rif],
    (error, results) => {
      if (error) {
        throw error;
      }
      borrarTelefono(rif, 'juridico')
      pool.query('SELECT persona_id FROM "PERSONA_CONTACTO" WHERE fk_juridico = $1',
      [rif],
      (error, results) => {
        if (error){
          throw error;
        }
        persona_contacto_id = results.rows[0]['persona_id']
        borrarTelefono(persona_contacto_id, 'persona_contacto')
        pool.query('DELETE FROM "PERSONA_CONTACTO" WHERE fk_juridico = $1',
        [rif],
        (error, results) => {
          if (error){
            throw error;
          }
          pool.query('DELETE FROM "JURIDICO" WHERE rif = $1',
          [rif],
          (error, results) => {
            if (error){
              throw error;
            }
            response.status(201).json({ status: "success", message: "Funciono" })
          }
          )
        }
        )
      }
      )
    }
  )
}

const deleteEmpleado = async (request, response) => {
  const { rif } = request.body;
  pool.query(
    'SELECT * FROM "EMPLEADO" WHERE rif = $1',
    [rif],
    (error, results) => {
      if (error) {
        throw error;
      }
      if(results.rowCount == 1){
        pool.query(
          'DELETE FROM "EMPLEADO_HORARIO" WHERE fk_empleado = $1',
          [rif],
          (error, results) => {
            if (error) {
              throw error;
            }
            pool.query(
              'DELETE FROM "EMPLEADO" WHERE rif = $1',
              [rif],
              (error, results) => {
                if (error) {
                  throw error;
                }
              borrarTelefono(rif, 'empleado')
              response.status(200).json({ status: "Funciono", message: "Usuario registrado exitosamente" })
              }
            )
          }
        )
      }
      else if(results.rowCount == 0){
        response.status(200).json([])
      }
    }
  )
}

const borrarTelefono = async(ID, tipo) =>{
  switch(tipo){
    case 'natural':
      pool.query(
        'DELETE FROM "TELEFONO" WHERE fk_natural = $1',
        [ID],
        (error, results) => {
          if (error) {
            throw error;
          }
        }
      )
      break
    case 'juridico':
      pool.query(
        'DELETE FROM "TELEFONO" WHERE fk_natural = $1',
        [ID],
        (error, results) => {
          if (error) {
            throw error;
          }
        }
      )
      break
    case 'persona_contacto':
      pool.query(
        'DELETE FROM "TELEFONO" WHERE fk_natural = $1',
        [ID],
        (error, results) => {
          if (error) {
            throw error;
          }
        }
      )
      break
    case 'empleado':
      pool.query(
        'DELETE FROM "TELEFONO" WHERE fk_natural = $1',
        [ID],
        (error, results) => {
          if (error) {
            throw error;
          }
        }
      )
      break
  }
}

const postTienda = async (request, response) =>{
  const{
    nombre,
    fk_lugar
  } = request.body
  var tienda_id, zona_id, pasillo_id
  pool.query(
    'INSERT INTO "TIENDA" (nombre, fk_lugar) VALUES ($1, $2) RETURNING tienda_id',
    [
      nombre,
      fk_lugar
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      tienda_id = results.rows[0]['tienda_id']
      pool.query(
        'INSERT INTO "ALMACEN" (nombre, cantidad, fk_tienda) VALUES ($1, $2, $3)',
        [
          'o',
          100,
          tienda_id
        ],
        (error, results) => {
          if (error) {
            throw error;
          }
          pool.query(
            'INSERT INTO "ZONA" (nombre) VALUES ($1) RETURNING zona_id ',
            [
              'D'
            ],
            (error, results) => {
              if (error) {
                throw error;
              }
              zona_id = results.rows[0]['zona_id']
              pool.query(
                'INSERT INTO "ALMACEN_ZONA" (tipo, fk_zona, fk_almacen) VALUES ($1, $2, $3)',
                [
                  'REFRIGERADOS',
                  zona_id,
                  tienda_id

                ],
                (error, results) => {
                  if (error) {
                    throw error;
                  }
                  pool.query(
                    'INSERT INTO "PASILLO" (nombre) VALUES ($1) RETURNING pasillo_id',
                    [
                      'F'
                    ],
                    (error, results) => {
                      if (error) {
                        throw error;
                      }
                      pasillo_id = results.rows[0]['pasillo_id']
                      pool.query(
                        'INSERT INTO "ZONA_PASILLO" (cantidad, fk_zona, fk_pasillo) VALUES ($1, $2, $3)',
                        [
                          100,
                          zona_id,
                          pasillo_id
                        ],
                        (error, results) => {
                          if (error) {
                            throw error;
                          }
                          response.status(201).json({message: "funciono"})
                          
                        }
                      )
                    }
                  )
                }
              )
            }
          )
        }
      )
    }
  )
}

const deleteTienda = async (request, response) =>{
  const{
    nombre
  } = request.body
  var tienda_id, zona_id, pasillo_id
  pool.query(
    'SELECT * FROM "TIENDA" WHERE nombre=$1',
    [
      nombre
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      tienda_id = results.rows[0]['tienda_id']

      pool.query(
        'SELECT * FROM "ALMACEN_ZONA" WHERE fk_almacen = $1',
        [
          tienda_id
        ],
        (error, results) => {
          if (error) {
            throw error;
          }
          zona_id = results.rows[0]['fk_zona']
          pool.query(
            'SELECT * FROM "ZONA_PASILLO" WHERE fk_zona = $1',
            [
              zona_id
            ],
            (error, results) => {
              if (error) {
                throw error;
              }
              pasillo_id = results.rows[0]['fk_pasillo']
              pool.query(
                'DELETE FROM "ALMACEN_ZONA" WHERE fk_almacen = $1 and fk_zona',
                [
                  tienda_id,
                  zona_id
                ],
                (error, results) => {
                  if (error) {
                    throw error;
                  }
                  pool.query(
                    'DELETE FROM "ZONA_PASILLO" WHERE fk_pasillo = $1 and fk_zona',
                    [
                      pasillo_id,
                      zona_id
                    ],
                    (error, results) => {
                      if (error) {
                        throw error;
                      }
                      pool.query(
                        'DELETE FROM "PASILLO" WHERE fk_pasillo = $1',
                        [
                          pasillo_id
                        ],
                        (error, results) => {
                          if (error) {
                            throw error;
                          }
                          pool.query(
                            'DELETE FROM "ZONA" WHERE fk_zona = $1',
                            [
                              zona_id
                            ],
                            (error, results) => {
                              if (error) {
                                throw error;
                              }
                              pool.query(
                                'DELETE FROM "ALMACEN" WHERE almacen_id = $1',
                                [
                                  tienda_id
                                ],
                                (error, results) => {
                                  if (error) {
                                    throw error;
                                  }
                                  pasillo_id = results.rows[0]['fk_pasillo']
                                  
                                }
                              )
                              
                            }
                          )
                          
                        }
                      )
                      
                    }
                  )  
                }
              )
            }
          )
        }
      )
    }
  )
}

const updateTienda = async (request, response) =>{
  const{
    nombre,
    fk_lugar
  } = request.body
  pool.query(
    'INSERT INTO "TIENDA" (nombre, fk_lugar) VALUES ($1, $2)',
    [
      nombre,
      fk_lugar
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).json(results);
    }
  )
}

const postProducto = async (request, response) => {
  const {
    imagen,
    nombre,
    precio,
    UCABMART,
    categoria
  } = request.body
  pool.query(
    'INSERT INTO "PRODUCTO" (imagen, nombre, precio, UCABMART, categoria) VALUES ($1, $2, $3, $4, $5)',
    [
      imagen,
      nombre,
      precio,
      UCABMART,
      categoria
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).json(results);
    }
  )
}

app
  .route("/tienda")
  .post(postTienda)
  .delete(deleteTienda)

app
  .route("/producto")


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
  .put(updateEmpleado)
  .delete(deleteEmpleado)

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
  .get(getTodos)
app
  .route("/usuarioNatural")
  .post(postNatural)
  .put(updateNatural)
  .delete(deleteNatural)
app
  .route("/usuarioJuridico")
  .post(postJuridico)
  .put(updateJuridico)
  .delete(deleteJuridico)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening`);
});
