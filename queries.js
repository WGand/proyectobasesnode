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
            'VALUES ($1,$2,$3,$4,$5,$6,$7, (SELECT a.lugar_id FROM "LUGAR" a, "LUGAR" b, "LUGAR" c WHERE a.fk_lugar = b.lugar_id AND b.fk_lugar '+
            '= c.lugar_id AND a.nombre = $8 AND b.nombre = $9 AND c.nombre = $10 ))',
            [
                usuario.rif,
                usuario.correo_electronico,
                usuario.denominacion_comercial,
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
            'UPDATE "JURIDICO" SET correo_electronico=$2, denominacion_comercial=$3, razon_social=$4, pagina_web=$5, capital_disponible=$6, '+
            'contrasena=$7, fk_lugar=(SELECT a.lugar_id FROM "LUGAR" a, "LUGAR" b, "LUGAR" c WHERE a.fk_lugar = b.lugar_id AND b.fk_lugar '+
            '= c.lugar_id AND a.nombre = $8 AND b.nombre = $9 AND c.nombre = $10) WHERE rif=$1',
        [
            usuario.rif,
            usuario.correo_electronico,
            usuario.denominacion_comercial,
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

const insertUsuarioEmpleado = async(usuario) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "EMPLEADO" (rif, correo_electronico, cedula_identidad, primer_nombre, segundo_nombre, primer_apellido,'+
            'segundo_apellido, contrasena, tipo_cedula, fk_lugar) VALUES ($1, $2, $3, $4, $5,'+
            '$6, $7, $8, $9, (SELECT a.lugar_id FROM "LUGAR" a, "LUGAR" b, "LUGAR" c WHERE a.fk_lugar = b.lugar_id AND b.fk_lugar '+
            '= c.lugar_id AND a.nombre = $10 AND b.nombre = $11 AND c.nombre = $12))',
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
            (error, results) =>{
                if (error) {
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const updateUsuarioEmpleado = async(usuario) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "EMPLEADO" SET correo_electronico=$2, primer_nombre=$3, segundo_nombre=$4, primer_apellido=$5,'+
            'segundo_apellido=$6, contrasena=$7, fk_lugar = (SELECT a.lugar_id FROM "LUGAR" a, "LUGAR" b, '+
            '"LUGAR" c WHERE a.fk_lugar = b.lugar_id AND b.fk_lugar = c.lugar_id AND a.nombre = $8 AND b.nombre'+
            ' = $9 AND c.nombre = $10) WHERE rif=$1',
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
            (error, results) =>{
                if (error) {
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const deleteUsuarioEmpleado = async(usuario) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "EMPLEADO" WHERE rif = $1',
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

const insertPersonaContacto = async(usuario, rif_juridico) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "PERSONA_CONTACTO" (nombre, primer_apellido, segundo_apellido, fk_juridico) VALUES ($1, $2, $3, $4)',
            [
                usuario.nombre,
                usuario.primer_apellido,
                usuario.segundo_apellido,
                rif_juridico
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

const updatePersonaContacto = async(usuario, rif_juridico) =>{
    return new Promise((resolve, reject) =>{
        pool.query('UPDATE "PERSONA_CONTACTO" SET nombre=$1, primer_apellido=$2, segundo_apellido=$3 WHERE fk_juridico=$4',
            [
                usuario.nombre,
                usuario.primer_apellido,
                usuario.segundo_apellido,
                rif_juridico
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

const deletePersonaContacto= async(rif_juridico) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "PERSONA_CONTACTO" WHERE fk_juridico= $1',
            [
                rif_juridico
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

const readHorario = async(horario_id) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "HORARIO" where horario_id=$1',
            [
                horario_id
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const readHorarioSinId = async(horario) =>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT horario_id FROM "HORARIO" WHERE hora_inicio=$1 AND hora_fin=$2 AND dia=$3',
            [
                horario.hora_inicio,
                horario.hora_fin,
                horario.dia
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const readEmpleadoHorario = async(rif) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "EMPLEADO_HORARIO" where fk_empleado=$1',
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

const insertEmpleadoHorario = async(rif, horario_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "EMPLEADO_HORARIO" (fk_empleado, fk_horario) VALUES ($1, $2)',
            [
                rif,
                horario_id
            ],
            (error, results) =>{
                if (error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const deleteEmpleadoHorario = async(rif) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "EMPLEADO_HORARIO" WHERE fk_empleado=$1',
            [
                rif
            ],
            (error, results) =>{
                if (error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const readTarjeta = async(rif, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "TARJETA" WHERE fk_'+tipo+'=$1',
            [
                rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const insertTarjeta = async(tarjeta, rif, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "TARJETA" (numero_tarjeta, empresa, fecha, mes_caducidad, anho_caducidad, nombre_tarjeta, fk_'+tipo+') VALUES '+
            '($1, $2, $3, $4, $5, $6, $7)',
            [
                tarjeta.numero_tarjeta,
                tarjeta.empresa,
                tarjeta.fecha,
                tarjeta.mes_caducidad,
                tarjeta.anho_caducidad,
                tarjeta.nombre_tarjeta,
                rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const deleteTarjeta = async(rif, tipo) =>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'DELETE FROM "TARJETA" WHERE fk_'+tipo+'=$1',
            [
                rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const readCheque = async(rif, tipo) =>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT * FROM "CHEQUE" WHERE rif=$1',
            [
                rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const insertCheque = async(cheque, rif, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "CHEQUE" (numero_confirmacion, nombre_banco, fk_'+tipo+') VALUES ($1, $2, $3)',
            [
                cheque.numero_confirmacion,
                cheque.nombre_banco,
                rif
            ],
            (error, results) => {
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const deleteCheque = async(rif, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "CHEQUE" WHERE fk_'+tipo+'=$1',
            [
                rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const readCanje = async(rif, tipo) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "CANJE" WHERE fk_'+tipo+'=$1',
            [
                rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const insertCanje = async(canje, rif, tipo) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "CANJE" (cantidad, cambio, fk_'+tipo+') VALUES ($1, $2, $3)',
            [
                canje.cantidad,
                canje.cambio,
                rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const deleteCanje = async(rif, tipo) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "CANJE" WHERE fk_'+tipo+' =$1',
            [
                rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const readPunto = async(rif, tipo) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "PUNTO" WHERE fk_'+tipo+'=$1',
            [
                rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const insertPunto = async(punto, rif, tipo) =>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'INSERT INTO "PUNTO" (cantidad, fk_'+tipo+') VALUES ($1, $2)',
            [
                punto.cantidad,
                rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const updatePunto = async(punto, rif, tipo) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "PUNTO" SET cantidad=$1 WHERE fk_'+tipo+'=$2',
            [
                punto.cantidad,
                rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const deletePunto = async(rif, tipo) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "PUNTO" WHERE fk_'+tipo+'=$1',
            [
                rif
            ],
            (error, results) => {
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const readHistoricoPunto = async() => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "HISTORICO_PUNTO"',
            (error, results) => {
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const readHistoricoPuntoFecha = async(fecha) => {
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT * FROM "HISTORICO_PUNTO" WHERE fecha=$1',
            [
                fecha
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const insertHistoricoPunto = async(referencia_bolivares) => {
    return new Promise((resolve, reject) => {
        pool.query(
            'INSERT INTO "HISTORICO_PUNTO" (references_bolivares) VALUES ($1)',
            [
                referencia_bolivares
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const deleteHistoricoPunto = async(fecha) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "HISTORICO_PUNTO" WHERE fecha=$1',
            [
                fecha
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const readHistoricoDivisa = async() => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "HISTORICO_DIVISA"',
            (error, results) => {
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const readHistoricoDivisaFecha = async(fecha) => {
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT * FROM "HISTORICO_DIVISA" WHERE fecha=$1',
            [
                fecha
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const readHistoricoDivisaTipo = async(fecha, tipo) => {
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT * FROM "HISTORICO_DIVISA" WHERE fecha=$1 AND tipo=$2',
            [
                fecha,
                tipo
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const insertHistoricoDivisa = async(valor, tipo) => {
    return new Promise((resolve, reject) => {
        pool.query(
            'INSERT INTO "HISTORICO_DIVISA" (valor, tipo) VALUES ($1, $2)',
            [
                valor,
                tipo
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const deleteHistoricoDivisa = async(fecha) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "HISTORICO_DIVISA" WHERE fecha=$1',
            [
                fecha
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const insertProveedor = async(proveedor) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "JURIDICO" SET rubro=$1 WHERE rif=$2',
            [
                proveedor.rubro,
                proveedor.rif
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const deleteProveedor = async(proveedor) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "JURIDICO" SET rubro=NULL WHERE rif=$1',
            [
                proveedor.rif
            ],
            (error, results)=>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const readProductoId = async(producto) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "PRODUCTO" where producto_id=$1',
            [
                producto.id
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const readProductoSinId = async(producto) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT producto_id FROM "PRODUCTO" where imagen=$1 AND nombre=$2 AND precio=$3 AND ucabmart=$4 AND categoria=$5',
            [
                producto.imagen,
                producto.nombre,
                producto.precio,
                producto.ucabmart,
                producto.categoria
            ],
            (error, results)=>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const insertProducto = async(producto) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "PRODUCTO" (imagen, nombre, precio, ucabmart, categoria) VALUES ($1, $2, $3, $4, $5)',
            [
                producto.imagen,
                producto.nombre,
                producto.precio,
                producto.ucabmart,
                producto.categoria
            ],
            (error, results)=>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
            }
        )
    })
}

const updateProducto = async(producto) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "PRODUCTO" SET imagen=$1, nombre=$2, precio=$3, ucabmart=$4, categoria=$5 WHERE producto_id=$5',
            [
                producto.imagen,
                producto.nombre,
                producto.precio,
                producto.ucabmart,
                producto.categoria,
                producto.id
            ],
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rowCount)
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
    insertUsuarioJuridico: insertUsuarioJuridico,
    updateUsuarioJuridico: updateUsuarioJuridico,
    deleteUsuarioJuridico: deleteUsuarioJuridico,
    insertUsuarioEmpleado: insertUsuarioEmpleado,
    updateUsuarioEmpleado: updateUsuarioEmpleado,
    deleteUsuarioEmpleado: deleteUsuarioEmpleado,
    //telefono
    insertTelefono: insertTelefono,
    updateTelefono: updateTelefono,
    readCelular: readCelular,
    readTelefono: readTelefono,
    deleteTelefono: deleteTelefono,
    //Lugar
    readLugar: readLugar,
    //empleadoHorario
    readEmpleadoHorario: readEmpleadoHorario,
    deleteEmpleadoHorario: deleteEmpleadoHorario,
    insertEmpleadoHorario: insertEmpleadoHorario,
    //horario
    readHorario: readHorario,
    readHorarioSinId: readHorarioSinId,
    //tarjeta
    readTarjeta: readTarjeta,
    insertTarjeta: insertTarjeta,
    deleteTarjeta: deleteTarjeta,
    //proveedor
    insertProveedor: insertProveedor,
    deleteProveedor: deleteProveedor
}
