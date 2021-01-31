const { pool } = require("./config");

const readLugar = async(lugar) =>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT a.nombre AS parroquia, b.nombre AS municipio, c.nombre AS estado FROM "LUGAR" a, "LUGAR" b, "LUGAR" c WHERE a.fk_lugar = b.lugar_id '+
            'AND b.fk_lugar = c.lugar_id AND a.lugar_id  = $1;',
            [lugar],
            (error, results)=> {
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const readUsuarioLogin = async(login) =>{
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM '+login.tipo+' WHERE correo_electronico = $1 AND contrasena = $2',
            [login.correo, login.contrasena],
            (error, results) => {
                if (error) {
                reject(error)
                }
            resolve(results.rows)
            }
        )
    })
}

const readUsuario = async(rif, tipo) =>{
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM '+tipo+' WHERE rif = $1',
            [rif],
            (error, results) => {
                if (error) {
                reject(error)
                }
            resolve(results.rows)
            }
        )
    })
}

const insertUsuarioNatural = async(usuario) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "NATURAL" (rif, correo_electronico, cedula_identidad, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, '+
            'contrasena, tipo_cedula, fk_lugar) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9, (SELECT a.lugar_id FROM "LUGAR" a, "LUGAR" b, "LUGAR" c WHERE '+
            'a.fk_lugar = b.lugar_id AND b.fk_lugar = c.lugar_id AND a.nombre = $10 AND b.nombre = $11 AND c.nombre = $12 ))',
            [
              usuario.rif,
              usuario.correo_electronico,
              usuario.cedula,
              usuario.primer_nombre,
              usuario.segundo_nombre,
              usuario.primer_apellido,
              usuario.segundo_apellido,
              usuario.contrasena,
              usuario.tipo_cedula,
              usuario.lugar.parroquia,
              usuario.lugar.municipio,
              usuario.lugar.estado
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rowCount)
            }
        )
    })
}

const updateUsuarioNatural = async(usuario) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "NATURAL" SET correo_electronico=$2, primer_nombre=$3, segundo_nombre =$4, primer_apellido=$5, segundo_apellido=$6, '+
            'contrasena=$7, fk_lugar=(SELECT a.lugar_id FROM "LUGAR" a, "LUGAR" b, "LUGAR" c WHERE a.fk_lugar = b.lugar_id AND b.fk_lugar '+
            '= c.lugar_id AND a.nombre = $8 AND b.nombre = $9 AND c.nombre = $10 ) WHERE rif=$1',
            [
                usuario.rif,
                usuario.correo_electronico,
                usuario.primer_nombre,
                usuario.segundo_nombre,
                usuario.primer_apellido,
                usuario.segundo_apellido,
                usuario.contrasena,
                usuario.lugar.parroquia,
                usuario.lugar.municipio,
                usuario.lugar.estado
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rowCount)
            }
        )
    })
}

const deleteUsuarioNatural = async(usuario) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "NATURAL" WHERE rif = $1',
            [
                usuario.rif
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rowCount)
            }
        )
    })
}

const insertUsuarioJuridico = async(usuario) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "JURIDICO" (rif, correo_electronico, denominacion_comercial, razon_social, pagina_web, capital_disponible, contrasena, fk_lugar)'+ 
            'VALUES ($1,$2,$3,$4,$5,$6,$7,$8, (SELECT a.lugar_id FROM "LUGAR" a, "LUGAR" b, "LUGAR" c WHERE a.fk_lugar = b.lugar_id AND b.fk_lugar '+
            '= c.lugar_id AND a.nombre = $10 AND b.nombre = $11 AND c.nombre = $12 ))',
            [
                usuario.rif,
                usuario.correo_electronico,
                usuario.denominacion_social,
                usuario.razon_social,
                usuario.pagina_web,
                usuario.capital_disponible,
                usuario.contrasena,
                usuario.lugar.parroquia,
                usuario.lugar.municipio,
                usuario.lugar.estado
            ],
            (error, results) => {
                if (error) {
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const updateUsuarioJuridico = async(usuario) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "JURIDICO" SET correo_electronico=$2, correo_electronico=$3, denominacion_social=$4, pagina_web=$5, capital_disponible=$6, '+
            'contrasena=$7, fk_lugar=(SELECT a.lugar_id FROM "LUGAR" a, "LUGAR" b, "LUGAR" c WHERE a.fk_lugar = b.lugar_id AND b.fk_lugar '+
            '= c.lugar_id AND a.nombre = $8 AND b.nombre = $9 AND c.nombre = $10 ) WHERE rif=$1',
        [
            usuario.rif,
            usuario.correo_electronico,
            usuario.denominacion_social,
            usuario.razon_social,
            usuario.pagina_web,
            usuario.capital_disponible,
            usuario.contrasena,
            usuario.lugar.parroquia,
            usuario.lugar.municipio,
            usuario.lugar.estado
        ],
        (error, results) =>{
            if(error){
                reject(error)
            }
            resolve(results.rowCount)
        })
    })
}

const deleteUsuarioJuridico = async(usuario) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "JURIDICO" WHERE rif = $1',
            [
                usuario.rif
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rowCount)
            }
        )
    })
}

const readTelefono = async(usuarioID, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "TELEFONO" WHERE fk_'+tipo+'=$1 AND prefijo=$2',
            [
                usuarioID,
                '0212'
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rows)
            }
        )
    })
}

const readPersonaContacto = async(rif) =>{
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT * FROM "PERSONA_CONTACTO" WHERE fk_juridico=$1',
            [
                rif
            ],
            (error, results) =>{
                if (error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const insertPersonaContacto = async(usuario) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "PERSONA_CONTACTO" (nombre, primer_apellido, segundo_apellido, fk_juridico) VALUES ($1, $2, $3, $4)',
            [
                usuario.nombre,
                usuario.primer_apellido,
                usuario.segundo_apellido,
                usuario.rif_juridico
            ],
            (error, results) => {
                if (error) {
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const updatePersonaContacto = async(usuario) =>{
    return new Promise((resolve, reject) =>{
        pool.query('UPDATE "PERSONA_CONTACTO" SET nombre=$1, primer_apellido=$2, segundo_apellido=$3',
            [
                usuario.nombre,
                usuario.primer_apellido,
                usuario.segundo_apellido
            ],
            (error, results) => {
                if (error) {
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const deletePersonaContacto= async(usuario) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "PERSONA_CONTACTO" WHERE fk_juridico= $1',
            [
                usuario.rif_juridico
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rowCount)
            }
        )
    })
}

const readCelular = async(usuarioID, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "TELEFONO" WHERE fk_'+tipo+'=$1 AND prefijo=$2',
            [
                usuarioID,
                '0414'
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rows)
            }
        )
    })
}

const insertTelefono = async(telefono, prefijo_telefono, usuarioID, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "TELEFONO" (numero_telefonico, prefijo, fk_'+tipo+') VALUES ($1, $2, $3)',
            [
                telefono,
                prefijo_telefono,
                usuarioID
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rowCount)
            }
        )
    })
}

const updateTelefono = async(telefono, prefijo_telefono, usuarioID, tipo, prefijo_telefono_antiguo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "TELEFONO" SET numero_telefonico=$1, prefijo=$2 WHERE fk_'+tipo+'=$3 AND prefijo=$4',
            [
                telefono,
                prefijo_telefono,
                usuarioID,
                prefijo_telefono_antiguo
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rowCount)
            }
        )
    })
}

const deleteTelefono = async(usuarioID, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "TELEFONO" WHERE fk_'+tipo+'=$1',
            [
                usuarioID
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rowCount)
            }
        )
    })
}

const readTelefonoPersonaContacto = async(usuarioID) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * "TELEFONO" fk_persona_contacto=$1',
            [
                usuarioID
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rowCount)
            }
        )
    })
}

const insertTelefonoPersonaContacto = async(telefono, prefijo_telefono, usuarioID) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "TELEFONO" (numero_telefonico, prefijo, fk_persona_contacto) VALUES ($1, $2, $3)',
            [
                telefono,
                prefijo_telefono,
                usuarioID
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results.rowCount)
            }
        )
    })
}

const updateTelefonoPersonaContacto = async(telefono, prefijo_telefono, usuarioID) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "TELEFONO" SET numero_telefono=$1, prefijo=$2 WHERE fk_persona_contacto=$3',
            [
                telefono,
                prefijo_telefono,
                usuarioID
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results)
            }
        )
    })
}

const deleteTelefonoPersonaContacto = async(usuarioID) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "TELEFONO" WHERE fk_persona_contacto=$3',
            [
                usuarioID
            ],
            (error, results) => {
              if (error) {
                reject(error)
              }
              resolve(results)
            }
        )
    })
}

module.exports = {
    //CRUD
    //Usuarios, natural, juridico, empleado, persona contacto
    readUsuario: readUsuario,
    readUsuarioLogin: readUsuarioLogin,
    updateUsuarioNatural: updateUsuarioNatural,
    deleteUsuarioNatural: deleteUsuarioNatural,
    insertUsuarioNatural: insertUsuarioNatural,
    insertPersonaContacto: insertPersonaContacto,
    readPersonaContacto: readPersonaContacto,
    deletePersonaContacto: deletePersonaContacto,
    updatePersonaContacto: updatePersonaContacto,
    //telefono
    insertTelefono: insertTelefono,
    updateTelefono: updateTelefono,
    readCelular: readCelular,
    readTelefono: readTelefono,
    deleteTelefono: deleteTelefono,
    insertTelefonoPersonaContacto: insertTelefonoPersonaContacto,
    readTelefonoPersonaContacto: readTelefonoPersonaContacto,
    deleteTelefonoPersonaContacto: deleteTelefonoPersonaContacto,
    updateTelefonoPersonaContacto: updateTelefonoPersonaContacto,
    //Lugar
    readLugar: readLugar
}
