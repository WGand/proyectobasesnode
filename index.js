const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { pool } = require("./config");
const PDFDocument = require('pdf-creator-node');
const fs = require("fs");
xlsxj = require("xlsx-to-json")
const multer = require("multer");
const {Validador, Empleado, Natural, ValidadorUsuario, Lugar, Telefono, Login, Juridico,
  PersonaContacto, Contenedor, Horario, Producto, Operacion, Estatus, Usuario, Punto, Tienda} = require('./clases');
const { response } = require("express");
const { Console } = require("console");
const e = require("express");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
let validador = new ValidadorUsuario()

function convertirArchivo(){
  xlsxj({
    input: "./uploads/horario.xlsx", 
    output: "output.json"
  }, function(err, result) {
    if(err) {
      console.error(err);
    }else {
      return result
    }
  });
}

function wait(milleseconds) {
  return new Promise(resolve => setTimeout(resolve, milleseconds))
}

const horarioEmpleados = async(request, response) => {
  convertirArchivo()
  data = JSON.parse(fs.readFileSync('output.json','utf-8'))
  for(let i = 2; i < 480; i++){
    if(data[i]['RIF'] != '' && data[i]['RIF'].length == 9 && data['HORA DE ENTRADA'] != "NaN:NaN"){
      await wait(300)
      await pool.query(
        'SELECT * FROM "EMPLEADO" WHERE rif=$1',
        [data[i]['RIF']],
        (error, results) => {
          if (error) {
            throw error;
          }
          if(results.rowCount == 1){
            pool.query(
              'INSERT INTO "ASISTENCIA" (fecha, horario_entrada, horario_salida, fk_empleado) VALUES ($1, $2, $3, $4)',
              [data[i]['FECHA'], data[i]['HORA DE ENTRADA'], data[i]['HORA DE SALIDA'], data[i]['RIF']],
              (error, results) => {
                if (error) {
                  throw error;
                }
              }
            )
          }
        }
      )
    }
  }
  response.status(201).json({mensaje:"listo"})
}

app.use(bodyParser.json());
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null,file.originalname)
    }
  });
var upload = multer({ //multer settings
                storage: storage
            }).single('file');

const subir = async(req, res) =>{
  upload(req,res,function(err){
    if(err){
      res.json({error_code:1,err_desc:err});
      return;
 }
  res.json({error_code:0,err_desc:null});
  })
}

const archivo = async(nombre, apellido, cedula, cliente)  => {
  var html = fs.readFileSync('./index.html', 'utf-8')
  var options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    header: {
      height: "45mm",
      contents: ''
    },
    "footer":{
      "height":"28mm",
      "contents":{
        first: '',
        2:'Second page',
        default:'',
        last: ''
      }}
    }
  var usuario = {
    nombre: nombre,
    apellido: apellido,
    cedula: cedula,
    cliente: cliente,
    tienda: '001'
  }
  var document = {
    html: html,
    data:{
      user: usuario
    },
    path: "./output.pdf"}
    PDFDocument.create(document, options)
    .then(res => {
    })
    .catch(error => {
    });
}

const reporteHorario = async(request, response) =>{
  pool.query('SELECT "EMPLEADO".*, "EMPLEADO_HORARIO".*, "HORARIO".*, "ASISTENCIA".* FROM (("EMPLEADO_HORARIO" INNER JOIN "HORARIO" ON "EMPLEADO_HORARIO".fk_horario = "HORARIO".horario_id) INNER JOIN "EMPLEADO" ON "EMPLEADO".rif = "EMPLEADO_HORARIO".fk_empleado) INNER JOIN "ASISTENCIA" ON "ASISTENCIA".fk_empleado = "EMPLEADO".rif',
  (error, results) =>{
      if (error){
        throw error
      }
      for(i = 0; i < results.rowCount; i++){
        if(results.rows[i]['horario_entrada'] == results.rows[i]['hora_inicio'] && results.rows[i]['horario_salida'] == results.rows[i]['hora_fin']){
          results.rows[i]['cumplio'] = 'SI'
        }
        else{
          results.rows[i]['cumplio'] = 'NO'
        }
      }
      let obj = results.rows
      var k = '<table>'
      k+= '<tr>';
      k+= '<td>' + 'C.I' + '</td>';
      k+= '<td>' + 'PRIMER NOMBRE'+ '</td>';
      k+= '<td>' + 'SEGUNDO NOMBRE'+ '</td>';
      k+= '<td>' + 'PRIMER APELLIDO'+ '</td>';
      k+= '<td>' + 'SEGUNDO APELLIDO'+ '</td>';
      k+= '<td>' + 'FECHA'+ '</td>';
      k+= '<td>' + 'HORARIO ENTRADA' + '</td>';
      k+= '<td>' + 'HORARIO SALIDA'+ '</td>';
      k+= '<td>' + 'CUMPLIMIENTO'+ '</td>';
      k+= '</tr>';
      for(i = 0;i < obj.length; i++){
          k+= '<tr>';
          k+= '<td>' + obj[i]['cedula_identidad'] + '</td>';
          k+= '<td>' + obj[i]['primer_nombre'] + '</td>';
          k+= '<td>' + obj[i]['segundo_nombre'] + '</td>';
          k+= '<td>' + obj[i]['primer_apellido'] + '</td>';
          k+= '<td>' + obj[i]['segundo_apellido'] + '</td>';
          k+= '<td>' + obj[i]['fecha'] + '</td>';
          k+= '<td>' + obj[i]['horario_entrada'] + '</td>';
          k+= '<td>' + obj[i]['horario_salida'] + '</td>';
          k+= '<td>' + obj[i]['cumplio'] + '</td>';
          k+= '</tr>';
      }
      k+='</table>';
      fs.writeFile('./reporteH.html', k, function (err) {
        if (err) throw err;               console.log('Results Received');
      }); 
        response.status(201).json({message:"listo"})
    }
  )
}

const imprimirCarnetUsuario = async(request, response) =>{
  const {rif} = request.body
  pool.query('SELECT * FROM "NATURAL" WHERE rif = $1',
  [rif],
  (error, results) =>{
      if (error){
        throw error
      }
      if(results.rowCount == 1){
        archivo(results.rows[0]['primer_nombre'], results.rows[0]['primer_apellido'], results.rows[0]['cedula_identidad'], results.rows[0]['rif'])
        response.status(201).json({mensae:"listo"})
      }
      else{
        response.status(201).json({mensaje:"No se encontr[o"})
      }
    }
  )
}

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
      )
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
      )
      break;
    default:
      response
        .status(201)
        .json({ status: "failure", message: "NO HAY UN LUGAR ASIGNADO" });
  }
}

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
    )
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
    )
  }
}

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
    )
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
                  pool.query(
                    'SELECT * FROM "EMPLEADO_HORARIO" WHERE fk_empleado = $1',
                    [rif],
                    (error, results) => {
                      if (error) {
                        throw error;
                      }
                      pool.query(
                        'SELECT * FROM "HORARIO" WHERE horario_id = $1',
                        [results.rows[0]['fk_horario']],
                        (error, results) => {
                          if (error) {
                            throw error;
                          }
                          datosUsuario[0]['hora_inicio'] = results.rows[0]['hora_inicio']
                          datosUsuario[0]['hora_fin'] = results.rows[0]['hora_fin']
                          datosUsuario[0]['dia'] = results.rows[0]['dia']
                          pool.query(
                            'SELECT * FROM "EMPLEADO_CARGO" WHERE fk_empleado=$1',
                            [
                              rif
                            ],
                            (error, results) => {
                              if (error) {
                                throw error;
                              }
                              datosUsuario[0]['cargos'] = results.rows
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
    )
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
    )
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
  )
}

const postNatural = async (request, response) => {
  const {
    rif,
    correo_electronico,
    cedula,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    contrasena,
    tipo_cedula,
    telefono,
    prefijo_telefono,
    celular,
    prefijo_celular,
    parroquia,
    municipio,
    estado
  } = request.body;

  if(Object.keys(request.body).length == 16){
    if(validador.natural(request.body) && validador.telefonos(request.body) && (await validador.existeLugar(request.body))>0){
      let lugarUsuario = new Lugar(parroquia, municipio, estado)
      let telefonoUsuario = new Telefono(telefono, prefijo_telefono, celular, prefijo_celular)
      let usuario = new Natural(rif, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, tipo_cedula)
      usuario.lugar = lugarUsuario
      usuario.telefono = telefonoUsuario
      if(!(await validador.existeRif(usuario.rif, usuario.tipo_usuario_tabla)) && !(await validador.existeCorreo(usuario.rif, usuario.tipo_usuario_tabla))){
        if((await usuario.insertarUsuario()) == 1 && (await usuario.telefono.insertarTelefono(usuario.rif, usuario.tipo_usuario)) == 1 &&
        (await usuario.telefono.insertarCelular(usuario.rif, usuario.tipo_usuario)) == 1){
          response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
        }
      }
      else{
        response.status(201).json([])
      }
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const updateNatural = async (request, response) => {
  const {
    rif,
    correo_electronico,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    contrasena,
    telefono,
    prefijo_telefono,
    celular,
    prefijo_celular,
    parroquia,
    municipio,
    estado
  } = request.body;
  if(Object.keys(request.body).length == 14){
    if(validador.natural(request.body) && validador.telefonos(request.body) && (await validador.existeLugar(request.body))>0){
      let lugarUsuario = new Lugar(parroquia, municipio, estado)
      let telefonoUsuario = new Telefono(telefono, prefijo_telefono, celular, prefijo_celular)
      let usuario = new Natural(rif, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido)
      usuario.lugar = lugarUsuario
      usuario.telefono = telefonoUsuario
      if(await validador.existeRif(usuario.rif, usuario.tipo_usuario_tabla)){
        if((await usuario.actualizarUsuario()) && (await usuario.telefono.actualizarTelefono(usuario.rif, usuario.tipo_usuario))
        && (await usuario.telefono.actualizarCelular(usuario.rif, usuario.tipo_usuario))){
          response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
        }
        else{
          response.status(201).json([])
        }
      }
      else{
        response.status(201).json([])
      }
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const deleteNatural = async (request, response) => {
  const { rif } = request.body;
  let usuario = new Natural(rif)
  if(await usuario.usuarioExiste()){
    if(await usuario.telefono.eliminarTelefono(usuario.rif, usuario.tipo_usuario)){
      if(await usuario.eliminarUsuario()){
        response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
      }
      else{
        response.status(201).json([])
      }
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const postJuridico = async (request, response) => {
  const{
    rif, 
    correo_electronico, 
    contrasena, 
    denominacion_comercial, 
    razon_social, 
    pagina_web, 
    capital_disponible, 
    telefono,
    prefijo_telefono, 
    celular, 
    prefijo_celular, 
    parroquia, 
    municipio, 
    estado, 
    persona_contacto_nombre, 
    persona_contacto_primer_apellido,
    persona_contacto_segundo_apellido, 
    persona_contacto_telefono, 
    persona_contacto_prefijo_telefono, 
    persona_contacto_celular,
    persona_contacto_prefijo_celular
  } = request.body
  if(Object.keys(request.body).length == 21){
    if(validador.Juridico(request.body) && validador.telefonos(request.body) && await validador.existeLugar(request.body) && 
    validador.PersonaContacto(request.body)){
      let lugarUsuario = new Lugar(parroquia, municipio, estado)
      let telefonoUsuario = new Telefono(telefono, prefijo_telefono, celular, prefijo_celular)
      let usuario = new Juridico(rif, correo_electronico, contrasena, denominacion_comercial, razon_social, pagina_web, capital_disponible)
      let personaContacto = new PersonaContacto(persona_contacto_nombre, persona_contacto_primer_apellido, persona_contacto_segundo_apellido)
      personaContacto.telefono = new Telefono(persona_contacto_telefono, persona_contacto_prefijo_telefono, persona_contacto_celular, persona_contacto_prefijo_celular)
      usuario.lugar = lugarUsuario
      usuario.telefono = telefonoUsuario
      if((await usuario.insertarUsuario()) == 1 && (await usuario.telefono.insertarCelular(usuario.rif, usuario.tipo_usuario)) ==1 &&
      (await usuario.telefono.insertarTelefono(usuario.rif, usuario.tipo_usuario)) == 1){
        if((await personaContacto.insertarPersonaContacto(usuario.rif)) == 1 && 
        (await personaContacto.telefono.insertarTelefono(personaContacto.id, personaContacto.tipo_usuario)) == 1 && 
        (await personaContacto.telefono.insertarCelular(personaContacto.id, personaContacto.tipo_usuario)) == 1){
          response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
        }
        else{
          response.status(201).json([])
        }
      }
      else{
        response.status(201).json([])
      }
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const updateJuridico = async (request, response) => {
  const {
    rif, 
    correo_electronico, 
    contrasena, 
    denominacion_comercial, 
    razon_social, 
    pagina_web, 
    capital_disponible, 
    telefono,
    prefijo_telefono, 
    celular, 
    prefijo_celular, 
    parroquia, 
    municipio, 
    estado, 
    persona_contacto_nombre, 
    persona_contacto_primer_apellido,
    persona_contacto_segundo_apellido, 
    persona_contacto_telefono, 
    persona_contacto_prefijo_telefono, 
    persona_contacto_celular,
    persona_contacto_prefijo_celular
  } = request.body;
  if(Object.keys(request.body).length == 21){
    if(validador.Juridico(request.body) && validador.telefonos(request.body) && await validador.existeLugar(request.body) && 
    validador.PersonaContacto(request.body)){
      let lugarUsuario = new Lugar(parroquia, municipio, estado)
      let telefonoUsuario = new Telefono(telefono, prefijo_telefono, celular, prefijo_celular)
      let usuario = new Juridico(rif, correo_electronico, contrasena, denominacion_comercial, razon_social, pagina_web, capital_disponible)
      let personaContacto = new PersonaContacto(persona_contacto_nombre, persona_contacto_primer_apellido, persona_contacto_segundo_apellido)
      personaContacto.telefono = new Telefono(persona_contacto_telefono, persona_contacto_prefijo_telefono, persona_contacto_celular, 
        persona_contacto_prefijo_celular)
      usuario.lugar = lugarUsuario
      usuario.telefono = telefonoUsuario
      if(await usuario.actualizarUsuario() && await usuario.telefono.actualizarCelular(usuario.rif, usuario.tipo_usuario) &&
      await usuario.telefono.actualizarTelefono(usuario.rif, usuario.tipo_usuario)){
        if(await personaContacto.actualizarPersonaContacto(usuario.rif) && 
        await personaContacto.telefono.actualizarTelefono(personaContacto.id, personaContacto.tipo_usuario) &&
        await personaContacto.telefono.actualizarCelular(personaContacto.id, personaContacto.tipo_usuario)){
          response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
        }
        else{
          response.status(201).json([])
        }
      }
      else{
        response.status(201).json([])
      }
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const deleteJuridico = async (request, response) => {
  const{
    rif, 
  } = request.body
  let usuario = new Juridico(rif)
  await usuario.usuarioExiste()
  if(usuario != null && usuario != undefined){
    usuario.persona_contacto = new PersonaContacto()
    await usuario.persona_contacto.personaExiste(rif)
    await usuario.persona_contacto.idPersona(rif)
    if(await usuario.telefono.eliminarTelefono(usuario.rif, usuario.tipo_usuario) && 
    await usuario.persona_contacto.telefono.eliminarTelefono(usuario.persona_contacto.id ,usuario.persona_contacto.tipo_usuario)){
      if(await usuario.persona_contacto.eliminarPersonaContacto(rif)){
        if(await usuario.eliminarUsuario()){
          response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
        }
        else{
          response.status(201).json([])
        }
      }
      else{
        response.status(201).json([])
      }
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const postEmpleado = async (request, response) => {
  const {
    rif,
    correo_electronico,
    cedula,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    contrasena,
    tipo_cedula,
    parroquia,
    municipio,
    estado,
    telefono,
    prefijo_telefono,
    celular,
    prefijo_celular,
    horario,
    tienda_id
  } = request.body;
  if(Object.keys(request.body).length > 0){
    let tienda = new Tienda()
    tienda.id = tienda_id
    if(validador.Empleado(request.body) && validador.telefonos(request.body) && (await validador.existeLugar(request.body))>0 && (await tienda.buscarTiendaConId())){
      let lugarUsuario = new Lugar(parroquia, municipio, estado)
      let telefonoUsuario = new Telefono(telefono, prefijo_telefono, celular, prefijo_celular)
      let usuario = new Empleado(rif, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, tipo_cedula)
      let contenedor = new Contenedor(rif)
      let hora = new Horario()
      await contenedor.ordenarHorario(horario)
      usuario.lugar = lugarUsuario
      usuario.telefono = telefonoUsuario
      if(!(await validador.existeRif(usuario.rif, usuario.tipo_usuario_tabla)) && !(await validador.existeCorreo(usuario.rif, usuario.tipo_usuario_tabla))){
        if((await usuario.insertarUsuario()) == 1 && (await usuario.telefono.insertarTelefono(usuario.rif, usuario.tipo_usuario)) == 1 &&
        (await usuario.telefono.insertarCelular(usuario.rif, usuario.tipo_usuario)) == 1 && (await hora.insertarEmpleadoHorario(rif, contenedor.contenedor))){
          await usuario.asignarTienda(tienda_id)
          response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
        }
        else{
          response.status(201).json([])
        }
      }
      else{
        response.status(201).json([])
      }
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const updateEmpleado = async (request, response) => {
  const {
    rif,
    correo_electronico,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    contrasena,
    parroquia,
    municipio,
    estado,
    telefono,
    prefijo_telefono,
    celular,
    prefijo_celular,
    horario
  } = request.body
  if(Object.keys(request.body).length == 15){
    let contenedor = new Contenedor(rif)
    if(validador.Empleado(request.body) && validador.telefonos(request.body) && (await validador.existeLugar(request.body))>0 
    && await contenedor.ordenarHorario(horario)){
      let lugarUsuario = new Lugar(parroquia, municipio, estado)
      let telefonoUsuario = new Telefono(telefono, prefijo_telefono, celular, prefijo_celular)
      let usuario = new Empleado(rif, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido)
      let horario = new Horario()
      usuario.lugar = lugarUsuario
      usuario.telefono = telefonoUsuario
      usuario.contenedor = contenedor
      if(await usuario.actualizarUsuario() && await usuario.telefono.actualizarTelefono(usuario.rif, usuario.tipo_usuario) &&
      usuario.telefono.actualizarCelular(usuario.rif, usuario.tipo_usuario) && horario.actualizarHorario(rif, contenedor.contenedor)){
        response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
      }
   }
   else{
     response.status(201).json([])
   }
  }
  else{
    response.status(201).json([])
  }
}

const deleteEmpleado = async (request, response) => {
  const { rif } = request.body;
  let usuario = new Empleado(rif)
  let horario = new Horario()
  await usuario.usuarioExiste()
  if(usuario != null && usuario != undefined){
    if(await usuario.telefono.eliminarTelefono(usuario.rif, usuario.tipo_usuario) && await horario.eliminarHorario(rif)){
      if(await usuario.eliminarUsuario()){
        response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
      }
      else{
        response.status(201).json([])
      }
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const postProveedor = async (request, response) => {
  const
  {
    rif,
    rubro
  } = request.body
  let usuario = new Juridico(rif)
  if(await validador.existeRif(rif, usuario.tipo_usuario_tabla)){
    if(await usuario.usuarioExiste()){
      usuario.rubro = rubro
      if(await usuario.insertarProveedor()){
        response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
      }
      else{
        response.status(201).json([])
      }
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const deleteProveedor = async (request, response) =>{
  const 
  { 
    rif
  } = request.body;
  let usuario = new Juridico(rif)
  if(await validador.existeRif(rif, usuario.tipo_usuario_tabla)){
    if(await usuario.usuarioExiste()){
      if(await usuario.eliminarProveedor()){
        response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
      }
      else{
        response.status(201).json([])
      }
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const postProducto = async (request, response) => {
  const {
    rif, 
    imagen,
    nombre,
    precio,
    ucabmart,
    categoria
  } = request.body;
  let usuario = new Juridico(rif)
  let producto = new Producto('', imagen, nombre, precio, ucabmart, categoria)
  if(await usuario.usuarioExiste()){
    if(await producto.insertarProducto(rif)){
      response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const updateProducto = async(request, response) =>{
  const {
    producto_id,
    imagen,
    nombre,
    precio,
    ucabmart,
    categoria
  } = request.body;
  let producto = new Producto(producto_id, imagen, nombre, precio, ucabmart, categoria)
  if(await producto.actualizarProducto()){
    response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
  }
  else{
    response.status(201).json([])
  }
}

const deleteProducto = async(request, response) =>{
  const {
    producto_id
  } = request.body;
  let producto = new Producto(producto_id)
  if(producto.eliminarProducto()){
    response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
  }
  else{
    response.status(201).json([])
  }
}

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
  )
}

const getHorario = async (request, response) => {
  pool.query(
    'SELECT * FROM "HORARIO"',
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).json(results.rows);
    }
  )
}

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
  )
}

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
              )
            }
        )
      }
  )
}

const getTienda = async(request, response) => {
  pool.query(
    'SELECT * FROM "TIENDA"',
    (error, results) => {
      if (error) {
        throw error;
      }
      for(i = 0; i < results.rowCount; i++){
        results.rows[i]['id'] = results.rows[i]['tienda_id']
      }
      response.status(201).json(results.rows)
    }
  )
}

const postTienda = async(request, response) =>{
  const{
    nombre,
    parroquia,
    municipio,
    estado
  } = request.body
  let lugar = new Lugar(parroquia, municipio, estado)
  let tienda = new Tienda(nombre, parroquia, municipio, estado)
  if(await validador.existeLugar(lugar)==1 && nombre != '' && !(await tienda.tiendaExiste())){
    await tienda.insertarTienda()
    await tienda.crearInventario()
    response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
  }
  else{
    response.status(201).json([])
  }
}

const updateTienda = async(request, response) =>{
  const{
    nombre,
    tienda_id
  } = request.body
  let tienda = new Tienda(nombre)
  if(!(await tienda.tiendaExiste())){
    let tiendaCambiada = new Tienda(nombre)
    tiendaCambiada.id = tienda_id
    if(await tiendaCambiada.actualizarTienda()){
      response.status(201).json({ status: "Funciono", message: "Registro exitoso"})
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const deleteTienda = async(request, response) =>{
  const{
    nombre
  } = request.body
  let tienda = new Tienda(nombre)
  if(await tienda.tiendaExiste()){
    await tienda.eliminarTienda()
    response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
  }
  else{
    response.status(201).json([])
  }
}

const postValidarTienda = async(request, response) => {
  const{
    nombre
  } = request.body
  pool.query(
    'SELECT * FROM "TIENDA" WHERE nombre=$1',
    [nombre],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).json(results.rows)
    }
  )
}

const postInventario = async (request, response) =>{
  const{
    tienda_id
  } = request.body
  if(tienda_id != ''){
    pool.query(
      'SELECT * FROM "TIENDA" WHERE tienda_id=$1',
      [tienda_id],
      (error, results) => {
        if (error) {
          throw error;
        }
        if(results.rowCount == 1){
          pool.query(
            'SELECT "ALMACEN".cantidad, "PRODUCTO".* FROM "PRODUCTO" INNER JOIN "ALMACEN" ON "PRODUCTO".producto_id = "ALMACEN".fk_producto WHERE fk_tienda=$1',
            [tienda_id],
            (error, results) => {
              if (error) {
                throw error;
              }
              for(i = 0; i < results.rowCount; i++){
                results.rows[i]['id'] = results.rows[i]['producto_id']
              }
              response.status(201).json(results.rows)
            }
          )
        }else{
          response.status(201).json([])
        }
      }
    )
  }else{
    response.status(201).json([])
  }
}

const productosOrdenados = async(request, response) =>{
  pool.query(
    'SELECT producto_id AS id, imagen, nombre, precio, ucabmart, categoria FROM "PRODUCTO" ORDER BY nombre',
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).json(results.rows)
    }
  )
}

const postOrden = async(request, response) => {
  const {
    producto,
    tienda_id,
    tipo_compra,
    rif,
    fecha,
    monto_total,
    tipo// natural, empleado, juridico
  } = request.body
  let contenedor = new Contenedor()
  let usuarioGenerico = new Usuario()
  let tienda = new Tienda()
  tienda.id = tienda_id
  let usuario = await usuarioGenerico.crearUsuario(tipo)
  if(await contenedor.ordenarProducto(producto) && await validador.existeRif(rif, usuario.tipo_usuario_tabla)){
    let operacion = new Operacion('', fecha, monto_total, '')
    let estadoPendiente = new Estatus('', 'Pendiente')
    await operacion.insertarOperacion(usuario.tipo_usuario, rif)
    await estadoPendiente.buscarEstado()
    await operacion.insertarOperacionEstatus(estadoPendiente)
    await operacion.insertarOrden(contenedor.contenedor)
    await operacion.insertarTienda(tienda_id)
    if(tipo_compra == 'presencial'){
      await tienda.actualizarCantidadPasillo(producto)
    }
    else if(tipo_compra == 'en linea'){
      await tienda.actualizarCantidadAlmacen(producto)
    }
    response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
  }
  else{
    response.status(201).json([])
  }
}

const ordenPaga = async(request, response) =>{
  const {
    operacion_id,
    rif,
    tipo,
    estatus,
    metodo
  } = request.body;
  let contenedor = new Contenedor(rif)
  let usuariogenerico = new Usuario()
  let operacion = new Operacion()
  operacion.id = operacion_id
  let estadoPagado = new Estatus('', estatus)
  await estadoPagado.buscarEstado()
  let usuario = await usuariogenerico.crearUsuario(tipo)
  usuario.rif = rif
  if((await validador.existeRif(rif, usuario.tipo_usuario_tabla)) && (await contenedor.ordenarMetodos(metodo, usuario.rif, usuario.tipo_usuario)) && 
  (estatus == 'Recibido' || estatus == 'Pagado')){
    await operacion.buscarOperacionId()
    let estado = await operacion.buscarEstadoOperacion()
    if(estado == 1){
      await operacion.actualizarOperacionEstatus(estadoPagado)
      await operacion.actualizarOperacion(1)
      await contenedor.insertarMetodos(usuario.rif, usuario.tipo_usuario)
      response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const updateOrden = async(request, response) =>{
  const {
    producto,
    rif,
    fecha,
    monto_total,
    tipo
  } = request.body;
  let contenedor = new Contenedor(rif)
  let usuarioGenerico = new Usuario()
  let usuario = await usuarioGenerico.crearUsuario(tipo)
  if(await contenedor.ordenarProducto(producto) && await validador.existeRif(rif, usuario.tipo_usuario_tabla)){
    let operacion = new Operacion('', fecha, monto_total, '')
    await operacion.buscarOperacion(usuario.tipo_usuario, rif)
    await contenedor.eliminarListaProducto(operacion.id, operacion.tipo)
    await operacion.insertarOrden(contenedor.contenedor)
    response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
  }
  else{
    response.status(201).json([])
  }
}

const todosOrdenes = async(request, response) =>{
  const {
    rif,
    tipo
  } = request.body;
  let contenedorProductos = new Contenedor(rif)
  let contenedorEstatus = new Contenedor()
  let usuarioGenerico = new Usuario()
  let operacion = new Operacion()
  let usuario = await usuarioGenerico.crearUsuario(tipo)
  if(await validador.existeRif(rif, usuario.tipo_usuario_tabla)){
    let opera = new Operacion()
    operacion = await operacion.buscarTodos(usuario.tipo_usuario, rif)
    for(let i=0; i< operacion.length; i++){
      opera.id = operacion[i].operacion_id
      if(await opera.buscarEstadoOperacion() == 1){
        await opera.actualizarOperacion(0)
      }
    }
    await contenedorProductos.buscarTodosProductos(operacion)
    await contenedorEstatus.buscarTodosEstados(operacion)
    let todo = {}
    todo['productos'] = contenedorProductos.contenedor
    todo['ordenes'] = contenedorEstatus.contenedor
    todo['operaciones'] = operacion
    response.status(201).json(todo)
  }
  else{
    response.status(201).json([])
  }
}

const puntosUsuario = async(request, response) =>{
  const{
    rif,
    tipo
  } = request.body
  let usuarioGenerico = new Usuario()
  let usuario = await usuarioGenerico.crearUsuario(tipo)
  usuario.rif = rif
  if(await validador.existeRif(usuario.rif, usuario.tipo_usuario_tabla)){
    let punto = new Punto()
    if(await punto.buscarPuntos(usuario.rif, usuario.tipo_usuario)){
      response.status(201).json(punto)
    }
    else{
      response.status(201).json([])
    }
  }
  else{
    response.status(201).json([])
  }
}

const ordenCajeroMasReciente = async(request, response) =>{
  const{
    rif,
    tipo
  } = request.body
  pool.query(
    'SELECT operacion_id FROM "OPERACION" WHERE fk_'+tipo+'=$1 ORDER BY fecha_orden DESC LIMIT 1',
    [
        rif
    ],
    (error, results) =>{
        if(error){
            throw error
        }
        response.status(201).json(results.rows[0])
    }
  )
}

const cambioPunto = async(request, response) =>{
  let precio = new Promise((resolve, reject) =>{
      pool.query(
          'SELECT * FROM "HISTORICO_PUNTO" WHERE fecha = (SELECT MAX(fecha) FROM "HISTORICO_PUNTO")',
          (error, results) => {
              if(error){
                  reject(error)
              }
              resolve(results.rows)
          }
      )
  })
  response.status(201).json(await precio)
}

const cambioDivisa = async(request, response) =>{
const {
  tipo
} = request.body;
let precio = new Promise((resolve, reject) =>{
      pool.query(
        'SELECT * FROM "HISTORICO_DIVISA" WHERE tipo=$1 AND fecha =(SELECT MAX(fecha) FROM "HISTORICO_DIVISA" WHERE tipo=$1)',
          [
              tipo
          ],
          (error, results) => {
              if(error){
                  reject(error)
              }
              resolve(results.rows)
          }
      )
  })
  response.status(201).json(await precio)
}

const productoParticular = async(request, response) =>{
  const{
    producto_id
  } = request.body
  let producto = new Producto(producto_id)
  producto = await producto.buscarProductoId()
  if(producto != null){
    response.status(201).json(producto)
  }
  else{
    response.status(201).json([])
  }
  
}

const buscarCargo = async(request, response) =>{
  const{
    rif
  } = request.body
  let usuario = new Empleado()
  if(await validador.existeRif(rif, usuario.tipo_usuario_tabla)){
    usuario.rif = rif
    let cargos = await usuario.buscarCargos()
    response.status(201).json(cargos)
  }
  else{
    response.status(201).json([])
  }
}

const postCargo = async(request, response) =>{
  const{
    rif,
    cargo
  } = request.body
  let usuario = new Empleado()
  if(await validador.existeRif(rif, usuario.tipo_usuario_tabla)){
    usuario.rif = rif
    let arreglo = JSON.parse(cargo)
    for(let i=0; i<Object.keys(arreglo).length; i++){
      await usuario.insertarEmpleadoCargo(arreglo[i].id)
    }
    response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
  }
  else{
    response.status(201).json([])
  }
}

const updateCargo = async(request, response) =>{
  const{
    rif,
    cargo_viejo,
    cargo_nuevo
  } = request.body
  let usuario = new Empleado()
  if(await validador.existeRif(rif, usuario.tipo_usuario_tabla)){
    usuario.rif = rif
    if(cargo_viejo != null && cargo_viejo != undefined){
      let arreglo_viejo = JSON.parse(cargo_viejo)
      for(let i=0; i<Object.keys(arreglo_viejo).length; i++){
        await usuario.actualizarEmpleadoCargo(arreglo_viejo[i].id, validador.obtenerHora())
      }
    }
    if(cargo_nuevo != null && cargo_nuevo != undefined){
      let arreglo_nuevo = JSON.parse(cargo_nuevo)
      for(let i=0; i<Object.keys(arreglo_nuevo).length; i++){
        await usuario.insertarEmpleadoCargo(arreglo_nuevo[i].id)
      }
    }

    response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
  }
  else{
    response.status(201).json([])
  }
}

const inventarioTienda = async(request, response) =>{
  const{
    tienda_id,
    tipo
  } = request.body
  if(tipo == 'presencial'){
    pool.query(
      'SELECT DISTINCT t.tienda_id as ID, t.nombre, p.cantidad as cantidad_pasillo, p.fk_producto as producto_id '+
      'FROM "TIENDA" T, "PASILLO" P WHERE t.tienda_id=p.fk_tienda AND t.tienda_id=$1'
      [
        tienda_id
      ],
      (error, results) =>{
          if(error){
              throw error
          }
          response.status(201).json(results.rows)
      }
    )
  }
  else if(tipo == 'en linea'){
    pool.query(
      'SELECT DISTINCT t.tienda_id as ID, t.nombre, a.cantidad as cantidad_almacen, a.fk_producto as producto_id '+
      'FROM "TIENDA" T, "ALMACEN" A WHERE t.tienda_id=a.fk_tienda AND t.tienda_id=$1',
      [
        tienda_id
      ],
      (error, results) =>{
          if(error){
              throw error
          }
          response.status(201).json(results.rows)
      }
    )
  }
}

const inventarioTiendaTabla = async(request, response) =>{
  const{
    tienda_id
  } = request.body
  pool.query(
  'SELECT P.PRODUCTO_ID AS ID, P.NOMBRE, P.CATEGORIA, A.CANTIDAD, P.PRECIO FROM "TIENDA" T, "PRODUCTO" P, "ALMACEN" A '+
  'WHERE T.tienda_id=A.fk_tienda AND A.fk_producto=P.producto_id AND T.tienda_id=$1',
  [
    tienda_id
  ],
  (error, results) =>{
    if(error){
      throw error
    }
    response.status(201).json(results.rows)
  }
  )
}

const reposicionInventarioPasillo = async(request, response) => {
  const{
    tienda_id
  } = request.body
  pool.query(
    'SELECT A.CANTIDAD AS ALMACEN_CANTIDAD, PA.CANTIDAD AS PASILLO_CANTIDAD, P.NOMBRE AS PRODUCTO FROM "TIENDA" T, "PASILLO" PA, "PRODUCTO" P, "ALMACEN" A '+
    'WHERE A.fk_tienda=T.tienda_id AND PA.fk_tienda=T.tienda_id AND PA.cantidad<20 AND PA.fk_producto = P.producto_id AND A.fk_producto = P.producto_id AND T.tienda_id=$1;',
    [
      tienda_id
    ],
    (error, results) =>{
      if(error){
        throw error
      }
      response.status(201).json(results.rows)
    }
  )
}

const ordenesDeReposicionDeInventario = async(request, response) =>{
  const{
    rif
  } = request.body
  pool.query(
    'SELECT * FROM "OPERACION" WHERE fk_tienda=(SELECT fk_tienda from "EMPLEADO" WHERE rif=$1) AND fk_empleado IS NULL AND fk_natural IS NULL and FK_JURIDICO IS NULL',
    [
      rif
    ],
    (error, results) =>{
      if(error){
        throw error
      }
      response.status(201).json(results.rows)
    }
  )
}

const reponerInventarioPasillo = async(request, response) =>{
  const{
    tienda_id,
    inventario
  } = request.body
  let tienda = new Tienda()
  tienda.id = tienda_id
  if(await tienda.buscarTiendaConId()){
    await tienda.reponerInventarioPasillo(inventario)
    response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
  }
  else{
    response.status(201).json([])
  }
}

const reponerInventarioAlmacen = async(request, response) =>{
  const{
    operacion_id
  } = request.body
  let tienda = new Tienda()
  if(await tienda.reponerInventarioAlmacen(operacion_id)){
    response.status(201).json({status:"Funciono", message: "Registro exitoso"})
  }
  else{
    response.status(201).json([])
  }
}

const postpruebaprueba = async(request, response) => {
  const {
    producto,
    tienda_id,
  } = request.body
  let tienda = new Tienda()
  await tienda.reponerInventarioAlmacen()
  

  
  //let contenedor = new Contenedor()
  //let usuarioGenerico = new Usuario()
  //let usuario = await usuarioGenerico.crearUsuario(tipo)
  //if(await contenedor.ordenarProducto(producto) && await validador.existeRif(rif, usuario.tipo_usuario_tabla)){
  //  let operacion = new Operacion('', fecha, monto_total, '')
  //  let estadoPendiente = new Estatus('', 'Pendiente')
  //  await operacion.insertarOperacion(usuario.tipo_usuario, rif)
  //  await estadoPendiente.buscarEstado()
  //  await operacion.insertarOperacionEstatus(estadoPendiente)
  //  await operacion.insertarOrden(contenedor.contenedor)
  //  response.status(201).json({ status: "Funciono", message: "Registro exitoso" })
  //}
  //else{
  //  response.status(201).json([])
  //}

  

}


app
  .route("/reponerinventarioalmacen")
  .post(reponerInventarioAlmacen)

app
  .route("/ordenesreposicioninventario")
  .post(ordenesDeReposicionDeInventario)

app
  .route("/inventariotiendatabla")
  .post(inventarioTiendaTabla)

app
  .route("/reponerInventarioPasillo")
  .post(reponerInventarioPasillo)

app
  .route("/reposicionInventarioPasillo")
  .post(reposicionInventarioPasillo)

app
  .route("/cajero")
  .post(ordenCajeroMasReciente)

app
  .route("/cargo")
  .post(postCargo)
  .put(updateCargo)

app
  .route("/buscarcargo")
  .post(buscarCargo)

app
  .route("/puntosusuario")
  .post(puntosUsuario)

app
  .route("/cambiodivisa")
  .post(cambioDivisa)

app
  .route("/cambiopunto")
  .get(cambioPunto)

app
  .route("/productoparticular")
  .post(productoParticular)

app 
  .route("/todasordenes")
  .post(todosOrdenes)

app
  .route("/orden")
  .post(postOrden)
  .put(ordenPaga)
app 
  .route("/pruebaprueba")
  .post(postpruebaprueba)

app
  .route("/proveedor")
  .post(postProveedor)
  .put(postProveedor)
  .delete(deleteProveedor)

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

app
  .route("/empleado")
  .post(postEmpleado)
  .put(updateEmpleado)
  .delete(deleteEmpleado)

app 
  .route("/carnet")
  .post(imprimirCarnetUsuario)

app 
  .route("/reportehorario")
  .get(reporteHorario)

app 
  .route("/Documento")
  .post(subir)
  .get(horarioEmpleados)

app 
  .route("/inventario")
  .get(getTienda)
  .post(inventarioTienda)

app
  .route("/tienda")
  .post(postTienda)
  .delete(deleteTienda)
  .put(updateTienda)

app
  .route("/producto")
  .get(productosOrdenados)
  .post(postProducto)
  .delete(deleteProducto)
  .put(updateProducto)

app
  .route("/lugarparroquia")
  .post(postLugarParroquia)

app
  .route("/rif")
  .post(postValidarRif)

app
  .route("/validarTienda")
  .post(postValidarTienda)

app
  .route("/correo")
  .post(postValidarCorreo)

app
  .route("/horario")
  .post(postHorario)

app
  .route("/buscarLugar")
  .post(buscarLugar)

app
  .route("/horario")
  .get(getHorario)

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening`);
});