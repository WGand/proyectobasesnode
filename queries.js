const { response } = require("express");
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

const updateUsuarioEmpleadoTienda = async(tienda_id, rif) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "EMPLEADO" SET fk_tienda=$1 WHERE rif=$2',
            [
                tienda_id,
                rif
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
            'INSERT INTO "TARJETA" (numero_tarjeta, empresa, mes_caducidad, anho_caducidad, nombre_tarjeta, fk_'+tipo+', tipo) VALUES '+
            '($1, $2, $3, $4, $5, $6, $7)',
            [
                tarjeta.numero_tarjeta,
                tarjeta.empresa,
                tarjeta.mes_caducidad,
                tarjeta.anho_caducidad,
                tarjeta.nombre_tarjeta,
                rif,
                tarjeta.tipo
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

const updatePunto = async(cantidad, rif, tipo) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "PUNTO" SET cantidad=$1 WHERE fk_'+tipo+'=$2',
            [
                cantidad,
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
            'SELECT * FROM "HISTORICO_PUNTO" WHERE fecha = (SELECT MAX(fecha) FROM "HISTORICO_PUNTO")',
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

const readHistoricoDivisa = async(tipo) => {
    return new Promise((resolve, reject) =>{
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

const readProductos = async() => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "PRODUCTO"',
            (error, results)=>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const readProductoId = async(producto) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "PRODUCTO" WHERE producto_id=$1',
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
            'UPDATE "PRODUCTO" SET imagen=$1, nombre=$2, precio=$3, ucabmart=$4, categoria=$5 WHERE producto_id=$6',
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

const deleteProducto = async(producto) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "PRODUCTO" WHERE producto_id=$1',
            [
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

const readJuridicoProductoPID = async(producto_id)=>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "JURIDICO_PRODUCTO" WHERE fk_producto=$1',
            [
                producto_id
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

const readJuridicoProductoRIF = async(rif) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "JURIDICO_PRODUCTO" WHERE fk_juridico=$1',
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

const insertJuridicoProducto = async(rif, producto_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "JURIDICO_PRODUCTO" (fk_juridico, fk_producto) VALUES ($1, $2)',
            [
                rif,
                producto_id
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

const deleteJuridicoProductoPID = async(producto_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "JURIDICO_PRODUCTO" WHERE fk_producto=$1',
            [
                producto_id
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

const deleteJuridicoProductoRIF = async(rif) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "JURIDICO_PRODUCTO" WHERE fk_juridico=$1',
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

const readOperaciones = async(tipo, rif) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "OPERACION" WHERE fk_'+tipo+'=$1',
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

const readOperacionId = async(operacion_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "OPERACION" WHERE operacion_id=$1',
            [
                operacion_id
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

const readOperacion = async(rif, tipo, fecha) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "OPERACION" WHERE fk_'+tipo+'=$1 AND fecha_orden=$2',
            [
                rif,
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

const insertOperacion = async(operacion, tipo, rif) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "OPERACION" (condiciones, fecha_orden, monto_total, fk_'+tipo+') VALUES ($1, $2, $3, $4)',
            [
                operacion.condiciones,
                operacion.fecha_orden,
                operacion.monto_total,
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

const updateOperacion = async(operacion) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "OPERACION" SET monto_total='+
            '(SELECT SUM(LP.CANTIDAD * P.PRECIO), fecha_entrega=$2 FROM "LISTA_PRODUCTO" LP, "PRODUCTO" P WHERE LP.fk_operacion=$1 AND lp.fk_producto = P.producto_id)'+
            'WHERE operacion_id=$1',
            [
                operacion.id,
                operacion.fecha_entrega
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

const updateOperacionFE = async(operacion) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "OPERACION" SET condiciones =$1, fecha_orden=$2, monto_total=$3 WHERE operacion_id = $4',
            [
                operacion.condiciones,
                operacion.fecha_orden,
                operacion.monto_total,
                operacion.id
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

const deleteOperacion = async(operacion) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "OPERACION" WHERE operacion_id=$1',
            [
                operacion.id
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

const readEstatus = async(estado) =>{
    return new Promise((resolve, reject)=>{
        pool.query(
            'SELECT * FROM "ESTATUS" WHERE tipo=$1',
            [
                estado
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

const readOperacionEstatusOPID = async(operacion_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "OPERACION_ESTATUS" WHERE fk_operacion=$1',
            [
                operacion_id
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

const readOperacionEstatusEID = async(estatus_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "OPERACION_ESTATUS" WHERE fk_estatus=$1',
            [
                estatus_id
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

const insertOperacionEstatus = async(operacion_id, estatus_id, fecha) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "OPERACION_ESTATUS" (fk_operacion, fk_estatus, fecha) VALUES ($1, $2, $3)',
            [
                operacion_id,
                estatus_id,
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

const updateOperacionEstatus = async(operacion_id, estatus_id, fecha) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "OPERACION_ESTATUS" SET fecha=$1, fk_estatus=$3 WHERE fk_operacion=$2',
            [
                fecha,
                operacion_id,
                estatus_id
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

const deleteProductoEnListaProducto = async(producto_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "LISTA_PRODUCTO" WHERE fk_producto=$1 AND fk_operacion IN (SELECT O.operacion_id FROM "OPERACION" O,'+
            ' "OPERACION_ESTATUS" OE, "ESTATUS" E WHERE O.operacion_id=OE.fk_operacion AND E.tipo=Pendiente)'
        ),
        [
            producto_id
        ],
        (error, results) =>{
            if(error){
                reject(error)
            }
            resolve(results.rowCount)
        }
    })
}

const deleteOperacionEstatus = async(operacion_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "OPERACION_ESTATUS" WHERE fk_operacion=$1',
            [
                operacion_id
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

const readListaProducto = async(id, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "LISTA_PRODUCTO" WHERE fk_'+tipo+'=$1',
            [
                id
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

const insertListaProducto = async(id, cantidad, tipo, producto_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "LISTA_PRODUCTO" (cantidad, fk_'+tipo+', fk_producto) VALUES ($1, $2, $3)',
            [
                cantidad,
                id,
                producto_id
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

const updateListaProductoCantidad = async(id, cantidad, tipo, producto_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "LISTA_PRODUCTO" SET cantidad=$1 WHERE fk_'+tipo+'=$2 AND fk_producto=$3',
            [
                cantidad,
                id,
                producto_id
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

const deleteListaProducto = async(id, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "LISTA_PRODUCTO" WHERE fk_'+tipo+'=$1',
            [
                id
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

const readMoneda = async(id, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "MONEDA" WHERE fk_'+tipo+'=$1 AND fecha=(SELECT MAX(FECHA) FROM "MONEDA" WHERE fk_'+tipo+'=$1)',
            [
                id
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

const insertMoneda = async(id, tipo, moneda) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "MONEDA" (tipo, cambio, fk_'+tipo+') VALUES ($1, $2, $3)',
            [
                moneda.tipo,
                moneda.cambio,
                id
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

const deleteMoneda = async(id, tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "MONEDA" WHERE fk_'+tipo+'=$1',
            [
                id
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

const readMonedaHistorico = async(moneda_id, historico_divisa) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "MONEDA_HISTORICO" WHERE fk_moneda=$1 AND fk_historico_divisa=$2',
            [
                moneda_id,
                historico_divisa
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

const insertMonedaHistorico = async(moneda_id, historico_divisa) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "MONEDA_HISTORICO" (fk_moneda_id, fk_historico_divisa) VALUES ($1, $2)',
            [
                moneda_id,
                historico_divisa
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

const insertPuntoHistorico = async(punto_id, historico_punto) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "PUNTO_HISTORICO" (fk_punto_id, fk_historico_punto) VALUES ($1, $2)',
            [
                punto_id,
                historico_punto
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

const readPuntoHistorico = async(punto_id, historico_punto) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "PUNTO_HISTORICO" WHERE fk_punto_id=$1 AND fk_historico_punto=$2',
            [
                punto_id,
                historico_punto
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

const readEmpleadoCargo = async(rif) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT fk_cargo as cargo_id FROM "EMPLEADO_CARGO" WHERE fk_empleado=$1',
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

const updateEmpleadoCargo = async(rif, cargo_id, fecha) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "EMPLEADO_CARGO" SET fecha_fin=$3 WHERE fk_empleado=$1 AND fk_cargo=$2',
            [
                rif,
                cargo_id,
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

const insertEmpleadoCargo = async(rif, cargo_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "EMPLEADO_CARGO" (fk_empleado, fk_cargo) VALUES ($1, $2)',
            [
                rif,
                cargo_id
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

const deleteEmpleadoCargo = async(rif) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "EMPLEADO_CARGO" WHERE fk_empleado=$1',
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

const insertTienda = async(nombre, parroquia, municipio, estado) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "TIENDA" (nombre, fk_lugar) VALUES ($1, (SELECT a.lugar_id FROM "LUGAR" a, "LUGAR" b, "LUGAR" c WHERE '+
            'a.fk_lugar = b.lugar_id AND b.fk_lugar = c.lugar_id AND a.nombre = $2 AND b.nombre = $3 AND c.nombre = $4 ))',
        [
            nombre,
            parroquia,
            municipio,
            estado
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

const readTiendaTodas = async() =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM TIENDA',
            (error, results) =>{
                if(error){
                    reject(error)
                }
                resolve(results.rows)
            }
        )
    })
}

const readTiendaId = async(tienda_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "TIENDA" WHERE tienda_id=$1',
            [
                tienda_id
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

const readTienda = async(nombre) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "TIENDA" WHERE nombre=$1',
            [
                nombre
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

const readAlmacenInventario = async(tienda_id, producto_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT cantidad FROM "ALMACEN" where fk_tienda=$1 AND fk_producto=$2',
            [
                tienda_id,
                producto_id
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

const readPasilloInventario = async(tienda_id, producto_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT cantidad FROM "PASILLO" where fk_tienda=$1 AND fk_producto=$2',
            [
                tienda_id,
                producto_id
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

const updateTienda = async(nombre, tienda_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "TIENDA" SET nombre=$1 WHERE tienda_id=$2',
            [
                nombre,
                tienda_id
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

const deleteTienda = async(tienda_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "TIENDA" WHERE tienda_id=$1',
            [
                tienda_id
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

const readAlmacen = async(tienda_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT almacen_id FROM "ALMACEN" WHERE fk_tienda=$1',
            [
                tienda_id
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

const insertAlmacen = async(cantidad, tienda_id, producto_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "ALMACEN" (cantidad, fk_tienda, fk_producto) VALUES ($1, $2, $3) RETURNING ALMACEN_ID',
            [
                cantidad,
                tienda_id,
                producto_id
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

const updateAlmacenCantidad = async(cantidad, fk_tienda, fk_producto) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "ALMACEN" SET cantidad=cantidad- $1 WHERE fk_tienda=$2 AND fk_producto=$3 RETURNING *',
            [
                cantidad,
                fk_tienda,
                fk_producto
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

const deleteAlmacenProducto = async(producto_id) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "ALMACEN" WHERE fk_producto=$1',
            [
                producto_id
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

const deleteAlmacen = async(tienda_id) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "ALMACEN" WHERE fk_tienda=$1',
            [
                tienda_id
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

const readZona = async(tipo) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT zona_id FROM "ZONA" WHERE tipo=$1',
            [
                tipo
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

const insertPasillo = async(cantidad, tienda_id, producto_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "PASILLO" (cantidad, fk_tienda, fk_producto) VALUES ($1, $2, $3) RETURNING pasillo_id',
            [
                cantidad,
                tienda_id,
                producto_id
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

const readPasillo = async(tienda_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT pasillo_id FROM "PASILLO" WHERE fk_tienda=$1',
            [
                tienda_id
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

const updatePasilloInventario = async(producto_id, tienda_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "PASILLO" SET cantidad=50 WHERE fk_producto=$1 AND fk_tienda=$2',
            [
                producto_id,
                tienda_id
            ]
        )
    })
}

const updatePasilloCantidad = async(cantidad, producto_id, tienda_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'UPDATE "PASILLO" SET cantidad=cantidad-$1 WHERE fk_producto=$2 AND fk_tienda=$3 RETURNING *',
            [
                cantidad,
                producto_id,
                tienda_id
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

const deletePasillo = async(tienda_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "PASILLO" WHERE fk_tienda=$1',
            [
                tienda_id
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

const insertZonaPasillo = async(tienda_id, zona_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "ZONA_PASILLO" (fk_pasillo, fk_zona) VALUES ($1, $2)',
            [
                tienda_id,
                zona_id
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

const deleteZonaPasillo = async(pasillo_id) => {
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "ZONA_PASILLO" WHERE fk_pasillo=$1',
            [
                pasillo_id
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

const insertAlmacenZona = async(almacen_id, zona_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'INSERT INTO "ALMACEN_ZONA" (fk_zona, fk_almacen) VALUES ($1, $2)',
            [
                zona_id,
                almacen_id
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

const readAlmacenZona = async(almacen_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'SELECT * FROM "ALMACEN_ZONA" WHERE fk_almacen=$1',
            [
                almacen_id
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

const deleteAlmacenZona = async(almacen_id) =>{
    return new Promise((resolve, reject) =>{
        pool.query(
            'DELETE FROM "ALMACEN_ZONA" WHERE fk_almacen=$1',
            [
                almacen_id
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
    updateUsuarioEmpleadoTienda: updateUsuarioEmpleadoTienda,
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
    deleteProveedor: deleteProveedor,
    //producto
    readProductoId: readProductoId,
    readProductoSinId: readProductoSinId,
    readProductos: readProductos,
    insertProducto: insertProducto,
    updateProducto: updateProducto,
    deleteProducto: deleteProducto,
    //JuridicoProducto
    readJuridicoProductoPID: readJuridicoProductoPID,
    readJuridicoProductoRIF: readJuridicoProductoRIF,
    insertJuridicoProducto: insertJuridicoProducto,
    deleteJuridicoProductoPID: deleteJuridicoProductoPID,
    deleteJuridicoProductoRIF: deleteJuridicoProductoRIF,
    //Operacion
    readOperacion: readOperacion,
    readOperacionId: readOperacionId,
    insertOperacion: insertOperacion,
    updateOperacion: updateOperacion,
    updateOperacionFE: updateOperacionFE,
    deleteOperacion: deleteOperacion,
    //estatus
    readEstatus: readEstatus,
    //OperacionEstatus
    readOperaciones: readOperaciones,
    readOperacionEstatusEID: readOperacionEstatusEID,
    readOperacionEstatusOPID: readOperacionEstatusOPID,
    insertOperacionEstatus: insertOperacionEstatus,
    deleteOperacionEstatus: deleteOperacionEstatus,
    updateOperacionEstatus: updateOperacionEstatus,
    //ListaProducto
    readListaProducto: readListaProducto,
    insertListaProducto: insertListaProducto,
    updateListaProductoCantidad: updateListaProductoCantidad,
    deleteListaProducto: deleteListaProducto,
    //Cheque
    readCheque: readCheque,
    insertCheque: insertCheque,
    deleteCheque: deleteCheque,
    //Canje
    readCanje: readCanje,
    insertCanje: insertCanje,
    deleteCanje: deleteCanje,
    //Punto
    readPunto: readPunto,
    updatePunto: updatePunto,
    insertPunto: insertPunto,
    deletePunto: deletePunto,
    //Moneda
    readMoneda: readMoneda,
    insertMoneda: insertMoneda,
    deleteMoneda: deleteMoneda,
    //HistoricoPunto
    readHistoricoPunto: readHistoricoPunto,
    insertHistoricoPunto: insertHistoricoPunto,
    deleteHistoricoPunto: deleteHistoricoPunto,
    //HistoricoDivisa
    readHistoricoDivisa: readHistoricoDivisa,
    readHistoricoDivisaFecha: readHistoricoDivisaFecha,
    readHistoricoDivisaTipo: readHistoricoDivisaTipo,
    insertHistoricoDivisa: insertHistoricoDivisa,
    deleteHistoricoDivisa: deleteHistoricoDivisa,
    //MonedaHistorico
    readMonedaHistorico: readMonedaHistorico,
    insertMonedaHistorico: insertMonedaHistorico,
    //PuntoHistorico
    readPuntoHistorico: readPuntoHistorico,
    insertPuntoHistorico: insertPuntoHistorico,
    //deleteProductoEnListaProducto
    deleteProductoEnListaProducto: deleteProductoEnListaProducto,
    //EmpleadoCargo
    readEmpleadoCargo: readEmpleadoCargo,
    insertEmpleadoCargo: insertEmpleadoCargo,
    deleteEmpleadoCargo: deleteEmpleadoCargo,
    updateEmpleadoCargo: updateEmpleadoCargo,
    //Tienda
    readTiendaId: readTiendaId,
    readTienda: readTienda,
    readTiendaTodas: readTiendaTodas,
    updateTienda: updateTienda,
    insertTienda: insertTienda,
    deleteTienda: deleteTienda,
    //Almacen
    readAlmacenInventario:readAlmacenInventario,
    readAlmacen: readAlmacen,
    insertAlmacen: insertAlmacen,
    updateAlmacenCantidad: updateAlmacenCantidad,
    deleteAlmacen: deleteAlmacen,
    deleteAlmacenProducto: deleteAlmacenProducto,
    //Pasillo
    readPasilloInventario: readPasilloInventario,
    readPasillo: readPasillo,
    insertPasillo: insertPasillo,
    updatePasilloInventario: updatePasilloInventario,
    updatePasilloCantidad: updatePasilloCantidad,
    deletePasillo: deletePasillo,
    //ZonaPasillo
    deleteZonaPasillo: deleteZonaPasillo,
    insertZonaPasillo: insertZonaPasillo,
    //AlmacenZona
    insertAlmacenZona: insertAlmacenZona,
    deleteAlmacenZona: deleteAlmacenZona,
    readAlmacenZona: readAlmacenZona,
    //Zona
    readZona: readZona
}