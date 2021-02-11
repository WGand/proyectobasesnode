const { json } = require("express");
const { pool } = require("./config");
const {
    insertUsuarioNatural, updateUsuarioNatural, deleteUsuarioNatural, readUsuario, readUsuarioLogin,
    insertPersonaContacto, updatePersonaContacto, deletePersonaContacto, readPersonaContacto,
    insertUsuarioJuridico, updateUsuarioJuridico, deleteUsuarioJuridico,
    insertUsuarioEmpleado, updateUsuarioEmpleado, deleteUsuarioEmpleado, updateUsuarioEmpleadoTienda,
    insertTelefono, readTelefono, updateTelefono, deleteTelefono, readCelular,
    insertEmpleadoHorario, deleteEmpleadoHorario, readEmpleadoHorario,
    insertProducto, readProductoId, readProductoSinId, updateProducto, deleteProducto,
    readJuridicoProductoPID, readJuridicoProductoRIF, insertJuridicoProducto, deleteJuridicoProductoPID, deleteJuridicoProductoRIF,
    readOperacionEstatusEID, readOperacionEstatusOPID, insertOperacionEstatus, updateOperacionEstatus, deleteOperacionEstatus, readOperaciones,
    readListaProducto, insertListaProducto, updateListaProductoCantidad, deleteListaProducto,
    readHorario, readHorarioSinId,
    readTarjeta, insertTarjeta, deleteTarjeta,
    readCheque, insertCheque, deleteCheque,
    readCanje, insertCanje, deleteCanje,
    readMoneda, insertMoneda, deleteMoneda,
    insertPunto, updatePunto, deletePunto, readPunto,
    readPuntoHistorico, insertPuntoHistorico, readMonedaHistorico, insertMonedaHistorico,
    readEmpleadoCargo, insertEmpleadoCargo, deleteEmpleadoCargo, updateEmpleadoCargo,
    insertProveedor, deleteProveedor,
    readLugar, readEstatus, insertOperacion, readOperacion, deleteOperacion, updateOperacion, 
    readHistoricoDivisa, readHistoricoPunto, readOperacionId, insertHistoricoDivisa, insertOperacionInventario,
    deleteProductoEnListaProducto, updateOperacionTienda,
    readTienda, updateTienda, insertTienda, deleteTienda, readTiendaTodas, readTiendaId,
    readAlmacen, insertAlmacen, updateAlmacenCantidad, deleteAlmacen, deleteAlmacenProducto, readAlmacenInventario, updateAlmacenInventario,
    readPasillo, insertPasillo, updatePasilloCantidad, deletePasillo, readPasilloInventario,
    deleteZonaPasillo, insertAlmacenZona, deleteAlmacenZona, readAlmacenZona, readAlmacenReponer,
    readZona, readProductos, insertZonaPasillo, updatePasilloInventario, updateOperacionSinFecha
    } = require('./queries')

class Validador{
    obtenerHoraEntrega(){
        let today = new Date();
        let dd = today.getDate() + 5;
        let mm = today.getMonth()+1; 
        const yyyy = today.getFullYear();
        if(dd<10) 
        {
            dd=`0${dd}`;
        } 
    
        if(mm<10) 
        {
            mm=`0${mm}`;
        } 
        today = `${yyyy}-${mm}-${dd}`
        return today
    }
    obtenerHora(){
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth()+1; 
        const yyyy = today.getFullYear();
        if(dd<10) 
        {
            dd=`0${dd}`;
        } 
    
        if(mm<10) 
        {
            mm=`0${mm}`;
        } 
        today = `${yyyy}-${mm}-${dd}`
        return today
    }

    hora(horario){
        const rangoHora = /^([1][0-9]|[0][9]|2[0-1]):(00)$/
        if(horario.match(rangoHora) != undefined){
            return true
        }
        else{
            return false
        }
       }
    telefono(telefono){
        if(telefono.length == 7){
            return true
        }
        else{
            return false
        }
    }
    prefijo(prefijo){
        if(prefijo.length == 4){
            return true
        }
        else{
            return false
        }
    }
    campoVacio(cadena){
        if(cadena.length > 0){
            return true
        }
        else{
            return false
        }
    }
    async existeRif(rif, tipo){
        let respuesta = new Promise((resolve, reject)=> {
            pool.query(
                'SELECT * FROM '+tipo+' WHERE rif = $1',
                [rif],
                (error, results) => {
                    if (error) {
                    reject(error)
                    }
                resolve(results.rowCount)
                }
            )
        })
        if(await respuesta == 1){
            return true
        }
        else if(await respuesta == 0){
            return false
        }
      }
    rif(rif){
        if(rif.length == 9){
            return true
        }
        else{
            return false
        }
    }
    async existeCorreo(correo, tipo){
        let respuesta = new Promise((resolve, reject)=> {
            pool.query(
                'SELECT * FROM '+tipo+' WHERE correo_electronico = $1',
                [correo],
                (error, results) => {
                  if (error) {
                    reject(error)
                    }
                resolve(results.rowCount)
                }
            )
        })
        if(await respuesta == 1){
            return true
        }
        else if(await respuesta == 0){
            return false
        }
    }
    correo(correo){
        if(correo.includes('@')){
            return true
        }
        else{
            return false
        }
    }
    tipo_cedula(tipo_cedula){
        if(tipo_cedula == 'V' || tipo_cedula == 'v' || tipo_cedula == 'E' || tipo_cedula == 'e'){
            return true
        }
        else{
            return false
        }
    }
    contrasena(contrasena){
        if(contrasena.length > 7 && contrasena.length < 10){
            return true
        }
        else{
            return false
        }
    }
    pagina_web(pagina_web){
        if(pagina_web.includes('.com')){
            return true
        }
        else{
            return false
        }
    }
    lugar(parroquia, municipio, estado){
        if(parroquia.length > 0 && municipio.length > 0 && estado.length > 0){
            return true
        }
        else{
            return false
        }
    }
    async existeLugar(lugar){
        return new Promise((resolve, reject)=> {
            pool.query('SELECT a.lugar_id FROM "LUGAR" a, "LUGAR" b, "LUGAR" c WHERE a.fk_lugar = b.lugar_id AND b.fk_lugar = c.lugar_id AND a.nombre = $1'+
                'AND b.nombre = $2 AND c.nombre = $3',
                [
                    lugar.parroquia,
                    lugar.municipio,
                    lugar.estado
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
    async existeTelefono(telefono, prefijo, usuarioID, tipo){
        let respuesta = new Promise((resolve, reject)=>{
            pool.query('SELECT * FROM "TELEFONO" WHERE fk_'+tipo+'=$1 AND numero_telefonico=$2 AND prefijo=$3',
                [
                    usuarioID,
                    telefono,
                    prefijo
                ],
                (error, results) => {
                    if (error){
                        reject(error)
                    }
                resolve(results.rowCount)
                }
            )
        })
        if(await respuesta > 0){
            return true
        }
        else{
            return false
        }
    }
}

class ValidadorUsuario extends Validador{
    natural(usuarioNatural){
        switch(Object.keys(usuarioNatural).length){
            case 16:
                if(this.campoVacio(usuarioNatural.primer_nombre) && this.campoVacio(usuarioNatural.primer_apellido) && this.campoVacio(usuarioNatural.cedula) 
                && this.tipo_cedula(usuarioNatural.tipo_cedula) && this.contrasena(usuarioNatural.contrasena) 
                && this.correo(usuarioNatural.correo_electronico) && this.rif(usuarioNatural.rif)){
                    return true
                }
                else{
                    return false
                }
            case 14:
                if(this.campoVacio(usuarioNatural.primer_nombre) && this.campoVacio(usuarioNatural.primer_apellido) && this.contrasena(usuarioNatural.contrasena) 
                && this.correo(usuarioNatural.correo_electronico) && this.rif(usuarioNatural.rif)){
                    return true
                }
                else{
                    return false
                }
        }
    }
    Empleado(usuarioEmpleado){
        switch(Object.keys(usuarioEmpleado).length){
            case 18:
                if(this.campoVacio(usuarioEmpleado.primer_nombre) && this.campoVacio(usuarioEmpleado.primer_apellido) && this.campoVacio(usuarioEmpleado.cedula) 
                && this.tipo_cedula(usuarioEmpleado.tipo_cedula) && this.contrasena(usuarioEmpleado.contrasena) 
                && this.correo(usuarioEmpleado.correo_electronico) && this.rif(usuarioEmpleado.rif)){
                    return true
                }
                else{
                    return false
                }
            case 15:
                if(this.campoVacio(usuarioEmpleado.primer_nombre) && this.campoVacio(usuarioEmpleado.primer_apellido) && this.contrasena(usuarioEmpleado.contrasena) 
                && this.correo(usuarioEmpleado.correo_electronico) && this.rif(usuarioEmpleado.rif)){
                    return true
                }
                else{
                    return false
                }
        }
    }

    Juridico(usuarioJuridico){
        if(this.campoVacio(usuarioJuridico.denominacion_comercial) && this.campoVacio(usuarioJuridico.razon_social) && 
        this.pagina_web(usuarioJuridico.pagina_web) && this.campoVacio(usuarioJuridico.capital_disponible) && this.contrasena(usuarioJuridico.contrasena)){
            return true
        }
        else{
            return false
        }
    }
    telefonos(usuarioTelefono){
        if(this.telefono(usuarioTelefono.telefono) && this.telefono(usuarioTelefono.celular) && 
        this.prefijo(usuarioTelefono.prefijo_celular) && this.prefijo(usuarioTelefono.prefijo_telefono)){
            return true
        }
        else{
            return false
        }
    }
    PersonaContacto(UsuarioPersonaContacto){
        let persona = {}
        persona['nombre'] = UsuarioPersonaContacto.persona_contacto_nombre
        persona['primer_apellido'] = UsuarioPersonaContacto.persona_contacto_primer_apellido
        persona['segundo_apellido'] = UsuarioPersonaContacto.persona_contacto_segundo_apellido
        persona['telefono'] = UsuarioPersonaContacto.persona_contacto_telefono
        persona['prefijo_telefono'] = UsuarioPersonaContacto.persona_contacto_prefijo_telefono
        persona['celular'] = UsuarioPersonaContacto.persona_contacto_celular
        persona['prefijo_celular'] = UsuarioPersonaContacto.persona_contacto_prefijo_celular
        if(this.telefonos(persona) && this.campoVacio(persona.nombre) && this.campoVacio(persona.primer_apellido)){
            return true
        }
        else{
            return false
        }
    }

}

validador = new Validador()

class Contenedor{
    constructor(rif){
        this.rif = rif
        this.contenedor = []
    }
    async buscarHorarioEmpleado(){
        let horario = await readEmpleadoHorario(this.rif)
        if(horario != null && horario != undefined && Object.keys(horario).length != 0){
            for(var i=0; i<Object.keys(horario).length; i++){
                this.contenedor.push(await (new Horario(horario[i].fk_horario)).buscarHorario())
            }
            return true
        }
        else{
            return false
        }
    }
    async ordenarHorario(horario){
        var obj = JSON.parse(horario)
        if(Object.keys(obj).length > 0){
            console.log(obj + 'HORARIO')
            for(let i=0; i<Object.keys(obj).length; i++){
                if(validador.hora(obj[i].hora_inicio) && validador.hora(obj[i].hora_fin)){
                    this.contenedor.push(await (new Horario('', obj[i].dia, obj[i].hora_inicio, obj[i].hora_fin,)).buscarHorarioSinId())
                }
            }
            return true
        }
        else{
            return false
        }
    }
    async eliminarListaProducto(id, tipo){
        let producto = await readListaProducto(id, tipo)
        if(await deleteListaProducto(id, tipo) == producto.length){
            return true
        }
        else{
            return false
        }
    }

    async ordenarProducto(producto){
        var obj = JSON.parse(producto)
        if(Object.keys(obj).length > 0){
            for(let i=0; i<Object.keys(obj).length; i++){
                let producto = await (new Producto(obj[i].id)).buscarProductoId()
                producto.cantidad = obj[i].cantidad
                this.contenedor.push(producto)
            }
            return true
        }
        else{
            return false
        }
    }

    async buscarTodosProductos(operaciones){
        for(let i=0; i<Object.keys(operaciones).length; i++){
            this.contenedor.push(await readListaProducto(operaciones[i].operacion_id, 'operacion'))
        }
    }

    async buscarTodosEstados(operaciones){
        for(let i=0; i<Object.keys(operaciones).length; i++){
            this.contenedor.push(await readOperacionEstatusOPID(operaciones[i].operacion_id))
        }
    }

    async ordenarMetodos(metodos, rif, tipo){
        let obj = JSON.parse(metodos)
        let metodo = new TipoPago()
        for(let i=0; i<Object.keys(obj).length; i++){
            this.contenedor.push(await metodo.crearMetodo(obj[i]))
            if(!(await this.contenedor[i].calcular(rif, tipo))){
                return false
            }
        }
        return true
    }

    async insertarMetodos(rif, tipo){
        for(let i=0; i<this.contenedor.length; i++){
            await this.contenedor[i].insertarMetodo(rif, tipo)
        }
    }

}

class Horario{
    constructor(id, dia, hora_inicio, hora_fin){
        this.id = id
        this.dia = dia
        this.hora_inicio = hora_inicio
        this.hora_fin = hora_fin
    }
    async buscarHorario(){
        let horaRegistrada = (await readHorario(this.id))[0]
        this.dia = horaRegistrada.dia
        this.hora_inicio = horaRegistrada.hora_inicio
        this.hora_fin = horaRegistrada.hora_fin
        return this
    }

    async buscarHorarioSinId(){
        console.log(await readHorarioSinId(this))
        console.log('HORARIO SIN ID')
        let horaRegistrada = (await readHorarioSinId(this))[0]
        this.id = horaRegistrada.horario_id
        return this
    }

    async insertarEmpleadoHorario(rif, horarios){
        if(horarios.length > 0){
            var contador = 0
            for(var i=0; i<horarios.length;i++){
                contador+=(await insertEmpleadoHorario(rif, horarios[i].id))                  
            }
            if(contador == horarios.length){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }

    async actualizarHorario(rif, horarios){
        if((await readEmpleadoHorario(rif)).length > 0){
            if(this.eliminarHorario(rif)){
                if(this.insertarEmpleadoHorario(rif, horarios)){
                    return true
                }
                else{
                    return false
                }
            }
            else{
                return false
            }
        }
    }

    async eliminarHorario(rif){
        if(await deleteEmpleadoHorario(rif) > 0){
            return true
        }
        else{
            return false
        }
    }
}

class Lugar{
    constructor(parroquia, municipio, estado){
        this.parroquia = parroquia
        this.municipio = municipio
        this.estado = estado
    }
    async buscarLugar(clave_lugar){
        let lugar = (await readLugar(clave_lugar))[0]
        if(Object.keys(lugar).length == 3){
            this.parroquia = lugar.parroquia
            this.municipio = lugar.municipio
            this.estado = lugar.estado
            return true
        }
        else
        {
            return false
        }
    }
}

class Login{
    constructor(correo, contrasena, tipo){
        this.correo = correo
        this.contrasena = contrasena
        this.tipo = tipo
    }
    async buscarUsuario(){
        return await readUsuario(this)
    }
}

class Telefono{
    constructor(telefono, prefijo_telefono, celular, prefijo_celular){
        this.telefono = telefono
        this.celular = celular
        this.prefijo_telefono = prefijo_telefono
        this.prefijo_celular = prefijo_celular
    }
    async buscarTelefono(usuarioID, tipo){
        let telefono = (await readTelefono(usuarioID, tipo))[0]
        if(Object.keys(telefono).length > 0){
            this.telefono = telefono.numero_telefonico
            this.prefijo_telefono = telefono.prefijo
            return true
        }
        else{
            return false
        }
    }
    async buscarCelular(usuarioID, tipo){
        let celular = (await readCelular(usuarioID, tipo))[0]
        if(Object.keys(celular).length > 0){
            this.celular = celular.numero_telefonico
            this.prefijo_celular = celular.prefijo
            return true
        }
        else{
            return false
        }
    }
    async insertarTelefono(usuarioID, tipo){
        if((await validador.existeTelefono(this.telefono, this.prefijo_telefono, usuarioID, tipo)) == 0){
            if(await insertTelefono(this.telefono, this.prefijo_telefono, usuarioID, tipo) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async insertarCelular(usuarioID, tipo){
        if((await validador.existeTelefono(this.celular, this.prefijo_celular, usuarioID, tipo)) == 0){
            if(await insertTelefono(this.celular, this.prefijo_celular, usuarioID, tipo) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async actualizarTelefono(usuarioID, tipo){
        let telefonoActual = (await readTelefono(usuarioID, tipo))[0]
        if(telefonoActual != undefined){
            if(await updateTelefono(this.telefono, this.prefijo_telefono, usuarioID, tipo, telefonoActual.prefijo) ==1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async actualizarCelular(usuarioID, tipo){
        let celularActual = (await readCelular(usuarioID, tipo))[0]
        if(celularActual != undefined){
            if(await updateTelefono(this.celular, this.prefijo_celular, usuarioID, tipo, celularActual.prefijo) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async eliminarTelefono(usuarioID, tipo){
        if(await deleteTelefono(usuarioID, tipo) == 2){
            return true
        }
        else{
            return false
        }
    }
}

class Usuario{
    constructor(rif, correo_electronico, contrasena){
        this.rif = rif
        this.correo_electronico = correo_electronico
        this.contrasena = contrasena
    }
    async usuarioExiste(){
        return (await readUsuario(this.rif, this.tipo_usuario_tabla))[0]
    }
    async crearUsuario(tipo){
        switch(tipo){
            case 'natural':
                return new Natural()
            case 'juridico':
                return new Juridico()
            case 'empleado':
                return new Empleado()
        }
    }
}

class Natural extends Usuario {
    constructor(rif, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, tipo_cedula){
        super(rif, correo_electronico, contrasena)
        this.primer_nombre = primer_nombre
        this.segundo_nombre = segundo_nombre
        this.primer_apellido = primer_apellido
        this.segundo_apellido = segundo_apellido
        this.cedula = cedula
        this.tipo_cedula = tipo_cedula
        this.tipo_usuario_tabla = '\"NATURAL\"'
        this.tipo_usuario = 'natural'
        this.lugar
        this.telefono
    }
    async usuarioExiste(){
        let usuario = await super.usuarioExiste()
        if(Object.keys(usuario).length > 0){
            this.primer_nombre = usuario.primer_nombre
            this.segundo_nombre = usuario.segundo_nombre
            this.primer_apellido = usuario.primer_apellido
            this.segundo_apellido = usuario.segundo_apellido
            this.cedula = usuario.cedula_identidad
            this.tipo_cedula = usuario.tipo_cedula
            this.correo_electronico = usuario.correo_electronico
            this.contrasena = usuario.contrasena
            this.lugar = new Lugar()
            this.telefono = new Telefono()
            if((await this.lugar.buscarLugar(usuario.fk_lugar)) && (await this.telefono.buscarTelefono(this.rif, this.tipo_usuario) &&
            (await this.telefono.buscarCelular(this.rif, this.tipo_usuario)))){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async insertarUsuario(){
        if (this != undefined && !(await validador.existeCorreo(this.correo_electronico, this.tipo_usuario_tabla)) && 
        !(await validador.existeRif(this.rif, this.tipo_usuario_tabla)) && (await validador.existeLugar(this.lugar)>0)){
            if(await insertUsuarioNatural(this) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async actualizarUsuario(){
        if (this != undefined && (await validador.existeRif(this.rif, this.tipo_usuario_tabla)) && (await validador.existeLugar(this.lugar) > 0)){
            let usuario = (await readUsuario(this.rif, this.tipo_usuario_tabla))[0]
            if(usuario.correo_electronico == this.correo_electronico){
                if(await updateUsuarioNatural(this) == 1){
                    return true
                }
                else{
                    return false
                }
            }
            else if (!(await validador.existeCorreo(this.correo_electronico, this.tipo_usuario_tabla))){
                if(await updateUsuarioNatural(this) == 1){
                    return true
                }
                else{
                    return false
                }
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async eliminarUsuario(){
        if (this != undefined && (await validador.existeRif(this.rif, this.tipo_usuario_tabla))){
            if(await deleteUsuarioNatural(this) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
}

class Juridico extends Usuario{
    constructor(rif, correo_electronico, contrasena, denominacion_comercial, razon_social, pagina_web, capital_disponible){
            super(rif, correo_electronico, contrasena)
            this.denominacion_comercial = denominacion_comercial
            this.razon_social = razon_social
            this.pagina_web = pagina_web
            this.capital_disponible = capital_disponible
            this.tipo_usuario_tabla = '\"JURIDICO\"'
            this.tipo_usuario = 'juridico'
            this.lugar
            this.telefono
            this.persona_contacto
            this.rubro
    }
    async usuarioExiste(){
        let usuario = await super.usuarioExiste()
        if(Object.keys(usuario).length > 0){
            this.denominacion_comercial = usuario.denominacion_comercial
            this.correo_electronico = usuario.correo_electronico
            this.contrasena = usuario.contrasena
            this.razon_social = usuario.razon_social
            this.pagina_web = usuario.pagina_web
            this.capital_disponible = usuario.capital_disponible
            this.lugar = new Lugar()
            this.telefono = new Telefono()
            this.persona_contacto = new PersonaContacto()
            if((await this.lugar.buscarLugar(usuario.fk_lugar)) && (await this.telefono.buscarTelefono(this.rif, this.tipo_usuario) &&
            (await this.telefono.buscarCelular(this.rif, this.tipo_usuario)) && ( await this.persona_contacto.personaExiste(this.rif)))){
               return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async insertarUsuario(){
        if (this != undefined && !(await validador.existeCorreo(this.correo_electronico, this.tipo_usuario_tabla)) && 
        !(await validador.existeRif(this.rif, this.tipo_usuario_tabla)) && (await validador.existeLugar(this.lugar)>0)){
            if(await insertUsuarioJuridico(this) == 1){
                return true
            }
            else{
                return false
            }
        }
    }
    async actualizarUsuario(){
        if (this != undefined && (await validador.existeRif(this.rif, this.tipo_usuario_tabla)) && (await validador.existeLugar(this.lugar) > 0)){
            let usuario = (await readUsuario(this.rif, this.tipo_usuario_tabla))[0]
            if(usuario.correo_electronico == this.correo_electronico){
                if(await updateUsuarioJuridico(this) == 1){
                    return true
                }
                else{
                    return false
                }
            }
            else if (!(await validador.existeCorreo(this.correo_electronico, this.tipo_usuario_tabla))){
                if(await updateUsuarioJuridico(this) == 1){
                    return true
                }
                else{
                    return false
                }
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async eliminarUsuario(){
        if (this != undefined && (await validador.existeRif(this.rif, this.tipo_usuario_tabla))){
            if(await deleteUsuarioJuridico(this) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async insertarProveedor(){
        if(this.rubro != null && this.rubro != undefined && this.rubro != ''){
            if(await insertProveedor(this) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async eliminarProveedor(){
        if(await deleteProveedor(this) == 1){
            return true
        }
        else{
            return false
        }
    }
}

class PersonaContacto{
    constructor(nombre, primer_apellido,segundo_apellido){
            this.id
            this.nombre = nombre
            this.primer_apellido = primer_apellido
            this.segundo_apellido = segundo_apellido
            this.tipo_usuario = 'persona_contacto'
            this.telefono
        }
    async idPersona(rif_juridico){
        this.id = (await readPersonaContacto(rif_juridico))[0].persona_id
    }
    
    async personaExiste(rif_juridico){
        let usuario = (await readPersonaContacto(rif_juridico))[0]
        if(Object.keys(usuario).length == 5){
            this.nombre = usuario.nombre
            this.primer_apellido = usuario.primer_apellido
            this.segundo_apellido = usuario.segundo_apellido
            this.id = usuario.persona_id
            this.telefono = new Telefono()
            if((await this.telefono.buscarTelefono(this.id, this.tipo_usuario)) && (await this.telefono.buscarCelular(this.id, this.tipo_usuario))){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async insertarPersonaContacto(rif_juridico){
        let UsuarioPersonaContacto = (await readPersonaContacto(rif_juridico))[0]
        if(UsuarioPersonaContacto == undefined || UsuarioPersonaContacto == null){
            if(await insertPersonaContacto(this, rif_juridico) == 1){
                await this.idPersona(rif_juridico)
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async actualizarPersonaContacto(rif_juridico){
        if (this != undefined){
            let personaContacto = (await readPersonaContacto(rif_juridico))[0]
            if(Object.keys(personaContacto).length == 5){
                this.idPersona(rif_juridico)
                if(await updatePersonaContacto(this, rif_juridico) == 1){
                    return true
                }
                else{
                    return false
                }
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async eliminarPersonaContacto(rif_juridico){
        if (this != undefined){
            if(await deletePersonaContacto(rif_juridico) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
}

class Empleado extends Usuario{
    constructor(rif, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, tipo_cedula){
        super(rif, correo_electronico, contrasena)
        this.primer_nombre = primer_nombre
        this.segundo_nombre = segundo_nombre
        this.primer_apellido = primer_apellido
        this.segundo_apellido = segundo_apellido
        this.cedula = cedula
        this.tipo_cedula = tipo_cedula
        this.fecha_ingreso
        this.fecha_egreso
        this.tipo_usuario = 'empleado'
        this.tipo_usuario_tabla = '\"EMPLEADO\"'
        this.lugar
        this.telefono
        this.horario
    }
    async asignarTienda(tienda_id){
        if(await updateUsuarioEmpleadoTienda(tienda_id, this.rif)){
            return true
        }
        else{
            return false
        }
    }

    async usuarioExiste(){
        let usuario = await super.usuarioExiste()
        if(Object.keys(usuario).length > 0){
            this.primer_nombre = usuario.primer_nombre
            this.segundo_nombre = usuario.segundo_nombre
            this.primer_apellido = usuario.primer_apellido
            this.segundo_apellido = usuario.segundo_apellido
            this.cedula = usuario.cedula_identidad
            this.tipo_cedula = usuario.tipo_cedula
            this.correo_electronico = usuario.correo_electronico
            this.contrasena = usuario.contrasena
            this.fecha_ingreso = usuario.fecha_ingreso
            this.fecha_egreso = usuario.fecha_egreso
            this.lugar = new Lugar()
            this.telefono = new Telefono()
            this.horario = []
            if((await this.lugar.buscarLugar(usuario.fk_lugar)) && (await this.telefono.buscarTelefono(this.rif, this.tipo_usuario) &&
            (await this.telefono.buscarCelular(this.rif, this.tipo_usuario)))){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async insertarUsuario(){
        if (this != undefined && !(await validador.existeCorreo(this.correo_electronico, this.tipo_usuario_tabla)) && 
        !(await validador.existeRif(this.rif, this.tipo_usuario_tabla)) && (await validador.existeLugar(this.lugar)>0)){
            if(await insertUsuarioEmpleado(this) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async actualizarUsuario(){
        if (this != undefined && (await validador.existeRif(this.rif, this.tipo_usuario_tabla)) && (await validador.existeLugar(this.lugar) > 0)){
            let usuario = (await readUsuario(this.rif, this.tipo_usuario_tabla))[0]
            if(usuario.correo_electronico == this.correo_electronico){
                if(await updateUsuarioEmpleado(this) == 1){
                    return true
                }
                else{
                    return false
                }
            }
            else if (!(await validador.existeCorreo(this.correo_electronico, this.tipo_usuario_tabla))){
                if(await updateUsuarioEmpleado(this) == 1){
                    return true
                }
                else{
                    return false
                }
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async eliminarUsuario(){
        if (this != undefined && (await validador.existeRif(this.rif, this.tipo_usuario_tabla))){
            if(await deleteUsuarioEmpleado(this) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async insertarEmpleadoCargo(cargo){
        if(await insertEmpleadoCargo(this.rif, cargo) == 1){
            return true
        }
        else{
            return false
        }
    }
    async actualizarEmpleadoCargo(cargo, fecha){
        if(await updateEmpleadoCargo(this.rif, cargo, fecha) >= 0){
            return true
        }
        else{
            return false
        }
    }
    async buscarCargos(){
        return await readEmpleadoCargo(this.rif)
    }
    async eliminarEmpleadoCargo(){
        if(await deleteEmpleadoCargo(this.rif) >= 0){
            return true
        }
        else{
            return false
        }
    }
}

class TipoPago{
    constructor(fecha){
        this.fecha = fecha
    }
    async crearMetodo(metodo){
        switch(metodo.tipo_metodo){
            case 'tarjeta': 
                let pago1 = new Tarjeta()
                pago1.llenarObjeto(metodo)
                return pago1
            case 'cheque': 
                let pago2 = new Cheque()
                pago2.llenarObjeto(metodo)
                return pago2
            case 'canje': 
                let pago3 = new Canje()
                pago3.llenarObjeto(metodo)
                return pago3
            case 'moneda': 
                let pago4 = new Moneda()
                pago4.llenarObjeto(metodo)
                return pago4
        }
    }
}

class Tarjeta extends TipoPago{
    constructor(fecha, numero_tarjeta, empresa, mes_caducidad, anho_caducidad, nombre_tarjeta, tipo){
        super(fecha)
        this.numero_tarjeta = numero_tarjeta
        this.empresa = empresa
        this.mes_caducidad = mes_caducidad
        this.anho_caducidad = anho_caducidad
        this.nombre_tarjeta = nombre_tarjeta
        this.tipo = tipo
    }
    async insertarMetodo(rif, tipo){
        if(await insertTarjeta(this, rif, tipo) == 1){
            return true
        }
        else{
            return false
        }
    }
    async llenarObjeto(metodo){
        this.numero_tarjeta = metodo.numero_tarjeta
        this.empresa = metodo.empresa
        this.mes_caducidad = metodo.mes_caducidad
        this.anho_caducidad = metodo.anho_caducidad
        this.nombre_tarjeta = metodo.nombre_tarjeta
        this.tipo = metodo.tipo
    }
    async calcular(rif, tipo){
        return true
    }
}

class Cheque extends TipoPago{
    constructor(fecha, numero_confirmacion, nombre_banco){
        super(fecha)
        this.numero_confirmacion = numero_confirmacion
        this.nombre_banco = nombre_banco
    }
    async insertarMetodo(rif, tipo){
        if(await insertCheque(this, rif, tipo) == 1){
            return true
        }
        else{
            return false
        }
    }
    async llenarObjeto(metodo){
        this.numero_confirmacion = metodo.numero_confirmacion
        this.nombre_banco = metodo.nombre_banco
    }
    async calcular(rif, tipo){
        return true
    }
}

class Moneda extends TipoPago{
    constructor(fecha, tipo, cambio){
        super(fecha)
        this.tipo = tipo
        this.cambio = cambio
    }
    async insertarMetodo(rif, tipo){
        if(await insertMoneda(rif, tipo, this) == 1){
            let historico_id = (await readHistoricoDivisa(this.tipo))[0].historico_divisa_id
            let moneda_id = (await readMoneda(rif, tipo))[0].moneda_id
            if(await insertMonedaHistorico(moneda_id, historico_id) ==1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async llenarObjeto(metodo){
        this.tipo = metodo.tipo
        this.cambio = metodo.cambio
    }
    async calcular(rif, tipo){
        let monto = (await readHistoricoDivisa(this.tipo))[0].valor
        if(this.cambio%monto == 0){
            return true
        }
        else{
            return false
        }
    }
}

class Canje extends TipoPago{
    constructor(fecha, cantidad, cambio){
        super(fecha)
        this.cantidad = cantidad
        this.cambio = cambio
    }
    async insertarMetodo(rif, tipo){
        if(await insertCanje(this, rif, tipo) == 1){
            let puntohistorico = (await readHistoricoPunto())[0].historico_punto_id
            let punto = (await readPunto(rif, tipo))[0]
            let cantidadPuntos = punto.cantidad
            let puntoid = punto.punto_id
            if(await updatePunto(this.cantidad-cantidadPuntos, rif, tipo) == 1 && await insertPuntoHistorico(puntoid, puntohistorico) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async llenarObjeto(metodo){
        this.cantidad = metodo.cantidad
        this.cambio = metodo.cambio
    }
    async calcular(rif, tipo){
        let punto = new Punto()
        punto.buscarPuntos(rif, tipo)
        let monto = (await readHistoricoPunto())[0].reference_bolivares
        if(this.cambio%monto == 0 && punto.puntosSuficientes(this.cantidad)){
            return true
        }
        else{
            return false
        }
    }
}

class Punto{
    constructor(cantidad){
        cantidad = cantidad
    }
    async buscarPuntos(rif, tipo){
        let punto = await readPunto(rif, tipo)
        if(punto != null && punto != undefined && punto.length >0){
            this.cantidad = punto[0].cantidad
            return true
        }
        else{
            this.cantidad = 0
            return false
        }
    }
    puntosSuficientes(cantidad){
        if(this.cantidad >= cantidad){
            return true
        }
        else{
            return false
        }
    }
}

class Operacion{
    constructor(condiciones, fecha_orden, monto_total, fecha_entrega){
        this.id
        this.condiciones = condiciones
        this.fecha_orden = fecha_orden
        this.monto_total = monto_total
        this.fecha_entrega = fecha_entrega
        this.tipo = 'operacion'
    }

    async insertarTienda(tienda_id){
        await updateOperacionTienda(this.id, tienda_id)
    }

    async buscarOperacionId(){
        let operacion = (await readOperacionId(this.id))[0]
        this.condiciones = operacion.condiciones
        this.fecha_orden = operacion.fecha_orden
        this.monto_total = operacion.monto_total
    }

    async buscarEstadoOperacion(){
        let estado = (await readOperacionEstatusOPID(this.id))[0].fk_estatus
        return estado
    }

    async buscarTodos(tipo, rif){
        let operacion = await readOperaciones(tipo, rif)
        return operacion
    }

    async buscarOperacion(tipo, rif){
        let operacion = (await readOperacion(rif, tipo, this.fecha_orden))[0]
        this.id = operacion.operacion_id
    }

    async insertarOperacion(tipo, rif){
        if(await insertOperacion(this, tipo, rif)){
            this.buscarOperacion(tipo, rif)
            return true
        }
        else{
            return false
        }
    }

    async actualizarOperacion(tipo){
        if(tipo == 1){
            this.fecha_entrega = validador.obtenerHoraEntrega()
            await updateOperacion(this)
        }
        else if(tipo == 0){
            await updateOperacionSinFecha(this)
        }
        
    }
    async insertarOrden(listaProducto){
        for(let i=0; i< listaProducto.length; i++){
            await listaProducto[i].insertarListaProducto(this.id, this.tipo)        
        }
    }

    async eliminarOperacionEstatus(estatus_id){
        if(await deleteOperacionEstatus(this.id, estatus_id, this.fecha_orden)){
            return true
        }
        else{
            return false
        }
    }

    async eliminarOperacion(){
        if(await deleteOperacion(this) == 1){
            await deleteOperacionEstatus(this.id)
            await deleteListaProducto(this.id, this.tipo)
            return true
        }
        else{
            return false
        }
    }

    async insertarOperacionEstatus(estatus){
        if(await insertOperacionEstatus(this.id, estatus.id, this.fecha_orden) == 1){
            return true
        }
        else{
            return false
        }
    }

    async actualizarOperacionEstatus(estatus){
        if(await updateOperacionEstatus(this.id, estatus.id, this.fecha_orden)){
            return true
        }
        else{
            return false
        }
    }
}

class Estatus{
    constructor(id, tipo){
        this.id = id
        this.tipo = tipo
    }
    async buscarEstado(){
        let estado = (await readEstatus(this.tipo))[0]
        this.id = estado.estatus_id
    }
}

class Tienda{
    constructor(nombre, parroquia, municipio, estado){
        this.id
        this.nombre = nombre
        this.parroquia = parroquia
        this.municipio = municipio
        this.estado = estado
        this.zona = []
    }

    async crearOperacionDeReposicion(reponer){
        let producto = new Producto()
        let estado = new Estatus('', 'Pendiente')
        await estado.buscarEstado()
        producto.id = reponer.fk_producto
        await producto.buscarProductoId()
        let operacion = new Operacion('reposicion de inventario', validador.obtenerHora(), parseInt(producto.precio) * 10000)
        let operacion_id = (await insertOperacionInventario(operacion, reponer.fk_tienda))[0].operacion_id
        operacion.id = operacion_id
        operacion.fecha_orden = validador.obtenerHora()
        await operacion.insertarOperacionEstatus(estado)
        await insertListaProducto(operacion.id, 10000, operacion.tipo, reponer.fk_producto)
    }

    async reponerInventarioAlmacen(operacion_id){
        let operacion = new Operacion()
        let estado = new Estatus('', 'Recibido')
        await estado.buscarEstado()
        operacion.id = operacion_id
        await operacion.buscarOperacionId()
        let producto = (await readListaProducto(operacion.id, operacion.tipo))[0].fk_producto
        await updateAlmacenInventario(operacion.id, producto)
        await operacion.actualizarOperacion(1)
        if(await operacion.actualizarOperacionEstatus(estado)){
            return true
        }
        else{
            return false
        }
    }

    async checkInventarioAlmacen(){
        let reponer = await readAlmacenReponer()
        for(let i=0; i< reponer.length; i++){
            await this.crearOperacionDeReposicion(reponer[i])
        }
    }

    async reponerInventarioPasillo(producto){
        let product = JSON.parse(producto)
        for(let i=0; Object.keys(product).length; i++){
            await updateAlmacenCantidad(product[i].cantidad, this.id, product[i].id)
            await updatePasilloInventario(product[i].cantidad, product[i].id, this.id)
        }

    }

    async buscarTiendaConId(){
        if((await readTiendaId(this.id)).length > 0){
            return true
        }
        else{
            return false
        }
    }

    async actualizarTienda(){
        if(await updateTienda(this.nombre, this.id) == 1){
            return true
        }
        else{
            return false
        }
    }

    async buscarTodas(){
        return await readTiendaTodas()
    }

    async actualizarCantidadAlmacen(producto){
        let product = JSON.parse(producto)
        for(let i=0; i<Object.keys(product).length; i++){
            await updateAlmacenCantidad(product[i].cantidad, this.id, product[i].id)
        }
    }

    async actualizarCantidadPasillo(producto){
        let product = JSON.parse(producto)
        for(let i=0; i< Object.keys(product).length; i++){
            await updatePasilloCantidad(product[i].cantidad, product[i].id, this.id)
        }
    }

    async checkCantidadOrden(producto){
        let product = JSON.parse(producto)
        for(let i=0; i< Object.keys(product).length; i++){
          if(!(await this.hayInventarioAlmacen(product[i].id, product[i].cantidad))){
              return false
          }
        }
        return true
    }

    async hayInventarioAlmacen(producto_id, producto_cantidad){
        let cantidad = await readAlmacenInventario(this.id, producto_id)
        if(cantidad.length > 0){
            if(parseInt(cantidad[0].cantidad) >= parseInt(producto_cantidad)){
                return true
            }
            else{
                return false
            }
        }
    }

    async tiendaExiste(){
        if((await readTienda(this.nombre)).length > 0){
            return true
        }
        else{
            return false
        }
    }

    async buscarTienda(){
        this.id = (await readTienda(this.nombre))[0].tienda_id
    }

    async crearInventario(){
        let productos = await readProductos()
        await this.buscarTienda()
        for(let i=0; i<productos.length; i++){
            await this.insertarInventario(this.id, productos[i].producto_id, productos[i].categoria)
        }
    }

    async insertarInventario(tienda_id, producto_id, categoria){
        let almacen_id = (await insertAlmacen('100000', tienda_id, producto_id))[0].almacen_id
        let pasillo_id = (await insertPasillo('50', tienda_id, producto_id))[0].pasillo_id
        let zona_id = (await readZona(categoria))[0].zona_id
        if(await insertZonaPasillo(pasillo_id, zona_id) == 1 && await insertAlmacenZona(almacen_id, zona_id) == 1){
            return true
        }
        else{
            return false
        }
    }

    async insertarTienda(){
        if(await insertTienda(this.nombre, this.parroquia, this.municipio, this.estado)){
            return true
        }
        else{
            return false
        }
    }

    async eliminarTienda(){
        await this.buscarTienda()
        let almacenes = await readAlmacen(this.id)
        let pasillos = await readPasillo(this.id)
        for(let i=0; i<pasillos.length; i++){
            await deleteAlmacenZona(almacenes[i].almacen_id)
            await deleteZonaPasillo(pasillos[i].pasillo_id)
        }
        await deleteAlmacen(this.id)
        await deletePasillo(this.id)
        await deleteTienda(this.id)
    }
}

class Producto{
    constructor(id, imagen, nombre, precio, ucabmart, categoria){
        this.id = id
        this.imagen = imagen
        this.nombre = nombre
        this.precio = precio
        this.ucabmart = ucabmart
        this.categoria = categoria
        this.cantidad
    }

    async buscarProductoId(){
        let producto = (await readProductoId(this))[0]
        if(producto != null){
            if(Object.keys(producto).length > 0){
                this.imagen = producto.imagen
                this.nombre = producto.nombre
                this.precio = producto.precio
                this.ucabmart = producto.ucabmart
                this.categoria = producto.categoria
                return this
            }
        }
        else{
            return null
        }
    }
    async buscarProductoSinId(){
        let producto = (await readProductoSinId(this))[0]
        if(Object.keys(producto).length > 0){
            this.id = producto.producto_id
            return this
        }
        else{
            return null
        }
    }
    async insertarProducto(rif){
        if(await insertProducto(this) == 1){
            await this.buscarProductoSinId()
            if(await insertJuridicoProducto(rif, this.id)){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }

    async actualizarProducto(){
        if(await updateProducto(this) ==1){
            return true
        }
        else{
            return false
        }
    }
    async eliminarProducto(rif){
        if(this.id != undefined && this.id != null && this.id != ''){
            if(await deleteJuridicoProductoPID(this.id) == 1){
                if(await deleteProductoEnListaProducto(this.id) >= 0){
                    return true
                }
                else{
                    return false
                }
            }
            else{
                return false
            }
        }
        else if(rif != undefined && rif != null && rif != '' && validador.existeRif(rif, '\"JURIDICO\"')){
            if(await deleteJuridicoProductoRIF(rif) == 1){
                if(await deleteProductoEnListaProducto(this.id) >= 0){
                    return true
                }
                else{
                    return false
                }
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async insertarListaProducto(id, tipo){
        if(await insertListaProducto(id, this.cantidad, tipo, this.id) == 1){
            return true
        }
        else{
            return false
        }
    }
}

exports.ValidadorUsuario = ValidadorUsuario
exports.Empleado = Empleado
exports.Natural = Natural
exports.Lugar = Lugar
exports.Telefono = Telefono
exports.Login = Login
exports.Juridico = Juridico
exports.PersonaContacto = PersonaContacto
exports.Contenedor = Contenedor
exports.Horario = Horario
exports.Producto = Producto
exports.Operacion = Operacion
exports.Estatus = Estatus
exports.Usuario = Usuario
exports.Punto = Punto
exports.Tienda = Tienda